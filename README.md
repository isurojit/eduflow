# EduFlow

EduFlow is a production-oriented Smart Education Platform prototype built with Next.js, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, Zod and Zustand.

This repository currently completes **Phase 1 (Foundation)** and **Phase 2 (Landing + Onboarding)** of the product specification.

## What works now

- Premium dark-crimson landing page with restrained motion and parallax
- First-time user detection
- Four-step onboarding
- School and college paths
- Conditional academic fields
- Multi-subject selection
- Custom subject creation
- Zod validation and React Hook Form
- Versioned `eduflow:v1` browser persistence
- Repository-style initial state creation
- Starter syllabus only for supported subjects
- Honest handling of custom subjects (no fake official syllabus)
- Refresh-safe redirect to a personalized dashboard
- Dashboard empty states based only on real student state
- Responsive layout and reduced-motion support through Framer Motion

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand
- React Hook Form
- Zod
- Framer Motion
- Lucide React
- date-fns (installed for upcoming activity/calendar phases)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production checks:

```bash
npm run typecheck
npm run build
```

## Structure

```text
src/
  app/
    page.tsx
    onboarding/
    dashboard/
  components/
    common/
    landing/
    layout/
    onboarding/
  data/
    syllabus/
  features/
    onboarding/
  lib/
    storage/
    utils/
  store/
  types/
```

The structure is intentionally prepared to grow into `tests`, `planner`, `performance`, `focus`, `revision`, `flashcards`, `goals`, `achievements`, `calendar`, `notes`, `search`, `notifications`, and `ai` feature modules without turning the app into one monolithic component.

## Storage architecture

The prototype uses a single versioned browser key:

```text
eduflow:v1
```

`src/lib/storage/storage.ts` owns reads/writes. Components do not access localStorage directly.

The state shape currently contains profile, subjects, goals, daily activity, detailed test attempts, completed study sessions and exams. Future records such as notes, planner tasks and achievements should be added to this state and exposed through repository interfaces. Derived analytics are calculated from raw records rather than duplicated as stored statistics.

## Starter syllabus architecture

`src/data/syllabus/starter.ts` contains representative starter topic names for supported subjects. This is starter content, not an official board/university syllabus.

To add a supported subject, add a new entry:

```ts
starterSyllabus["New Subject"] = ["Topic A", "Topic B"]
```

Custom subjects are saved with an empty topic list and are explicitly identified as custom content.

## Question bank architecture (next milestone)

The test phase should add:

```text
src/data/questions/
  mathematics.ts
  physics.ts
  chemistry.ts
  biology.ts
  computer-science.ts
```

Every supported topic test must resolve **exactly 10** matching questions from `subjectId + topicId`, each with correct answer, explanation and revision hint. Unsupported custom subjects must not receive fabricated questions.

## AI provider architecture (planned)

Future implementation should introduce:

```text
src/lib/ai/
  provider.ts
  local-study.provider.ts
  openai.provider.ts
  gemini.provider.ts
```

The zero-cost default will be `LocalStudyProvider`. Real providers must be called through a server endpoint such as `/api/ai/chat`; secret keys must never be embedded in client JavaScript.

## Backend migration

The UI and feature logic should depend on repository interfaces. `Local*Repository` implementations can later be replaced by Supabase, Firebase, Prisma/PostgreSQL, MongoDB, REST or GraphQL adapters while preserving most frontend code.

## Deployment

After dependencies are installed and the checks pass, the app can be deployed to a free-tier Next.js-compatible host such as Vercel. No database or paid API is required for the current prototype.

## Phase 3 — Dashboard

Phase 3 replaces the onboarding handoff dashboard with a data-derived dashboard. It includes:

