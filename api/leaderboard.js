import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// 테이블명: 환경변수에 TETRIS_TABLE이 있으면 사용, 기본값은 'tetris_leaderboard' (실패 시 'leaderboard' 테이블 폴백 지원)
const PRIMARY_TABLE = process.env.TETRIS_TABLE || 'tetris_leaderboard';

function validScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 9_999_999;
}

function sanitizeName(value) {
  return String(value || '').trim().slice(0, 12).replace(/[<>]/g, '');
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (!supabase) {
    return response.status(503).json({ error: 'Leaderboard database is not configured.' });
  }

  try {
    if (request.method === 'GET') {
      const name = sanitizeName(request.query?.name);

      // Primary table 시도 후 fallback table
      let topScores = null;
      let topError = null;

      const res = await supabase
        .from(PRIMARY_TABLE)
        .select('*')
        .order('score', { ascending: false })
        .order('played_at', { ascending: true })
        .limit(10);

      topScores = res.data;
      topError = res.error;

      // 만약 primary 테이블이 없거나 에러라면 'leaderboard' 테이블 시도
      if (topError && PRIMARY_TABLE !== 'leaderboard') {
        const fallbackRes = await supabase
          .from('leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .order('played_at', { ascending: true })
          .limit(10);
        
        if (!fallbackRes.error) {
          topScores = fallbackRes.data;
          topError = null;
        }
      }

      if (topError) throw topError;

      let personalBest = null;
      if (name) {
        const { data: userData, error: userError } = await supabase
          .from(PRIMARY_TABLE)
          .select('score')
          .ilike('name', name)
          .maybeSingle();

        if (!userError && userData) {
          personalBest = userData.score;
        }
      }

      return response.status(200).json({
        scores: topScores || [],
        personalBest
      });
    }

    if (request.method === 'POST') {
      const { name, score, round = 1, lines = 0 } = request.body || {};
      const cleanName = sanitizeName(name);
      const numericScore = Number(score);
      const numericRound = Number(round) || 1;
      const numericLines = Number(lines) || 0;

      if (!cleanName || !validScore(numericScore)) {
        return response.status(400).json({ error: 'Invalid name or score.' });
      }

      // 테이블 확인 및 대상 테이블 선택
      let targetTable = PRIMARY_TABLE;
      let { data: existingUser, error: checkError } = await supabase
        .from(targetTable)
        .select('*')
        .ilike('name', cleanName)
        .maybeSingle();

      if (checkError && targetTable !== 'leaderboard') {
        targetTable = 'leaderboard';
        const fbCheck = await supabase
          .from(targetTable)
          .select('*')
          .ilike('name', cleanName)
          .maybeSingle();
        existingUser = fbCheck.data;
        checkError = fbCheck.error;
      }

      if (checkError) throw checkError;

      let finalBest = numericScore;

      const recordData = {
        name: cleanName,
        score: numericScore,
        round_reached: numericRound,
        lines_cleared: numericLines,
        played_at: new Date().toISOString()
      };

      if (!existingUser) {
        // 테이블 컬럼 호환성(round_reached, lines_cleared가 없을 경우 대비)
        let { error: insertError } = await supabase
          .from(targetTable)
          .insert(recordData);

        if (insertError) {
          // 컬럼이 다를 수 있으므로 기본 필드만 시도
          const basicData = {
            name: cleanName,
            score: numericScore,
            played_at: new Date().toISOString()
          };
          const fbInsert = await supabase.from(targetTable).insert(basicData);
          if (fbInsert.error) throw fbInsert.error;
        }
      } else if (numericScore > existingUser.score) {
        let { error: updateError } = await supabase
          .from(targetTable)
          .update(recordData)
          .ilike('name', cleanName);

        if (updateError) {
          const basicUpdate = {
            score: numericScore,
            played_at: new Date().toISOString()
          };
          const fbUpdate = await supabase.from(targetTable).update(basicUpdate).ilike('name', cleanName);
          if (fbUpdate.error) throw fbUpdate.error;
        }
      } else {
        finalBest = existingUser.score;
      }

      const { data: nextTop, error: fetchError } = await supabase
        .from(targetTable)
        .select('*')
        .order('score', { ascending: false })
        .order('played_at', { ascending: true })
        .limit(10);

      if (fetchError) throw fetchError;

      return response.status(201).json({
        scores: nextTop || [],
        personalBest: finalBest
      });
    }

    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    console.error('Supabase Leaderboard Error:', error);
    return response.status(500).json({ error: 'Could not update leaderboard.' });
  }
}
