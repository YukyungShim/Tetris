# 🕹️ TETRIS

> made by Yukyung, Shim

라운드 기반 스테이지 모드와 글로우 효과 UI를 갖춘 웹 테트리스 게임입니다.

---
 
## 🌟 주요 특징

1. **아케이드 스테이지(Round) 모드**
   - 무한 모드가 아닌 **'남은 줄 수(Lines Left)'** 목표 클리어 시스템 (라운드당 15줄 클리어 시 다음 라운드 진출)
   - **스테이지별 맵(Pre-placed Garbage Blocks) 시스템**: 특정 라운드(R4, R7, R10, R13, R16, R19, R21+) 시작 시 피라미드, 체커보드, 성벽, 지그재그 등 다채로운 장애물 맵 자동 생성
   - 라운드가 올라갈수록 중력 낙하 속도(Gravity) 가속

2. **시각/음향 효과**
   - `Black Ops One` & `Space Mono` 타이포그래피 및 글래스모피즘 UI
   - 테트로미노별 시그니처 글로우 렌더링 + 베벨 하이라이트
   - 고스트 피스(Ghost Piece / 착지 예상 위치 가이드)
   - 하드 드롭 충격파 파티클, 라인 클리어 레이저 빔 및 화면 흔들림(Screen Shake)
   - 외부 파일 다운로드가 필요 없는 **Web Audio API 신스웨이브 SFX 사운드 시스템** (이동, 회전, 하드드롭, 라인클리어, 4줄 테트리스 팡파레 등)

3. **3구역 아케이드 캐비닛 레이아웃**
   - **좌측 패널**: HOLD 보관소, NEXT 블록(1~3개) 큐, 조작 가이드
   - **중앙 패널**: 10x20 메인 캔버스 보드, 라운드/남은 줄 수 뱃지, 점수, 시작/결과 모달, 모바일 온스크린 컨트롤러
   - **우측 통계(Stats) 패널**: 7가지 테트로미노(I, J, L, O, S, T, Z) 실시간 스폰 카운트 및 세로/가로형 히스토그램 막대 그래프
   - **글로벌 리더보드**: Supabase 연동 Top 10 랭킹 (로컬스토리지 자동 폴백 지원)

4. **테트리스 표준 메커니즘**
   - 7-Bag 무작위 큐 생성기
   - SRS (Super Rotation System) 4방향 회전 및 Wall Kick 지원
   - 콤보(Combo), Back-to-Back(B2B) 테트리스 보너스 점수 시스템
   - DAS (Delayed Auto Shift) 부드러운 연속 이동

---

## 🎮 조작법 (Controls)

| 동작 | 키보드 키 | 모바일/터치 |
| :--- | :--- | :--- |
| **좌/우 이동** | `←` / `→` 또는 `A` / `D` | `◀` / `▶` 버튼 |
| **소프트 드롭** | `↓` 또는 `S` | `▼` 버튼 |
| **하드 드롭** | `Space` | `⚡` 버튼 |
| **시계방향 회전** | `↑` 또는 `W` 또는 `X` | `↻` 버튼 |
| **반시계방향 회전** | `Z` 또는 `Ctrl` | - |
| **홀드 (Hold)** | `C` 또는 `Shift` | `⬒` 버튼 |
| **일시정지** | `P` 또는 `Esc` | `PAUSE` 버튼 |
| **사운드 켜기/끄기** | - | `🔊 SFX` 버튼 |

---

## 🚀 실행 및 배포 가이드

### 1. 로컬에서 실행하기
별도의 서버 없이 브라우저에서 `index.html` 파일을 더블클릭하여 바로 플레이할 수 있습니다. (로컬 스토리지 랭킹 지원)

### 2. Vercel & Supabase 개발 서버 실행
```bash
npm install
vercel dev
```

### 3. Supabase 리더보드 테이블 SQL
Supabase SQL Editor에서 아래 쿼리를 실행하여 테이블을 생성할 수 있습니다:

```sql
CREATE TABLE tetris_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(12) NOT NULL,
  score INT NOT NULL,
  round_reached INT DEFAULT 1,
  lines_cleared INT DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_tetris_leaderboard_score ON tetris_leaderboard (score DESC, played_at ASC);
```

### 4. Vercel 환경 변수 설정
- `SUPABASE_URL`: 프로젝트 URL
- `SUPABASE_ANON_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`: Supabase API Key
- `TETRIS_TABLE`: (선택) `tetris_leaderboard` (기본값)