- Time-aware personalized greeting
- Real syllabus completion summary
- Today's progress from meaningful daily activity
- Total study time from completed focus sessions
- Test count and calculated average score
- Current and best streak calculations
- Starter daily plan derived from incomplete topics and subject health
- Subject health based only on actual test attempts
- Goal progress derived from activity/test records
- Smart recommendation logic with honest new-user fallbacks
- Upcoming exam countdown when an exam exists
- Recent activity based on persisted daily activity
- Performance-trend empty state until real test results exist
- Backward-compatible migration from the original Phase 1–2 state shape

The dashboard intentionally does not fabricate scores, streaks, study time, exams, or activity. Features that require later workspaces (such as starting a focus session or opening global search) are not exposed as active controls yet.


## Phase 4 — Subjects + Syllabus

Phase 4 adds the working syllabus layer:

- `/subjects` — all selected subjects with derived completion, study time, last studied, and performance status.
- `/subjects/[subjectId]` — subject syllabus with live completion, study/test summary, bookmarks, and custom topic creation.
- `/subjects/[subjectId]/topics/[topicId]` — topic workspace with persistent completion, important-topic bookmark, and learning history.
- Important Topics aggregates bookmarked topics across subjects.
- Topic completion updates the correct daily activity record; undoing completion removes that activity contribution.
- Progress is always derived from topic records and is never stored as a duplicate percentage.
- Starter syllabus content is explicitly labelled as starter content rather than an official board/university syllabus.
- Phase 5 test controls are intentionally not exposed as active UI until the real 10-question test engine exists.

## Phase 5 — Test Engine

Phase 5 adds the real topic assessment flow:

- Supported starter topics expose a 10-question test from the local question bank.
- Every normal test is exactly 10 questions, 1 mark each, 10 marks total.
- Answer selections persist while navigating and are kept in session storage during an in-progress test.
- Submission uses deterministic evaluation; no score is random or fabricated.
- Saved attempts include answer-level results, wrong/unanswered counts, explanations, revision hints, duration and topic metadata.
- `/tests` provides persistent history with subject, topic, date and score-range filters.
- `/tests/[attemptId]` reopens detailed mistake analysis.
- Completing a topic prompts the student to take a test when verified local content exists.
- Unsupported custom topics explicitly show that question content is unavailable instead of generating fake academic questions.

### Question-bank architecture

Seeded local questions are defined in `src/data/questions/blueprints.ts`. Each supported topic contains verified concept records that are compiled into ten topic-specific MCQs by `buildQuestions()`. The current starter syllabus has 40 supported topics across Mathematics, Physics, Chemistry, Biology, Computer Science, English, Accountancy and Economics.

To add a supported topic, add a topic blueprint with at least four concepts (five is recommended). The test engine enforces ten questions for normal topic tests. A future importer or AI provider can implement the same `TestQuestion` shape without changing the test UI.

### Phase 5 state migration

Persisted state is now schema version 3 while the browser storage key remains `eduflow:v1`. Earlier profile, subject, goal, activity, session and exam data migrate forward. Phase 4 did not create real attempts, so legacy pre-Phase-5 attempt placeholders are intentionally not treated as valid detailed attempts because they lack answer and mistake-analysis records.


## Phase 6 — Performance Engine

Phase 6 turns saved Phase 5 attempts into reusable, data-derived analytics:

- `/performance` — dedicated performance workspace with real KPIs and honest empty states.
- Total Tests, Average Score, Highest Score, Lowest Score and Total Study Time are calculated from persisted attempts/sessions.
- Score Trend uses the most recent real test attempts and never inserts sample points.
- Subject Performance calculates per-subject averages, latest score, attempt count and health.
- Subject Health thresholds follow the product contract: Strong >= 8/10, Needs Practice >= 5 and < 8, Weak < 5, and Not Enough Data when no attempts exist.
- Topic Performance ranks tested topics by actual averages, recent score, attempt count and latest-attempt trend.
- A single low topic attempt is treated as an early `Watch` signal rather than immediately labelling the topic Weak. Repeated low evidence can become Weak.
- Weekly Performance compares Monday–Sunday current and previous periods.
- Improvement uses `((current - previous) / previous) × 100` and returns insufficient-data state when the previous period is absent or zero.
- `calculateWeakTopics()` provides a reusable ranking for dashboard recommendations and later planner prioritisation.
- The Dashboard recommendation now consumes the same topic-health engine rather than maintaining separate weak-topic logic.
- Recharts is loaded dynamically for the Performance page so charting code is not required for the initial shell.

