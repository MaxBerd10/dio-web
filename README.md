# English with Diyora 🇬🇧

**[dio.max.co.uz](https://dio.max.co.uz)** — A full-featured English learning platform for Uzbek learners, built with Django/DRF backend and Next.js 16 frontend, enriched with gamification (XP, streaks, achievements) and AI-generated content.

---

## 🛠 Tech Stack

**Backend**
- Python 3.12 / Django 6.0 / Django REST Framework
- PostgreSQL 16
- Redis 7 + Celery 5 (async tasks: email delivery)
- JWT authentication (`djangorestframework-simplejwt`)
- Gunicorn (production WSGI server)
- ReportLab (PDF certificate generation)
- Matplotlib (chart image generation for IELTS Writing Task 1)
- pytest (unit & API tests)

**Frontend**
- Next.js 16 (App Router) / TypeScript / React 19
- TanStack Query (React Query)
- Zustand (state management)
- Tailwind CSS v4
- Vitest + Testing Library
- PWA (manifest, service worker, install prompt)

**Infrastructure**
- Docker / Docker Compose
- Nginx (reverse proxy, media file serving)
- Cloudflare Tunnel (secure domain connection without exposing server IP)
- GitHub Actions CI/CD with self-hosted runner on Ubuntu home server

---

## ✨ Features

### For Students

- **Marketing landing page** at `/` with feature overview and CTA
- **PWA support** — installable on mobile, offline fallback page
- **Light / dark theme** toggle with persistent preference
- **3 Learning Tracks:** CEFR (A1–C2), General English, IELTS Preparation
- **IELTS Reading** — 5 full practice tests (15 passages, 150 questions)
- **IELTS Writing Task 1** — chart/diagram images auto-generated with Matplotlib
- **Vocabulary SRS** — SM-2 spaced repetition algorithm, daily review queue
- **Grammar** — 24+ topics grouped by category
- **Quizzes** — fill-in-the-blank with word bank, hint system, XP rewards
- **Writing Assignments** — graded by teachers with inline IELTS-style comments
- **3 Vocabulary Games:** Word Match, Hangman, Word Scramble (backend-validated)
- **PDF Certificates** — auto-generated with ReportLab upon course completion
- **Password Reset** — email-based via Celery + Redis async task (Gmail SMTP)
- **Gamification** — XP, levels, daily streaks, achievements, leaderboard

### For Teachers

- **Teacher Dashboard** — monitor students' activity, progress, streak and XP
  - Filters: assignment, activity status, CEFR level
  - **Assign to Me** button for unassigned students
- **Difficult Topics Report** — quiz questions with highest error rates
- **Student Detail** — full course/module/lesson/quiz/assignment breakdown
- **Submissions Panel** — grade assignments, add inline feedback comments
- **Invite Code Protection** — teachers register with a secret code only

---

## 📁 Project Structure

```
dio-web/
├── backend/
│   ├── config/              # Django settings, URLs, Celery config
│   ├── accounts/            # User model, auth, roles, password reset
│   ├── content/             # Track, Course, Module, Lesson
│   ├── vocabulary/          # Word, WordSet, SRS, 3 vocabulary games
│   ├── grammar/             # GrammarTopic, GrammarRule, GrammarExample
│   ├── exercises/           # Quiz, Question, Choice, Assignment, Submission
│   └── progress/            # LessonProgress, Streak, UserXP, Certificates, Teacher Dashboard
├── frontend/
│   ├── public/              # PWA manifest, service worker, icons
│   └── src/
│       ├── app/(auth)/      # Login, register, forgot/reset password
│       ├── app/(dashboard)/ # Main app (lessons, quizzes, games, certificates, teacher/*)
│       ├── components/      # UI, layout, landing, PWA, theme
│       ├── lib/api/         # Backend API client functions
│       └── lib/hooks/       # React Query hooks
├── nginx/default.conf       # Reverse proxy + media file serving
├── docker-compose.prod.yml  # backend, frontend, nginx, db, redis, celery_worker
├── .github/workflows/       # CI/CD pipeline
└── .env.prod                # Secret — never committed to git
```

---

## 🚀 Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt   # pytest va test dependencies

# Create .env with: SECRET_KEY, DB credentials, TEACHER_INVITE_CODE, REDIS_URL, EMAIL_*
python manage.py migrate
python manage.py runserver
```

### Celery Worker

```bash
# Separate terminal (venv activated)
celery -A config worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend/.env.local`

If you hit stale cache or chunk errors during development:

```bash
npm run dev:clean
```

---

## 🧪 Tests

### Backend

```bash
cd backend
SECRET_KEY=test TEACHER_INVITE_CODE=test pytest
```

### Frontend

```bash
cd frontend
npm test
```

CI runs both test suites on every push to `main` before deployment.

---

## ⚙️ CI/CD

Fully automated via **GitHub Actions** with a **self-hosted runner** on the production server:

1. **`test` job** (GitHub's servers):
   - Python syntax check
   - `manage.py check` + `pytest`
   - `npm run build` + `npm test`
   - If any check fails → deployment is **blocked**

2. **`deploy` job** (self-hosted runner on production server):
   - `git pull` → `docker compose build` → `up -d` → `migrate` → `nginx restart`
   - Triggered **only** if `test` passes

A single `git push origin main` triggers the full pipeline. No manual SSH required.

---

## 🔌 API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register/` | Registration (teacher requires `invite_code`) |
| `POST /api/auth/login/` | Login (returns JWT access + refresh) |
| `POST /api/auth/password-reset/` | Request password reset email |
| `POST /api/auth/password-reset/confirm/` | Confirm with token + new password |
| `GET /api/content/tracks/` | All learning tracks |
| `GET /api/exercises/quizzes/` | All quizzes (with filters) |
| `GET /api/vocabulary/game/words/` | Word Match questions |
| `GET /api/progress/certificates/` | Student's certificates |
| `GET /api/progress/certificates/{id}/download/` | Download PDF certificate |
| `GET /api/progress/teacher/dashboard/` | Teacher's student statistics |
| `GET /api/progress/teacher/difficult-topics/` | Questions with highest error rates |

---

## 🗄 Database Structure

```
User → role: student / teacher / admin
  → assigned_teacher (FK to User)
Course → Module → Lesson
  → Quiz → Question → Choice
  → Assignment → Submission → FeedbackComment
Word ←→ Lesson (M2M via LessonWord)
  → WordProgress (SM-2 SRS state)
  → WordMatchAttempt / HangmanAttempt / ScrambleAttempt
LessonProgress, QuizAttempt, QuestionResponse
Streak, UserXP, Achievement, Certificate
PasswordResetToken (1-hour expiry, single-use)
```

---

## 🔒 Security

- `.env.prod` never committed to git
- JWT: access — 60 min, refresh — 7 days with blacklist rotation
- `DEBUG=False` in production
- Password validation: min 8 chars, uppercase + lowercase + digit, common passwords rejected
- Server IP never exposed (Cloudflare Tunnel)
- Gmail SMTP via App Password

---

## 👤 Author

**Makhkamjon Berdilloev** ([@MaxBerd10](https://github.com/MaxBerd10))  
Full-stack developer (Django + Next.js) · Fergana, Uzbekistan  
Live demo: [dio.max.co.uz](https://dio.max.co.uz)
