# English with Diyora 🇬🇧

**dio.max.co.uz** — O'zbek o'quvchilari uchun to'liq funksiyali ingliz tili o'rganish platformasi. Django/DRF backend va Next.js 15 frontend asosida qurilgan, gamifikatsiya (XP, streak, achievement) bilan boyitilgan.

---

## 📋 Mazmuni

- [Texnologiyalar](#-texnologiyalar)
- [Asosiy funksiyalar](#-asosiy-funksiyalar)
- [Loyiha tuzilishi](#-loyiha-tuzilishi)
- [Lokal ishga tushirish](#-lokal-ishga-tushirish)
- [Productionga deploy qilish](#-productionga-deploy-qilish)
- [API endpointlar](#-api-endpointlar-qisqacha)
- [Ma'lumotlar bazasi tuzilishi](#-malumotlar-bazasi-tuzilishi)
- [Xavfsizlik eslatmalari](#-xavfsizlik-eslatmalari)
- [Rejalashtirilgan ishlar](#-rejalashtirilgan-ishlar)

---

## 🛠 Texnologiyalar

**Backend**
- Python 3.12+ / Django 6.0
- Django REST Framework
- PostgreSQL 16
- JWT autentifikatsiya (`djangorestframework-simplejwt`)
- Gunicorn (production WSGI server)

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- TanStack Query (React Query)
- Zustand (state management)
- Tailwind CSS

**Infratuzilma**
- Docker / Docker Compose
- Nginx (reverse proxy)
- Cloudflare Tunnel (server IP manzilini oshkor qilmasdan domenga ulash uchun)

---

## ✨ Asosiy funksiyalar

### O'quvchilar uchun

- **3 ta yo'nalish (track):**
  - **CEFR** — A1 dan C2 gacha barcha darajalar, har bir darajada bir nechta modul va dars
  - **General English** — Everyday English, Travel English, Business Basics
  - **IELTS** — Listening, Reading, Speaking, Writing
- **Darslar** — matn, lug'at, grammatika, test va vazifalardan iborat, "Keyingi dars" tugmasi bilan ketma-ket o'rganish
- **Lug'at (Vocabulary)** — SM-2 algoritmiga asoslangan spaced repetition (SRS) tizimi, kunlik takrorlash navbati
- **Grammar** — 24+ mavzu (zamonlar, shart gaplar, modal fe'llar, passiv nisbat va h.k.), kategoriyalar bo'yicha guruhlangan, qoida + misollar bilan
- **Testlar** — har bir darsda, shuningdek **umumiy "Testlar" sahifasi** orqali istalgan testni erkin tanlab yechish mumkin
  - Fill-blank savollarda **so'z banki** (variant tanlash) — noaniqlikni oldini oladi
  - Savollarda **hint (yordam)** tugmasi
- **Vazifalar (Assignment)** — yozma/audio vazifalar, teacher tomonidan baholanadi, inline IELTS-uslubidagi izohlar bilan
- **"So'z bilish" o'yini** — tezkor lug'at o'yini, har savolga vaqt cheklovi bilan, XP beradi
- **Gamifikatsiya** — XP, level, kunlik streak, achievement (yutuqlar), reyting jadvali (leaderboard)
- **Profil** — shaxsiy ma'lumotlar, CEFR darajasi, o'rganish maqsadi (track) tahrirlash

### O'qituvchilar uchun

- **Teacher Dashboard** (`/teacher/students`) — barcha studentlarning faolligi, progressi, streak va XP'ini bir joyda kuzatish
  - Filtrlar: biriktirilganlik (mening talabalarim / yangi), faollik holati, CEFR darajasi
  - Har bir student kartasida progress bar (necha % dars tugatilgan)
  - **"Menga qo'shish"** — yangi (biriktirilmagan) studentni o'ziga biriktirish
- **Student Detail sahifasi** — bitta studentning barcha kurs/modul/dars/test/vazifa natijalari, qidiruv bilan (masalan "IELTS Part 1" deb qidirish)
- **Vazifalar paneli** (`/teacher/submissions`) — kelgan vazifalarni tekshirish, baholash, inline izoh qoldirish
- **Invite-code himoyasi** — yangi o'qituvchi faqat maxfiy kod bilan ro'yxatdan o'tishi mumkin (`TEACHER_INVITE_CODE` environment variable)

---

## 📁 Loyiha tuzilishi

```
dio-web/
├── backend/
│   ├── config/              # Django settings, asosiy urls.py
│   ├── accounts/             # User model, auth, ro'l (student/teacher/admin)
│   ├── content/              # Track, Course, Module, Lesson
│   ├── vocabulary/            # Word, WordSet, SRS, Word Match o'yini
│   ├── grammar/               # GrammarTopic, GrammarRule, GrammarExample
│   ├── exercises/             # Quiz, Question, Choice, Assignment, Submission
│   ├── progress/              # LessonProgress, Streak, UserXP, Teacher Dashboard
│   └── manage.py
├── frontend/
│   └── src/
│       ├── app/(auth)/        # Login, register
│       ├── app/(dashboard)/   # Asosiy ilova (lessons, quizzes, teacher/*, games/*, profile)
│       ├── components/        # Qayta ishlatiladigan UI komponentlar
│       ├── lib/api/           # Backend bilan aloqa qiluvchi funksiyalar
│       └── lib/hooks/         # React Query hooklar
├── docker-compose.prod.yml
├── .env.prod                  # Maxfiy — git'ga kiritilmaydi
└── README.md
```

---

## 🚀 Lokal ishga tushirish

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt --break-system-packages

# .env faylida SECRET_KEY, DB ma'lumotlari, TEACHER_INVITE_CODE bo'lishi kerak
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend `http://localhost:8000` da ishga tushadi.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` da ishga tushadi.

> **Eslatma:** `frontend/.env.local` faylida `NEXT_PUBLIC_API_URL=http://localhost:8000/api` bo'lishi kerak.

---

## 🌐 Productionga deploy qilish

Loyiha Docker Compose orqali konteynerlashtirilgan holda ishlaydi, Cloudflare Tunnel orqali `dio.max.co.uz`ga xavfsiz ulanadi (server IP manzili oshkor qilinmaydi). Server konfiguratsiyasi va kirish ma'lumotlari shaxsiy hisoblanadi va shu sababli bu yerda keltirilmaydi.

```bash
# 1. Lokalda o'zgarishlarni commit qilish
git add .
git commit -m "..."
git push origin main

# 2. Serverda yangilash
git pull origin main

# 3. Rebuild va qayta ishga tushirish
docker compose -f docker-compose.prod.yml --env-file .env.prod build backend frontend
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 4. Agar yangi migration bo'lsa
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend python manage.py migrate
```

### Ma'lumot (fixture) ko'chirish

Lokal va production bazalarida `id`lar mos kelmasligi mumkin, shuning uchun **nom bo'yicha moslashtiruvchi** import buyruqlari ishlatiladi:

```bash
# Lokalda eksport (masalan grammar uchun)
python manage.py shell < export_script.py

# Serverda import (faqat yangi yozuvlarni qo'shadi, mavjudlarini o'tkazib yuboradi)
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend python manage.py import_grammar_fixture
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend python manage.py import_quiz_fixture
```

---

## 🔌 API endpointlar (qisqacha)

| Endpoint | Tavsif |
|---|---|
| `POST /api/auth/register/` | Ro'yxatdan o'tish (teacher uchun `invite_code` talab qilinadi) |
| `POST /api/auth/login/` | Login (JWT access + refresh) |
| `GET/PATCH /api/auth/me/` | Profil ma'lumotlari |
| `GET /api/content/tracks/` | Yo'nalishlar ro'yxati |
| `GET /api/content/lessons/{id}/` | Dars tafsilotlari (`next_lesson_id` bilan) |
| `GET /api/exercises/quizzes/` | Barcha testlar (track/level/qidiruv filtrlari bilan) |
| `POST /api/exercises/quizzes/{id}/start/` | Test boshlash |
| `GET /api/vocabulary/game/words/` | Word Match o'yini savollari |
| `GET /api/progress/teacher/dashboard/` | Teacher uchun studentlar statistikasi |
| `GET /api/progress/teacher/students/{id}/` | Bitta studentning to'liq progressi |
| `POST /api/progress/teacher/students/{id}/assign/` | Studentni o'ziga biriktirish |

---

## 🗄 Ma'lumotlar bazasi tuzilishi (asosiy modellar)

```
User (accounts)
 ├─ role: student / teacher / admin
 ├─ assigned_teacher → User (faqat student'larda to'ldiriladi)
 └─ cefr_level, learning_goal

Course (content) → Module → Lesson
 └─ Lesson → Quiz → Question → Choice
 └─ Lesson → Assignment → AssignmentSubmission

Word (vocabulary) ←→ Lesson (M2M, LessonWord orqali)
 └─ WordProgress (SM-2 SRS holati)
 └─ WordMatchAttempt (o'yin natijalari)

GrammarTopic (grammar) → GrammarRule → GrammarExample

LessonProgress, QuizAttempt, Streak, UserXP, Achievement (progress)
```

---

## 🔒 Xavfsizlik eslatmalari

- `.env.prod` fayli **hech qachon** git'ga commit qilinmaydi (`.gitignore`da)
- `TEACHER_INVITE_CODE` faqat ishonchli odamlarga aytiladi
- JWT token muddati: access — 60 daqiqa, refresh — 7 kun (avtomatik yangilanadi)
- Production'da `DEBUG=False` bo'lishi **majburiy**
- Server joylashuvi, IP manzili va kirish ma'lumotlari faqat loyiha egasida saqlanadi, hech qaysi ochiq hujjatda keltirilmaydi

---

## 🗺 Rejalashtirilgan ishlar

- [ ] Barcha CEFR/General/IELTS darslariga AI orqali ko'proq test qo'shish
- [ ] Placement test (yangi student uchun avtomatik CEFR aniqlash)
- [ ] Qiyin mavzular agregati (qaysi test/savol eng ko'p xato qilinadi)
- [ ] "E'tibor talab qiladigan studentlar" avtomatik filtri
- [ ] Teacher uchun student haqida shaxsiy eslatma/izoh qo'shish imkoniyati
- [ ] Qo'shimcha o'yinlar (Hangman, Word Scramble va h.k.)
- [ ] Telegram bot integratsiyasi

---

## 👤 Muallif

**Makhkamjon Berdilloev** ([@MaxBerd10](https://github.com/MaxBerd10))