### Performance analytics API

The reusable engine lives in `src/lib/analytics/performance.ts` and exposes:

```text
calculateAverageScore()
calculateHighestScore()
calculateLowestScore()
calculateSubjectHealth()
calculateSubjectPerformance()
calculateTopicPerformance()
calculateWeakTopics()
calculateWeeklyPerformance()
calculateImprovement()
calculateScoreTrend()
calculatePerformanceSnapshot()
```

These functions are pure calculations over persisted records. Future planner and recommendation phases should consume these functions rather than store separate analytics values.

## Phase 7 — Smart Study Planner

Phase 7 adds a data-driven `/planner` workspace. The planner is derived from raw EduFlow activity rather than storing a second copy of academic progress.

### Priority engine

The planner uses an explainable score inspired by the product specification:

```text
priority =
  weaknessScore * 4
  + examUrgency * 3
  + incompleteWeight * 2
  + goalRisk * 2
  + staleTopicWeight
  + bookmark/order signals
```

Exam urgency uses these bands:

- 0–7 days: very high
- 8–14 days: high
- 15–30 days: moderate
- More than 30 days: normal

Repeated weak test evidence receives the strongest academic weight. Completed topics can return as revision tasks when their performance remains weak. The planner also avoids immediately re-scheduling a task already completed from the current day's plan.

### Planner state

Only planner preferences and handoff state are persisted:

- available study minutes
- active subject/topic/task
- prepared 25-minute focus block
- planner tasks completed today

The actual plan itself is recalculated from tests, topics, exams, goals, bookmarks and study history so it cannot drift out of sync with the rest of EduFlow.

### Study Now

`Study Now` marks the chosen planner task active, prepares a 25-minute focus block, and opens the exact topic workspace. Phase 8 can attach the timestamp-based Pomodoro engine to this persisted handoff.

### Exams

The Planner includes a functional exam form so exam-driven prioritization can be exercised now. Exam dates are validated and at least one existing subject must be selected.

Persisted browser state is now schema version `4`; older Phase 1–6 state migrates without deleting profiles, subjects, topics, tests, sessions, goals or exams.

## Phase 8 — Focus System

EduFlow now includes a persisted Pomodoro/focus workflow at `/focus`.

- Topic workspaces expose **Start Focus Session**.
- Planner **Study Now** prepares the exact planner topic and opens Focus Mode.
- Default focus duration is 25 minutes; the break cycle is 5 minutes.
- Timer state is timestamp-based (`runStartedAt`/`endsAt`) rather than interval-decrement based, so tab throttling, route navigation and reloads reconstruct the correct remaining time.
- Start, Pause, Resume and Reset are functional.
- Leaving the Focus page does not cancel a running timer.
- Only a completed focus block creates a `StudySession` and adds `focusSeconds` to daily activity.
- Completed focus time therefore updates dashboard study time, goals, streaks and calendar-ready activity from the same persisted source of truth.
- A completed planner focus block marks that planner task complete for the day.
- After focus completion, EduFlow offers a real 5-minute break. Break time is not counted as study time.
- Storage is now state version 5 and migrates version 1–4 data forward with `activeFocus: null`.

Active timer state is represented separately from completed study history. This keeps interrupted/in-progress sessions from inflating analytics.

## Phase 9 — Revision + Flashcards

Phase 9 adds active-recall and concise revision tools on top of the verified starter concept bank used by the Phase 5 tests.

