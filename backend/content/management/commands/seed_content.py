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
                ],
            },
            {
                'title': 'Daily Routines',
                'description': 'Kunlik amallar haqida gapirish.',
                'lessons': [
                    ('Morning routine', 'vocabulary', 12),
                    ('Time and schedule', 'grammar', 18),
                    ('Weekend activities', 'reading', 15),
                ],
            },
            {
                'title': 'Food and Drinks',
                'description': 'Restoran, oziq-ovqat, taom buyurtma qilish.',
                'lessons': [
                    ('Ordering at a cafe', 'speaking', 15),
                    ('Food vocabulary', 'vocabulary', 10),
                    ('At the supermarket', 'listening', 12),
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
                ],
            },
            {
                'title': 'Hotels and Hostels',
                'description': "Joy bron qilish, muammolarni hal qilish.",
                'lessons': [
                    ('Booking a room', 'speaking', 15),
                    ('Hotel facilities', 'vocabulary', 10),
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
                ],
            },
            {
                'title': 'Phone Calls',
                'description': 'Telefon orqali muloqot.',
                'lessons': [
                    ('Making a call', 'speaking', 15),
                    ('Leaving a message', 'listening', 12),
                ],
            },
        ],
    },
]


CEFR_COURSES = [
    {
        'title': 'A1 — Foundation',
        'description': 'Boshlovchilar uchun. Alifbo, oddiy gaplar, asosiy so\'zlar.',
        'cefr_level': 'A1',
        'icon': '🌱',
        'order': 1,
        'modules': [
            {
                'title': 'Alphabet and Numbers',
                'description': 'Alifbo, raqamlar, ranglar.',
                'lessons': [
                    ('The English alphabet', 'vocabulary', 10),
                    ('Numbers 1-100', 'vocabulary', 12),
                    ('Colors and shapes', 'vocabulary', 10),
                ],
            },
            {
                'title': 'Greetings & Introductions',
                'description': "Salomlashish va tanishish.",
                'lessons': [
                    ('Saying Hello', 'vocabulary', 10),
                    ('My name is...', 'speaking', 12),
                    ('Family members', 'vocabulary', 15),
                ],
            },
            {
                'title': 'Basic Verbs',
                'description': 'Eng muhim 30 ta fe\'l.',
                'lessons': [
                    ('To be', 'grammar', 15),
                    ('To have', 'grammar', 12),
                    ('Action verbs', 'vocabulary', 15),
                ],
            },
        ],
    },
    {
        'title': 'A2 — Elementary',
        'description': "Oddiy o'tgan va kelasi zamon, ko'p ishlatiladigan iboralar.",
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
                ],
            },
            {
                'title': 'Future Plans',
                'description': "Kelajak rejalari: going to, will.",
                'lessons': [
                    ('Going to', 'grammar', 15),
                    ('Will vs going to', 'grammar', 18),
                ],
            },
            {
                'title': 'Comparatives',
                'description': "Taqqoslash: bigger, smaller, the best.",
                'lessons': [
                    ('Comparative adjectives', 'grammar', 15),
                    ('Superlatives', 'grammar', 15),
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
                ],
            },
            {
                'title': 'Modal Verbs',
                'description': "Should, must, might, may.",
                'lessons': [
                    ('Should and must', 'grammar', 18),
                    ('May and might', 'grammar', 18),
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
                ],
            },
            {
                'title': 'Reported Speech',
                'description': "Boshqa kishining gapini ko'rsatish.",
                'lessons': [
                    ('Reported statements', 'grammar', 22),
                    ('Reported questions', 'grammar', 22),
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
                    ('Mixed conditionals', 'grammar', 25),
                ],
            },
            {
                'title': 'Academic Vocabulary',
                'description': "Ilmiy maqolalarda uchraydigan so'zlar.",
                'lessons': [
                    ('Academic word list intro', 'vocabulary', 20),
                    ('Formal vs informal vocab', 'vocabulary', 20),
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
                'title': 'Idioms & Expressions',
                'description': "Native speaker iboralari.",
                'lessons': [
                    ('Common idioms', 'vocabulary', 25),
                    ('Cultural expressions', 'reading', 25),
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

        # General
        self._seed_track('general', GENERAL_COURSES)

        # CEFR
        self._seed_track('cefr', CEFR_COURSES)

        # IELTS
        self._seed_track('ielts', IELTS_COURSES)

        # Hisobot
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

            # Course
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

            # Modules
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

                # Lessons
                for l_order, lesson_tuple in enumerate(lessons_data, start=1):
                    title, lesson_type, minutes = lesson_tuple
                    Lesson.objects.get_or_create(
                        module=module,
                        title=title,
                        defaults={
                            'lesson_type': lesson_type,
                            'estimated_minutes': minutes,
                            'xp_reward': 10 + (minutes // 5),  # uzunroq = ko'proq XP
                            'order': l_order,
                            'is_published': True,
                            'description': f"{title} — bu darsda asosiy materiallar berilgan.",
                        },
                    )