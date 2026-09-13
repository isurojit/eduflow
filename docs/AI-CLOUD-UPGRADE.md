# EduFlow AI Enriched — Cloud Setup

This build keeps the existing EduFlow learning engine and adds Firebase authentication, MongoDB cloud persistence, document intelligence, a Gemini-powered action copilot, public/scholarly research, uploads, and creator branding.

## 1. Install

```bash
npm install
```

Use Node.js 20 LTS or a current supported LTS release.

## 2. Configure `.env.local`

Copy `.env.example` to `.env.local` and fill the values.

### Firebase Authentication

Create a Firebase project, add a Web App, then enable:

- Authentication → Email/Password
- Authentication → Google

Copy the Firebase Web SDK values into the `NEXT_PUBLIC_FIREBASE_*` variables.

Create a Firebase service account and place its project ID, client email and private key in the `FIREBASE_ADMIN_*` variables. Never expose these Admin values with a `NEXT_PUBLIC_` prefix.

### MongoDB Atlas

Create an Atlas cluster, database user and connection string. Put it in:

```env
MONGODB_URI=...
MONGODB_DB=eduflow
```

MongoDB stores:

- `users` — Firebase UID + user/profile metadata
- `user_states` — the full versioned EduFlow state per Firebase UID
- `documents` — extracted upload metadata + AI analysis
- `student_uploads.files/chunks` — GridFS raw uploads when Firebase Storage is not configured

### Gemini

Create a Gemini API key and add:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

The browser never receives `GEMINI_API_KEY`. AI calls happen on the server.

### Optional Firebase Storage

If `FIREBASE_STORAGE_BUCKET` is present and the server account can write to it, EduFlow mirrors new uploads there. Otherwise uploads automatically use MongoDB GridFS.

This is intentional: new Firebase Cloud Storage projects currently require the Blaze plan, while MongoDB GridFS keeps the upload workflow usable with Atlas development/free setups.

## 3. Run the app

### Simplest mode — Next.js full stack

```bash
npm run dev
```

The frontend and Node route handlers run on `http://localhost:3000`.

### MERN-style split backend

Set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

Then run:

```bash
npm run dev:full
```

This runs:

- Next.js / React frontend → `localhost:3000`
- Express + Node + MongoDB API → `localhost:4000`

Firebase remains the identity provider.

## 4. New product areas

### `/auth`
Firebase email/password and Google login/logout.

### `/documents`
Upload PDF, DOCX, XLSX/XLS, CSV, TXT, PNG/JPG/WebP up to 10 MB.

EduFlow can detect and interpret:

- Notes
- Syllabi
- Marksheets
- Question papers
- Other study documents

Syllabus imports can create new custom subjects/topics or append missing topics to an existing subject. Notes can populate the Notes workspace. Marksheet data is stored as an academic record note rather than being incorrectly mixed into EduFlow’s topic-test analytics.

### `/assistant`
The AI Copilot can answer questions and propose app actions such as:

- Add daily/weekly goals
- Add exams
- Create notes
- Set available study minutes
- Mark/bookmark topics
- Start focus sessions
- Navigate around EduFlow
- Launch source-linked research

State changes require the student to click the proposed action, preventing silent AI edits.

### `/research`
Searches three live public/scholarly sources:

- Wikipedia
- OpenAlex
- Crossref

Every result links to its source. This is intentionally a verifiable multi-source research layer rather than unsafe arbitrary web scraping.

### `/creators`
Project creator credits:

- Tanisha Dey
- Aishgun Kaur
- Sudesna Mondal
- Abhinanda Bera
- Tanisha Chowdary
- Ruhaaba Warsi

## 5. Cross-device state

After Firebase login, the app compares local cached state with the user’s MongoDB state and keeps the newer version. Store mutations are then debounced back to MongoDB.

A browser cache marker prevents a second Firebase account on the same computer from inheriting the previous account’s local EduFlow state.

## 6. Security model

- Firebase Auth owns passwords/OAuth identity.
- MongoDB records are keyed by verified Firebase UID.
- API routes verify Firebase ID tokens server-side.
- Gemini and Mongo credentials stay server-side.
- State-changing AI actions require a user click.
- Upload size and file types are restricted.
- Marksheet imports do not contaminate test analytics.

## 7. About AnimMaster / Skipper UI / Vengeance UI

No dependable, current npm packages with those exact names could be verified during this upgrade. Installing unverified packages would be a supply-chain risk. EduFlow therefore keeps its lightweight Framer Motion foundation and uses custom dark-crimson editorial interaction patterns inspired by the requested high-motion / premium UI direction, without adding an unknown dependency.

## 8. Recommended production checks

```bash
npm run typecheck
npm run build
npm run qa:phase15
```

Then test login, cloud sync and uploads using two separate Firebase accounts before deployment.