### Revision
- `/revision` lists supported topics, with completed topics ordered first.
- `/revision/[subjectId]/[topicId]` provides a concise topic revision workspace.
- Revision content includes a short summary, important concepts, key definitions, formulas where applicable, common mistakes, key points, and quick recall questions.
- Test mistake analysis now links directly to the matching revision workspace.
- Unsupported custom topics show an explicit unavailable state; EduFlow does not invent academic notes.

### Flashcards
- `/flashcards` lists available decks across the student's selected subjects.
- `/flashcards/[subjectId]/[topicId]` provides an interactive flip-card study flow.
- Controls include Previous, Next, Shuffle, Know it, Review again, and Reset progress.
- Flashcard status and last-seen position persist locally.
- The deck content is derived from the same verified topic concepts used by the local test bank, keeping revision, flashcards, and assessment terminology aligned.

### Persistence
The consolidated local state is now version 6 and adds `flashcardProgress`. Version 5 and earlier supported states migrate forward without deleting existing profile, syllabus, test, planner, focus, exam, goal, or activity records.

## Phase 10 — Goals, Achievements & Streak

Phase 10 adds three activity-driven systems without introducing manual progress counters:

- `/goals` — create/delete daily or weekly study-minute, topic, test and score goals. Progress is derived from `dailyActivity` and submitted tests.
- `/achievements` — six required achievements: First Test, 7-Day Streak, 10 Topics Completed, 90% Score, Perfect 10 and 30-Day Streak. Unlocks are persisted once with the first qualifying timestamp.
- `/streak` — current streak, best streak, last active date and a 14-day activity rhythm. A day counts only when a topic, test or completed focus session records meaningful activity.

Persistence is now state version 7. Older state versions migrate forward with an empty achievement registry, then the achievement reconciler restores any historical unlocks supported by existing test/topic/activity history.

## Phase 11 — Calendar + Notes

Phase 11 adds two persistent study-management workspaces without duplicating activity data.

### Study Calendar

- `/calendar` renders a responsive monthly calendar.
- Calendar markers are derived from real saved data: completed focus time, topic completions, submitted tests and daily-goal completion.
- Clicking a date shows study minutes, completed topics, tests and scores, goal status and whether the date counted toward the streak.
- Missed study days are shown only after the student's profile creation date.
- Calendar progress is derived rather than stored separately, preventing drift from the dashboard, streak and test history.

### Notes

- `/notes` supports create, edit, delete and search.
- Notes can optionally link to a subject and exact topic.
- Topic workspaces expose an `Add note` action that preselects that topic in the Notes editor.
- Search matches title, body, subject name and topic name.
- Blank note bodies and invalid subject/topic references are rejected.
- Notes store `createdAt` and `updatedAt` timestamps and persist through the central EduFlow storage adapter.

### Persistence

Phase 11 upgrades the consolidated persisted state to version `8` and adds a `notes` collection. Existing version 1–7 local data migrates forward with an empty notes collection while preserving existing study history.

## Phase 12 — Global Search + Notifications

EduFlow now includes a global command search available with **Ctrl/Cmd + K** from any application route. Search is derived from live state rather than a stale index and covers selected subjects, topics, Important bookmarks, personal notes, and supported revision content. Results are grouped and navigate directly to their destination.

The persistent in-app notification center generates restrained reminders from real student data, including exams within seven days, daily goals nearing completion, and an evening reminder when no meaningful study activity has been logged. Notifications use stable source keys to avoid duplicates, support read/unread state, and retain up to 100 recent items.

Browser notifications remain optional. EduFlow never requests browser notification permission on first load; the permission prompt is only triggered after the student presses **Enable Study Reminders** inside the notification center. If browser notifications are unavailable or denied, the in-app center remains the fallback.

Storage is now state version **9**, with migration from version 8 adding empty notifications plus notification preferences without deleting existing profile, syllabus, tests, planner, focus, revision, flashcards, achievements, calendar data, or notes.

