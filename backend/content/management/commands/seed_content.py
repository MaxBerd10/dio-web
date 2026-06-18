"""
Course → Module → Lesson skeleton seed.

Foydalanish:
    python manage.py seed_content              # qo'shadi (mavjudlari tegmaydi)
    python manage.py seed_content --reset      # avval o'chiradi, keyin qo'shadi

Idempotent: get_or_create orqali takror yaratmaydi.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Course, Module, Lesson


# ============================================================
# DATA — Course → Modules → Lessons
# ============================================================

GENERAL_COURSES = [
    {
        'title': 'Everyday English',
        'description': "Kundalik suhbat, oddiy savol-javoblar, kichik dialoglar.",
        'icon': '☕',
        'order': 1,
        'modules': [
            {
                'title': 'Introductions',
                'description': 'Tanishish, salomlashish, o\'zini tanitish.',
                'lessons': [
                    ('Hello and Hi', 'vocabulary', 10),
                    ('Asking names', 'speaking', 12),
                    ('Where are you from?', 'mixed', 15),
                    ('Talking about yourself', 'speaking', 15),
                    ('Meeting new people', 'speaking', 18),
                ],
            },
            {
                'title': 'Daily Routines',
                'description': 'Kunlik amallar haqida gapirish.',
                'lessons': [
                    ('Morning routine', 'vocabulary', 12),
                    ('Time and schedule', 'grammar', 18),
                    ('Weekend activities', 'reading', 15),
                    ('Daily habits', 'grammar', 15),
                    ('Work and study routine', 'speaking', 18),
                ],
            },
            {
                'title': 'Food and Drinks',
                'description': 'Restoran, oziq-ovqat, taom buyurtma qilish.',
                'lessons': [
                    ('Food vocabulary', 'vocabulary', 10),
                    ('Ordering at a cafe', 'speaking', 15),
                    ('At the supermarket', 'listening', 12),
                    ('Talking about food preferences', 'speaking', 15),
                    ('Healthy eating', 'reading', 18),
                ],
            },
            {
                'title': 'People and Relationships',
                'description': 'Odamlar, munosabatlar, ta\'riflash.',
                'lessons': [
                    ('Describing people', 'vocabulary', 12),
                    ('Family relationships', 'vocabulary', 15),
                    ('Talking about friends', 'speaking', 15),
                    ('Personality adjectives', 'vocabulary', 18),
                ],
            },
            {
                'title': 'Home and Living',
                'description': 'Uy, xonalar, mebel, joy ta\'riflash.',
                'lessons': [
                    ('Rooms in a house', 'vocabulary', 12),
                    ('Furniture and objects', 'vocabulary', 12),
                    ('Describing your home', 'speaking', 15),
                    ('Renting a flat', 'speaking', 18),
                ],
            },
        ],
    },
    {
        'title': 'Travel English',
        'description': "Sayohat uchun: aeroport, mehmonxona, yo'l so'rash.",
        'icon': '✈️',
        'order': 2,
        'modules': [
            {
                'title': 'At the Airport',
                'description': 'Check-in, boarding, security.',
                'lessons': [
                    ('Check-in dialogue', 'speaking', 15),
                    ('Airport signs', 'vocabulary', 10),
                    ('Boarding announcements', 'listening', 12),
                    ('Going through security', 'speaking', 15),
                    ('Flight vocabulary', 'vocabulary', 12),
                ],
            },
            {
                'title': 'Hotels and Hostels',
                'description': "Joy bron qilish, muammolarni hal qilish.",
                'lessons': [
                    ('Booking a room', 'speaking', 15),
                    ('Hotel facilities', 'vocabulary', 10),
                    ('Checking in and out', 'speaking', 15),
                    ('Solving problems at a hotel', 'speaking', 18),
                ],
            },
            {
                'title': 'Getting Around',
                'description': 'Transport, yo\'nalish so\'rash.',
                'lessons': [
                    ('Types of transport', 'vocabulary', 12),
                    ('Asking for directions', 'speaking', 15),
                    ('Using public transport', 'listening', 15),
                    ('Renting a car', 'speaking', 18),
                ],
            },
            {
                'title': 'Sightseeing and Culture',
                'description': 'Diqqatga sazovor joylar, madaniyat.',
                'lessons': [
                    ('Tourist attractions', 'vocabulary', 12),
                    ('Buying tickets', 'speaking', 12),
                    ('Cultural differences', 'reading', 20),
                    ('Talking about experiences', 'speaking', 18),
                ],
            },
        ],
    },
    {
        'title': 'Business Basics',
        'description': "Ofis, email, telefon suhbati, professional muhit.",
        'icon': '💼',
        'order': 3,
        'modules': [
            {
                'title': 'Email Writing',
                'description': "Professional email yozish asoslari.",
                'lessons': [
                    ('Formal vs informal', 'writing', 20),
                    ('Email phrases', 'vocabulary', 15),
                    ('Writing a request email', 'writing', 20),
                    ('Replying to emails', 'writing', 18),
                ],
            },
            {
                'title': 'Phone Calls',
                'description': 'Telefon orqali muloqot.',
                'lessons': [
                    ('Making a call', 'speaking', 15),
                    ('Leaving a message', 'listening', 12),
                    ('Conference calls', 'listening', 18),
                    ('Ending a call politely', 'speaking', 12),
                ],
            },
            {
                'title': 'Meetings and Presentations',
                'description': 'Yig\'ilish, taqdimot, muzokaralar.',
                'lessons': [
                    ('Meeting vocabulary', 'vocabulary', 15),
                    ('Running a meeting', 'speaking', 20),
                    ('Giving a presentation', 'speaking', 25),
                    ('Discussing ideas', 'speaking', 18),
                ],
            },
            {
                'title': 'Job Applications',
                'description': 'Ish qidirish, suhbat, CV.',
                'lessons': [
                    ('Writing a CV', 'writing', 25),
                    ('Job interview phrases', 'speaking', 20),
                    ('Talking about experience', 'speaking', 18),
                    ('Salary negotiation', 'speaking', 20),
                ],
            },
        ],
    },
]


CEFR_COURSES = [
    {
        'title': 'A1 — Foundation',
        'description': 'Boshlovchilar uchun. Alifbo, oddiy gaplar, kundalik hayot so\'zlari.',
        'cefr_level': 'A1',
        'icon': '🌱',
        'order': 1,
        'modules': [
            {
                'title': 'Alphabet and Numbers',
                'description': 'Ingliz alifbosi, raqamlar, ranglar va kunlar.',
                'lessons': [
                    ('The English alphabet', 'vocabulary', 10),
                    ('Numbers 1-100', 'vocabulary', 12),
                    ('Colors and shapes', 'vocabulary', 10),
                    ('Days and months', 'vocabulary', 12),
                ],
            },
            {
                'title': 'Greetings and Introductions',
                'description': 'Salomlashish, tanishish, o\'zini tanitish.',
                'lessons': [
                    ('Saying Hello', 'vocabulary', 10),
                    ('My name is...', 'speaking', 12),
                    ('Where are you from?', 'speaking', 12),
                    ('Describing people', 'vocabulary', 15),
                    ('Family members', 'vocabulary', 15),
                ],
            },
            {
                'title': 'Basic Verbs',
                'description': 'Eng muhim fe\'llar va ularning ishlatilishi.',
                'lessons': [
                    ('To be', 'grammar', 15),
                    ('To have', 'grammar', 12),
                    ('Action verbs', 'vocabulary', 15),
                    ('Everyday actions', 'vocabulary', 12),
                    ('Like and want', 'grammar', 12),
                ],
            },
            {
                'title': 'My Home',
                'description': 'Uy, xonalar, mebel va buyumlar.',
                'lessons': [
                    ('Rooms in a house', 'vocabulary', 12),
                    ('Furniture and objects', 'vocabulary', 12),
                    ('Describing your home', 'speaking', 15),
                    ('In the kitchen', 'vocabulary', 10),
                    ('My bedroom', 'speaking', 12),
                ],
            },
            {
                'title': 'Food and Drink',
                'description': 'Taom, ichimlik, buyurtma qilish.',
                'lessons': [
                    ('Food vocabulary', 'vocabulary', 10),
                    ('Drinks and snacks', 'vocabulary', 10),
                    ('Ordering at a cafe', 'speaking', 15),
                    ('At the supermarket', 'listening', 12),
                    ('I like and I don\'t like', 'grammar', 12),
                ],
            },
            {
                'title': 'My Day',
                'description': 'Kundalik hayot, vaqt, maktab kuni.',
                'lessons': [
                    ('Morning routine', 'vocabulary', 12),
                    ('Time and the clock', 'vocabulary', 15),
                    ('School day', 'reading', 15),
                    ('After school activities', 'speaking', 12),
                    ('Weekend activities', 'reading', 15),
                    ('My typical day', 'reading', 20),
                ],
            },
            {
                'title': 'People and Places',
                'description': 'Odam, joy, shahar, do\'kon.',
                'lessons': [
                    ('My family', 'reading', 15),
                    ('My friends', 'speaking', 12),
                    ('My school', 'reading', 15),
                    ('My town', 'vocabulary', 12),
                    ('Shops and places', 'vocabulary', 12),
                    ('Getting around', 'speaking', 15),
                    ('Uzbekistan', 'reading', 20),
                ],
            },
        ],
    },
    {
        'title': 'A2 — Elementary',
        'description': "Oddiy o'tgan va kelasi zamon, kundalik suhbatlar.",
        'cefr_level': 'A2',
        'icon': '🌿',
        'order': 2,
        'modules': [
            {
                'title': 'Past Simple',
                'description': "O'tgan zamon: regular va irregular fe'llar.",
                'lessons': [
                    ('Regular verbs in past', 'grammar', 18),
                    ('Irregular verbs', 'grammar', 20),
                    ('Last weekend story', 'writing', 15),
                    ('Famous people', 'reading', 20),
                    ('My last holiday', 'speaking', 18),
                ],
            },
            {
                'title': 'Future Plans',
                'description': "Kelajak rejalari: going to, will.",
                'lessons': [
                    ('Going to', 'grammar', 15),
                    ('Will vs going to', 'grammar', 18),
                    ('My future plans', 'writing', 20),
                    ('Weather forecast', 'listening', 15),
                ],
            },
            {
                'title': 'Comparatives and Superlatives',
                'description': "Taqqoslash: bigger, the biggest.",
                'lessons': [
                    ('Comparative adjectives', 'grammar', 15),
                    ('Superlatives', 'grammar', 15),
                    ('Cities of the world', 'reading', 20),
                    ('The best and the worst', 'speaking', 15),
                ],
            },
            {
                'title': 'Daily Life',
                'description': 'Kundalik hayot suhbatlari va holatlar.',
                'lessons': [
                    ('Shopping for clothes', 'speaking', 15),
                    ('At the doctor', 'speaking', 18),
                    ('Making phone calls', 'listening', 15),
                    ('Writing emails', 'writing', 20),
                    ('Giving directions', 'speaking', 15),
                ],
            },
            {
                'title': 'Health and Body',
                'description': 'Salomatlik, tana, kasalliklar.',
                'lessons': [
                    ('Parts of the body', 'vocabulary', 12),
                    ('Common illnesses', 'vocabulary', 15),
                    ('At the pharmacy', 'speaking', 15),
                    ('Healthy lifestyle', 'reading', 20),
                ],
            },
            {
                'title': 'Free Time',
                'description': 'Xobbi, sport, bo\'sh vaqt.',
                'lessons': [
                    ('Hobbies and interests', 'vocabulary', 12),
                    ('Sports and games', 'vocabulary', 15),
                    ('I love watching movies', 'reading', 18),
                    ('My favorite music', 'speaking', 15),
                    ('Social media habits', 'reading', 18),
                ],
            },
            {
                'title': 'Travel and Transport',
                'description': 'Sayohat, transport, mehmonxona.',
                'lessons': [
                    ('Types of transport', 'vocabulary', 12),
                    ('Buying a ticket', 'speaking', 15),
                    ('At the airport', 'listening', 18),
                    ('Hotel check-in', 'speaking', 15),
                    ('A trip to Samarkand', 'reading', 20),
                ],
            },
        ],
    },
    {
        'title': 'B1 — Intermediate',
        'description': "Murakkabroq grammatika: shartli gaplar, modal fe'llar.",
        'cefr_level': 'B1',
        'icon': '🌳',
        'order': 3,
        'modules': [
            {
                'title': 'Conditionals',
                'description': "Shartli gaplar: 1st, 2nd, 3rd.",
                'lessons': [
                    ('Zero and First conditional', 'grammar', 20),
                    ('Second conditional', 'grammar', 20),
                    ('Third conditional', 'grammar', 22),
                    ('Mixed conditionals', 'grammar', 25),
                ],
            },
            {
                'title': 'Modal Verbs',
                'description': "Should, must, might, may.",
                'lessons': [
                    ('Should and must', 'grammar', 18),
                    ('May and might', 'grammar', 18),
                    ('Have to and need to', 'grammar', 18),
                    ('Modal verbs in past', 'grammar', 20),
                ],
            },
            {
                'title': 'Present Perfect',
                'description': "Hozirgi mukammal zamon.",
                'lessons': [
                    ('Present perfect introduction', 'grammar', 20),
                    ('For and since', 'grammar', 18),
                    ('Present perfect vs past simple', 'grammar', 22),
                    ('Life experiences', 'speaking', 20),
                ],
            },
            {
                'title': 'Reading Skills',
                'description': 'Matn o\'qish va tushunish.',
                'lessons': [
                    ('Reading strategies', 'reading', 25),
                    ('News articles', 'reading', 25),
                    ('Opinion texts', 'reading', 25),
                    ('Summarizing a text', 'writing', 25),
                ],
            },
            {
                'title': 'Speaking Fluency',
                'description': 'Erkin gapirish va fikr bildirish.',
                'lessons': [
                    ('Expressing opinions', 'speaking', 20),
                    ('Agreeing and disagreeing', 'speaking', 18),
                    ('Telling stories', 'speaking', 20),
                    ('Discussing problems', 'speaking', 22),
                ],
            },
        ],
    },
    {
        'title': 'B2 — Upper-Intermediate',
        'description': "Passiv tuzilmalar, reported speech, advanced phrasal verbs.",
        'cefr_level': 'B2',
        'icon': '🌲',
        'order': 4,
        'modules': [
            {
                'title': 'Passive Voice',
                'description': "Passiv ovoz: hozirgi, o'tgan, kelasi zamonlar.",
                'lessons': [
                    ('Passive in present', 'grammar', 20),
                    ('Passive in past', 'grammar', 20),
                    ('Passive with modals', 'grammar', 22),
                    ('Passive in news', 'reading', 25),
                ],
            },
            {
                'title': 'Reported Speech',
                'description': "Boshqa kishining gapini ko'rsatish.",
                'lessons': [
                    ('Reported statements', 'grammar', 22),
                    ('Reported questions', 'grammar', 22),
                    ('Reported commands', 'grammar', 20),
                    ('Reporting in journalism', 'reading', 25),
                ],
            },
            {
                'title': 'Advanced Grammar',
                'description': 'Murakkab grammatik tuzilmalar.',
                'lessons': [
                    ('Relative clauses', 'grammar', 22),
                    ('Participle clauses', 'grammar', 25),
                    ('Inversion', 'grammar', 25),
                    ('Cleft sentences', 'grammar', 25),
                ],
            },
            {
                'title': 'Academic Writing',
                'description': 'Akademik yozish ko\'nikmalari.',
                'lessons': [
                    ('Essay structure', 'writing', 30),
                    ('Argument and counterargument', 'writing', 30),
                    ('Cohesion and coherence', 'writing', 28),
                    ('Formal vocabulary', 'vocabulary', 25),
                ],
            },
        ],
    },
    {
        'title': 'C1 — Advanced',
        'description': "Akademik til, ilg'or grammatika, idioms.",
        'cefr_level': 'C1',
        'icon': '🏔️',
        'order': 5,
        'modules': [
            {
                'title': 'Advanced Tenses',
                'description': "Perfect continuous, mixed conditionals.",
                'lessons': [
                    ('Present perfect continuous', 'grammar', 25),
                    ('Past perfect continuous', 'grammar', 25),
                    ('Future perfect', 'grammar', 25),
                    ('Mixed conditionals', 'grammar', 25),
                ],
            },
            {
                'title': 'Academic Vocabulary',
                'description': "Ilmiy maqolalarda uchraydigan so'zlar.",
                'lessons': [
                    ('Academic word list intro', 'vocabulary', 20),
                    ('Formal vs informal vocab', 'vocabulary', 20),
                    ('Collocations', 'vocabulary', 22),
                    ('Idiomatic expressions', 'vocabulary', 22),
                ],
            },
            {
                'title': 'Advanced Reading',
                'description': 'Murakkab matnlarni tahlil qilish.',
                'lessons': [
                    ('Critical reading', 'reading', 30),
                    ('Scientific texts', 'reading', 30),
                    ('Literary analysis', 'reading', 30),
                    ('Inference and implication', 'reading', 28),
                ],
            },
        ],
    },
    {
        'title': 'C2 — Proficient',
        'description': "Native darajaga yaqin: nuanslar, idiomatic expressions.",
        'cefr_level': 'C2',
        'icon': '⭐',
        'order': 6,
        'modules': [
            {
                'title': 'Idioms and Expressions',
                'description': "Native speaker iboralari.",
                'lessons': [
                    ('Common idioms', 'vocabulary', 25),
                    ('Cultural expressions', 'reading', 25),
                    ('Phrasal verbs advanced', 'vocabulary', 25),
                    ('Slang and informal English', 'vocabulary', 22),
                ],
            },
            {
                'title': 'Mastery Skills',
                'description': 'Native darajadagi ko\'nikmalar.',
                'lessons': [
                    ('Nuance and register', 'reading', 30),
                    ('Humor in English', 'reading', 25),
                    ('Debating skills', 'speaking', 30),
                    ('Creative writing', 'writing', 30),
                ],
            },
        ],
    },
]


IELTS_COURSES = [
    {
        'title': 'IELTS Listening',
        'description': "4 ta section, 40 ta savol. Audio tinglash strategiyalari.",
        'ielts_skill': 'listening',
        'icon': '🎧',
        'order': 1,
        'modules': [
            {
                'title': 'Section 1: Everyday Dialogue',
                'description': "Kundalik suhbat, form to'ldirish.",
                'lessons': [
                    ('Form completion strategies', 'listening', 25),
                    ('Numbers and spelling', 'listening', 20),
                ],
            },
            {
                'title': 'Section 2: Monologue',
                'description': "Bir kishilik nutq, map labeling.",
                'lessons': [
                    ('Map labeling', 'listening', 25),
                    ('Following directions', 'listening', 20),
                ],
            },
            {
                'title': 'Section 3 & 4: Academic',
                'description': "Akademik diskusiya, lektsiya.",
                'lessons': [
                    ('Academic discussion', 'listening', 30),
                    ('Lecture comprehension', 'listening', 30),
                ],
            },
        ],
    },
    {
        'title': 'IELTS Reading',
        'description': "60 daqiqada 3 ta uzun matn, 40 ta savol.",
        'ielts_skill': 'reading',
        'icon': '📖',
        'order': 2,
        'modules': [
            {
                'title': 'Skimming and Scanning',
                'description': "Tezda kerakli ma'lumotni topish.",
                'lessons': [
                    ('Skimming strategies', 'reading', 25),
                    ('Scanning for keywords', 'reading', 25),
                ],
            },
            {
                'title': 'Question Types',
                'description': "True/False/Not Given, matching headings.",
                'lessons': [
                    ('True / False / Not Given', 'reading', 30),
                    ('Matching headings', 'reading', 30),
                ],
            },
        ],
    },
    {
        'title': 'IELTS Writing Task 1 & 2',
        'description': "Task 1 (150 so'z) + Task 2 (250 so'z).",
        'ielts_skill': 'writing',
        'icon': '✍️',
        'order': 3,
        'modules': [
            {
                'title': 'Task 1: Describing Visuals',
                'description': "Chart, graph, diagram tasvirlash.",
                'lessons': [
                    ('Line graphs', 'writing', 30),
                    ('Bar charts and pie charts', 'writing', 30),
                    ('Process diagrams', 'writing', 30),
                ],
            },
            {
                'title': 'Task 2: Opinion Essays',
                'description': "Fikr bildirish, dalil keltirish.",
                'lessons': [
                    ('Essay structure', 'writing', 30),
                    ('Introduction and thesis', 'writing', 25),
                    ('Body paragraphs', 'writing', 30),
                    ('Conclusion writing', 'writing', 20),
                ],
            },
        ],
    },
    {
        'title': 'IELTS Speaking',
        'description': "Part 1, 2, 3 — 11-14 daqiqalik suhbat.",
        'ielts_skill': 'speaking',
        'icon': '🗣️',
        'order': 4,
        'modules': [
            {
                'title': 'Part 1: Personal Questions',
                'description': "O'zingiz haqingizda oddiy savollar.",
                'lessons': [
                    ('Home, family, work', 'speaking', 20),
                    ('Hobbies and interests', 'speaking', 20),
                ],
            },
            {
                'title': 'Part 2: Long Turn',
                'description': "1-2 daqiqalik mavzu bo'yicha gapirish.",
                'lessons': [
                    ('Cue card strategies', 'speaking', 30),
                    ('Time management', 'speaking', 25),
                ],
            },
            {
                'title': 'Part 3: Discussion',
                'description': "Abstrakt savollar, fikr bildirish.",
                'lessons': [
                    ('Giving opinions', 'speaking', 25),
                    ('Comparing and contrasting', 'speaking', 25),
                ],
            },
        ],
    },
]


# ============================================================
# COMMAND
# ============================================================

class Command(BaseCommand):
    help = "Course / Module / Lesson skeleton seed (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help="Avval barcha Course/Module/Lesson'larni o'chirib, qaytadan to'ldirish",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: barcha content o'chiriladi..."))
            Lesson.objects.all().delete()
            Module.objects.all().delete()
            Course.objects.all().delete()
            self.stdout.write(self.style.WARNING("O'chirildi.\n"))

        self.stdout.write("📦 Content seed boshlandi...\n")

        self._seed_track('general', GENERAL_COURSES)
        self._seed_track('cefr', CEFR_COURSES)
        self._seed_track('ielts', IELTS_COURSES)

        total_courses = Course.objects.count()
        total_modules = Module.objects.count()
        total_lessons = Lesson.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Tugatildi: "
            f"{total_courses} ta course, "
            f"{total_modules} ta module, "
            f"{total_lessons} ta dars."
        ))

    def _seed_track(self, track_code, courses_data):
        track_label = {
            'general': '🗣️  General English',
            'cefr': '📚 CEFR',
            'ielts': '🎯 IELTS',
        }[track_code]
        self.stdout.write(f"\n{track_label}")

        for course_data in courses_data:
            modules_data = course_data.pop('modules')

            course_defaults = {
                'description': course_data.get('description', ''),
                'icon': course_data.get('icon', ''),
                'order': course_data.get('order', 0),
                'cefr_level': course_data.get('cefr_level', ''),
                'ielts_skill': course_data.get('ielts_skill', ''),
                'is_published': True,
            }
            course, created = Course.objects.get_or_create(
                track=track_code,
                title=course_data['title'],
                defaults=course_defaults,
            )
            marker = '+ yangi' if created else '✓ mavjud'
            self.stdout.write(f"  [{marker}] {course.title}")

            for m_order, module_data in enumerate(modules_data, start=1):
                lessons_data = module_data.pop('lessons')

                module, m_created = Module.objects.get_or_create(
                    course=course,
                    title=module_data['title'],
                    defaults={
                        'description': module_data.get('description', ''),
                        'order': m_order,
                        'is_published': True,
                    },
                )
                if m_created:
                    self.stdout.write(f"     + {module.title}")

                for l_order, lesson_tuple in enumerate(lessons_data, start=1):
                    title, lesson_type, minutes = lesson_tuple
                    Lesson.objects.get_or_create(
                        module=module,
                        title=title,
                        defaults={
                            'lesson_type': lesson_type,
                            'estimated_minutes': minutes,
                            'xp_reward': 10 + (minutes // 5),
                            'order': l_order,
                            'is_published': True,
                            'description': f"{title} — bu darsda asosiy materiallar berilgan.",
                        },
                    )