## Phase 13 — Study Assistant

Phase 13 adds a real provider boundary without pretending that a generative model exists in the zero-cost prototype.

### Local Study Assistant

- `/assistant` provides a topic-aware study chat interface.
- The default provider is `LocalStudyProvider`; it does not call an external AI service.
- Answers are grounded in EduFlow's verified starter concept bank, revision content, saved test attempts/mistakes, linked personal notes, and performance analytics.
- Supported requests include topic summaries, definitions, formulas where present, common mistakes, quick-recall questions, test-mistake explanations, notes review, and weak-topic study priorities.
- Unsupported custom topics return an explicit unavailable response rather than fabricated academic content.
- Topic workspaces expose **Ask Assistant** and test results expose **Explain with Assistant**, carrying the exact subject/topic/attempt context into the chat.
- Chat history is intentionally session-only in this phase and is not added to analytics or study activity.

### Provider architecture

`src/lib/ai/` defines the `AIProvider` contract and implementations for:

- `LocalStudyProvider` — active zero-cost provider.
- `OpenAIProvider` — future remote provider boundary.
- `GeminiProvider` — future remote provider boundary.
- `FutureProvider` — extension point.

Remote providers are not exposed as working options until configured. They must be connected through the server-side `POST /api/ai/chat` boundary. Provider secrets must stay in environment variables and must never be shipped in client-side JavaScript.

Phase 13 does not require a storage-version migration because chat messages are session-only and all grounding data already exists in state version 9.

## Phase 14 — Responsive refinement

Phase 14 adds the dedicated mobile application shell and cross-product responsive polish. Phones now use a five-item bottom navigation (Home, Subjects, Planner, Focus, More), with secondary tools in a bottom sheet. Tablet/desktop navigation becomes progressively denser only when space permits.

Mobile-specific treatment was added for Global Search, Notes editing, test submission, topic completion, Add Topic, Add Exam, notification panels, flashcards, Calendar, Study Assistant and Focus Mode. Safe-area handling and an explicit mobile viewport are included, and coarse-pointer controls receive approximately 44px minimum interaction height.

See `docs/PHASE-14-RESPONSIVE-QA.md` for the refinement checklist and target widths.

## Phase 15 — End-to-End QA

The project now includes an executable acceptance suite for the core EduFlow journey. Run `npm run qa:phase15` to execute the in-memory behavioral tests and source/import audit. The detailed 30-point acceptance report is in `docs/PHASE-15-ACCEPTANCE-QA.md`.

Phase 15 validates actual store mutations and pure engines for onboarding persistence, topic completion, 10-question tests, scoring and mistake analysis, performance/weak-topic logic, planner prioritization, timestamp-based focus sessions, study-time accounting, streaks, notes, bookmarks, goals, achievements, calendar, revision, flashcards, search, notifications, and Local Study Assistant grounding.

A full `next build` is still not claimed in the packaged environment because external npm dependency installation timed out; run the documented local commands on a machine with registry access for final browser-rendered verification.


---

## AI Enriched Cloud Upgrade

EduFlow now includes Firebase Authentication, MongoDB user-state sync, an optional separate Express/MERN API, Gemini-backed action copilot, document upload + extraction, multi-source research, creator branding, and cross-device persistence.

Start with [`docs/AI-CLOUD-UPGRADE.md`](docs/AI-CLOUD-UPGRADE.md) and copy `.env.example` to `.env.local`.

New routes:

- `/auth` — login / signup
- `/assistant` — action-capable AI copilot
- `/documents` — notes/syllabus/marksheet uploads
- `/research` — Wikipedia + OpenAlex + Crossref search
- `/creators` — project credits

Project credit: **Made by Tanisha Dey, Aishgun Kaur, Sudesna Mondal, Abhinanda Bera, Tanisha Chowdary & Ruhaaba Warsi.**
