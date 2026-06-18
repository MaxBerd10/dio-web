"""
17 ta Grammar Topic + qoidalar + misollar seed.

Foydalanish:
    python manage.py seed_grammar
    python manage.py seed_grammar --reset
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Lesson
from grammar.models import GrammarTopic, GrammarRule, GrammarExample, LessonGrammar


# ============================================================
# DATA — Grammar mavzulari
# ============================================================
# Format: dict bilan oson o'qiladi.
# Examples: tuple of (sentence, translation, highlight, is_incorrect)
# ============================================================

GRAMMAR_TOPICS = [
    {
        'title': 'Present Simple',
        'category': 'tenses',
        'cefr_level': 'A1',
        'icon': '⏱️',
        'short_description': "Hozirgi oddiy zamon — kundalik harakatlar va faktlar uchun.",
        'description': (
            "**Present Simple** zamoni quyidagi vaziyatlarda ishlatiladi:\n\n"
            "- Kundalik takrorlanadigan harakatlar (*I work every day*)\n"
            "- Doimiy faktlar (*The sun rises in the east*)\n"
            "- Odatlar va xobbi (*She plays tennis*)\n"
            "- Jadval va vaqt (*The train leaves at 7*)"
        ),
        'rules': [
            {
                'title': 'Affirmative form',
                'formula': 'Subject + V1 (+ s/es for he/she/it) + Object',
                'explanation': (
                    'Affirmative gaplarda fe\'lning birinchi shakli ishlatiladi. '
                    'He/she/it olmoshlari uchun fe\'lga -s yoki -es qo\'shiladi.'
                ),
                'explanation_uz': (
                    'Tasdiq gaplarda fe\'lning oddiy shakli ishlatiladi. '
                    'U (he/she/it) bilan -s qo\'shiladi.'
                ),
                'tips': (
                    "- s/es qoidalari:\n"
                    "  * Ko'p fe'llarda -s qo'shiladi: work → works\n"
                    "  * -ch/-sh/-x/-o/-ss bilan tugaganda -es: watch → watches\n"
                    "  * Undosh + y → ies: study → studies"
                ),
                'common_mistakes': (
                    "❌ He don't work here.\n"
                    "✓ He doesn't work here.\n\n"
                    "❌ She work in a bank.\n"
                    "✓ She works in a bank."
                ),
                'examples': [
                    ('I work in Tashkent.', 'Men Toshkentda ishlayman.', 'work', False),
                    ('She works in a hospital.', 'U kasalxonada ishlaydi.', 'works', False),
                    ('They live in Samarkand.', 'Ular Samarqandda yashashadi.', 'live', False),
                    ('She work in a hospital.', '(noto\'g\'ri)', 'work', True),
                ],
            },
            {
                'title': 'Negative form',
                'formula': "Subject + don't / doesn't + V1 + Object",
                'explanation': (
                    'Negative gaplar uchun "do not" (don\'t) yoki "does not" (doesn\'t) ishlatiladi. '
                    'He/she/it uchun "doesn\'t".'
                ),
                'tips': "doesn't ishlatilganda asosiy fe'l -s olmaydi.",
                'common_mistakes': (
                    "❌ He doesn't works here.\n"
                    "✓ He doesn't work here."
                ),
                'examples': [
                    ("I don't like coffee.", 'Menga qahva yoqmaydi.', "don't", False),
                    ("He doesn't speak Russian.", 'U rus tilida gapirmaydi.', "doesn't", False),
                    ("He doesn't works here.", '(noto\'g\'ri)', "doesn't works", True),
                ],
            },
            {
                'title': 'Question form',
                'formula': 'Do / Does + Subject + V1 + Object?',
                'explanation': 'Savol gaplarda "Do" yoki "Does" gap boshida keladi.',
                'tips': "Wh-savollar bilan: What do you do? Where does she live?",
                'examples': [
                    ('Do you speak English?', 'Siz inglizcha gapirasizmi?', 'Do', False),
                    ('Does she work here?', 'U bu yerda ishlaydimi?', 'Does', False),
                    ('Where do they live?', 'Ular qayerda yashashadi?', 'Where do', False),
                ],
            },
        ],
    },

    {
        'title': 'Present Continuous',
        'category': 'tenses',
        'cefr_level': 'A1',
        'icon': '🔄',
        'short_description': "Hozirgi davom etayotgan zamon — ayni shu daqiqada bo'layotgan harakat.",
        'description': (
            "**Present Continuous** ishlatiladi:\n\n"
            "- Ayni hozir bo'layotgan harakat (*I'm reading now*)\n"
            "- Vaqtinchalik holatlar (*She's living with her parents this month*)\n"
            "- Yaqin kelajak rejalari (*We're meeting tomorrow*)"
        ),
        'rules': [
            {
                'title': 'Affirmative: am / is / are + V-ing',
                'formula': 'Subject + am/is/are + verb-ing',
                'explanation': "to be (am/is/are) + asosiy fe'lga -ing qo'shiladi.",
                'tips': (
                    "- I am → I'm\n"
                    "- He is → He's\n"
                    "- They are → They're"
                ),
                'examples': [
                    ("I'm reading a book.", 'Men kitob o\'qiyapman.', 'reading', False),
                    ('She is studying English.', 'U ingliz tilini o\'rganmoqda.', 'studying', False),
                    ('They are playing football.', 'Ular futbol o\'ynashmoqda.', 'playing', False),
                ],
            },
            {
                'title': 'Present Simple vs Present Continuous',
                'formula': '',
                'explanation': (
                    'Present Simple — doimiy / takrorlanadigan; '
                    'Present Continuous — hozir / vaqtincha bo\'layotgan.'
                ),
                'common_mistakes': (
                    "❌ I am working in Tashkent every day.\n"
                    "✓ I work in Tashkent every day. (doimiy fakt)"
                ),
                'examples': [
                    ('I work in a bank. (doimiy)', 'Men bankda ishlayman.', '', False),
                    ("I'm working at home today. (bugun)", 'Bugun uyda ishlayapman.', '', False),
                ],
            },
        ],
    },

    {
        'title': 'Past Simple',
        'category': 'tenses',
        'cefr_level': 'A2',
        'icon': '⏪',
        'short_description': "O'tgan zamon — tugagan harakat.",
        'description': (
            "**Past Simple** ishlatiladi tugagan, o'tgan voqea uchun. "
            "Vaqt belgilari: yesterday, last week, in 2010, ago."
        ),
        'rules': [
            {
                'title': 'Regular verbs (-ed)',
                'formula': 'Subject + V-ed + Object',
                'explanation': "Ko'p fe'llarga -ed qo'shiladi: work → worked, play → played.",
                'tips': (
                    "Tovushlash qoidalari:\n"
                    "- /t/ — talked, walked (jarangsizdan keyin)\n"
                    "- /d/ — played, lived (jarangli/unlidan keyin)\n"
                    "- /ɪd/ — wanted, needed (-t/-d dan keyin)"
                ),
                'examples': [
                    ('I worked yesterday.', 'Men kecha ishladim.', 'worked', False),
                    ('She played tennis last week.', 'U o\'tgan hafta tennis o\'ynadi.', 'played', False),
                    ('They visited Bukhara.', 'Ular Buxoroga borishdi.', 'visited', False),
                ],
            },
            {
                'title': 'Irregular verbs',
                'formula': "V2 (har xil shakl)",
                'explanation': (
                    "Ba'zi fe'llar -ed olmaydi, balki o'zining ikkinchi shakliga ega: "
                    "go → went, see → saw, eat → ate."
                ),
                'tips': (
                    "Eng muhim irregular fe'llar:\n"
                    "- be → was/were\n"
                    "- have → had\n"
                    "- go → went\n"
                    "- do → did\n"
                    "- see → saw\n"
                    "- come → came"
                ),
                'examples': [
                    ('I went to Samarkand.', 'Men Samarqandga bordim.', 'went', False),
                    ('She had breakfast at 8.', 'U 8 da nonushta qildi.', 'had', False),
                    ('We saw a movie yesterday.', 'Biz kecha kino ko\'rdik.', 'saw', False),
                    ('I goed to school. (noto\'g\'ri)', '(noto\'g\'ri shakl)', 'goed', True),
                ],
            },
            {
                'title': 'Negative and questions',
                'formula': "Did + Subject + V1 (+) / didn't + V1 (-)",
                'explanation': (
                    "Past Simple savol va inkor uchun did/didn't ishlatiladi. "
                    "Asosiy fe'l V1 shakliga qaytadi."
                ),
                'common_mistakes': (
                    "❌ I didn't went there.\n"
                    "✓ I didn't go there."
                ),
                'examples': [
                    ("Did you see her?", 'Siz uni ko\'rdingizmi?', 'Did', False),
                    ("I didn't go to work.", 'Men ishga bormadim.', "didn't go", False),
                ],
            },
        ],
    },

    {
        'title': 'Articles (a / an / the)',
        'category': 'articles',
        'cefr_level': 'A1',
        'icon': '🔤',
        'short_description': "a, an, the — qaysi biri va qachon ishlatilishi.",
        'description': (
            "Inglizcha 3 ta article bor:\n\n"
            "- **a** — undosh tovush bilan boshlangan so'z oldidan (*a book*)\n"
            "- **an** — unli tovush bilan (*an apple*)\n"
            "- **the** — aniq predmet (*the book on the table*)"
        ),
        'rules': [
            {
                'title': 'Indefinite articles: a / an',
                'formula': 'a + consonant sound, an + vowel sound',
                'explanation': (
                    "a/an birinchi marta zikr qilingan, bitta predmet uchun. "
                    "Tanlov tovush bo'yicha, harf bo'yicha emas."
                ),
                'tips': (
                    "Diqqat tovushga, harfga emas:\n"
                    "- an hour (/aʊə/ unli tovush) ✓\n"
                    "- a university (/juː/ undosh tovush) ✓"
                ),
                'examples': [
                    ('I have a book.', 'Mening kitobim bor.', 'a', False),
                    ('She is an engineer.', 'U muhandis.', 'an', False),
                    ('It takes an hour.', 'Bir soat oladi.', 'an', False),
                    ('A university is big.', 'Universitet katta.', 'A', False),
                ],
            },
            {
                'title': 'Definite article: the',
                'formula': 'the + specific noun',
                'explanation': (
                    "the — gap qiluvchi va tinglovchi ikkalasi biladigan "
                    "aniq predmet uchun. Yagona predmetlar (the sun, the moon) "
                    "uchun ham ishlatiladi."
                ),
                'examples': [
                    ('The book on the table is mine.', 'Stol ustidagi kitob meniki.', 'The', False),
                    ('The sun is bright.', 'Quyosh yorqin.', 'The', False),
                    ('Open the door, please.', 'Eshikni oching, iltimos.', 'the', False),
                ],
            },
        ],
    },

    {
        'title': 'Plural Nouns',
        'category': 'other',
        'cefr_level': 'A1',
        'icon': '➕',
        'short_description': "Ko'plik shakli: -s, -es, irregular.",
        'description': "Ko'plik shaklini yasash qoidalari.",
        'rules': [
            {
                'title': 'Regular plurals (-s, -es, -ies)',
                'formula': 'noun + s / es / ies',
                'explanation': (
                    "Ko'pchilik otlarga -s qo'shiladi. -ch/-sh/-x/-s/-ss bilan tugaganlarga "
                    "-es. Undosh + y → ies."
                ),
                'examples': [
                    ('one book → two books', 'bir kitob → ikki kitob', 'books', False),
                    ('one box → two boxes', 'bir quti → ikki quti', 'boxes', False),
                    ('one baby → two babies', 'bir chaqaloq → ikki chaqaloq', 'babies', False),
                ],
            },
            {
                'title': 'Irregular plurals',
                'formula': '',
                'explanation': "Ba'zi otlarning ko'plik shakli boshqacha.",
                'tips': (
                    "Eng muhim irregular ko'pliklar:\n"
                    "- child → children\n"
                    "- man → men\n"
                    "- woman → women\n"
                    "- foot → feet\n"
                    "- tooth → teeth\n"
                    "- mouse → mice"
                ),
                'examples': [
                    ('one child → two children', 'bir bola → ikki bola', 'children', False),
                    ('one man → two men', 'bir erkak → ikki erkak', 'men', False),
                    ('one mouse → two mice', 'bir sichqon → ikki sichqon', 'mice', False),
                    ('one childs (noto\'g\'ri)', '(noto\'g\'ri)', 'childs', True),
                ],
            },
        ],
    },

    {
        'title': 'Possessive Pronouns',
        'category': 'pronouns',
        'cefr_level': 'A1',
        'icon': '🔑',
        'short_description': "My, your, his, her, our, their.",
        'description': "Egalik olmoshlari va ulardan keyin keladigan ot.",
        'rules': [
            {
                'title': 'Possessive adjectives',
                'formula': 'Possessive + Noun',
                'explanation': "my, your, his, her, its, our, their — keyin ot keladi.",
                'examples': [
                    ('This is my book.', 'Bu mening kitobim.', 'my', False),
                    ('Your name is John.', 'Sizning ismingiz John.', 'Your', False),
                    ('Her car is red.', 'Uning mashinasi qizil.', 'Her', False),
                    ('Our school is big.', 'Bizning maktabimiz katta.', 'Our', False),
                ],
            },
        ],
    },

    {
        'title': 'Comparatives and Superlatives',
        'category': 'comparatives',
        'cefr_level': 'A2',
        'icon': '📈',
        'short_description': "Bigger, biggest — taqqoslash shakllari.",
        'description': "Sifatlarning taqqoslash darajalari.",
        'rules': [
            {
                'title': 'Short adjectives (1 syllable)',
                'formula': 'adj + er / the + adj + est',
                'explanation': "1 bo'g'inli sifatlarga -er/-est qo'shiladi.",
                'tips': (
                    "- big → bigger → the biggest (oxirgi undosh ikki marta)\n"
                    "- nice → nicer → the nicest (e bo'lsa faqat -r/-st)\n"
                    "- happy → happier → the happiest (y → i)"
                ),
                'examples': [
                    ('My house is bigger than yours.', 'Mening uyim sizning uyingizdan katta.', 'bigger', False),
                    ('This is the biggest city.', 'Bu eng katta shahar.', 'the biggest', False),
                    ('She is happier today.', 'U bugun baxtliroq.', 'happier', False),
                ],
            },
            {
                'title': 'Long adjectives (2+ syllables)',
                'formula': 'more + adj / the most + adj',
                'explanation': "2 va undan ortiq bo'g'inli sifatlar uchun more / the most.",
                'common_mistakes': (
                    "❌ This is more bigger.\n"
                    "✓ This is bigger.\n\n"
                    "❌ She is beautifuler.\n"
                    "✓ She is more beautiful."
                ),
                'examples': [
                    ('This book is more interesting.', 'Bu kitob qiziqarliroq.', 'more interesting', False),
                    ('She is the most beautiful.', 'U eng go\'zal.', 'the most beautiful', False),
                ],
            },
        ],
    },

    {
        'title': 'Modal Verbs: can / could',
        'category': 'modals',
        'cefr_level': 'A2',
        'icon': '💪',
        'short_description': "Imkoniyat va so'rov: I can, could you...",
        'description': "Can va could — qobiliyat va xushmuomalalik uchun.",
        'rules': [
            {
                'title': 'Can — ability and possibility',
                'formula': 'Subject + can + V1',
                'explanation': "can — hozirgi qobiliyat. Inkor: can't (cannot).",
                'examples': [
                    ('I can speak English.', 'Men inglizcha gapira olaman.', 'can', False),
                    ("She can't drive.", 'U mashina haydolmaydi.', "can't", False),
                    ('Can you help me?', 'Menga yordam bera olasizmi?', 'Can', False),
                ],
            },
            {
                'title': 'Could — past ability and polite requests',
                'formula': 'Subject + could + V1',
                'explanation': (
                    "could — o'tgan qobiliyat yoki xushmuomalalik so'rovi. "
                    "Could you... — Can you...'dan xushmuomalaroq."
                ),
                'examples': [
                    ('I could run fast when I was young.', 'Yoshligimda tez yugurardim.', 'could', False),
                    ('Could you open the door?', 'Iltimos eshikni ochasizmi?', 'Could', False),
                ],
            },
        ],
    },

    {
        'title': 'First Conditional',
        'category': 'conditionals',
        'cefr_level': 'B1',
        'icon': '🔀',
        'short_description': "If + Present, will + V1 — real kelajak shart.",
        'description': "Birinchi turdagi shart gaplar — real, mumkin bo'lgan kelajak.",
        'rules': [
            {
                'title': 'Structure',
                'formula': 'If + Present Simple, Subject + will + V1',
                'explanation': (
                    "Shart real va kelajakda yuz berishi mumkin. "
                    "If bandida Present Simple, asosiy gapda will."
                ),
                'common_mistakes': (
                    "❌ If it will rain, I will stay home.\n"
                    "✓ If it rains, I will stay home. (if bandida will yo'q)"
                ),
                'examples': [
                    ('If it rains, I will stay home.', 'Yomg\'ir yog\'sa, uyda qolaman.', 'If it rains', False),
                    ("If you study, you'll pass the exam.", 'O\'qisang, imtihondan o\'tasan.', 'If you study', False),
                    ('I will help you if you need it.', 'Kerak bo\'lsa, sizga yordam beraman.', 'if you need', False),
                ],
            },
        ],
    },

    {
        'title': 'Passive Voice',
        'category': 'passive',
        'cefr_level': 'B2',
        'icon': '🔁',
        'short_description': "Passiv ovoz — kim bajarganidan ko'ra nima qilinganligi muhim.",
        'description': (
            "Passive Voice harakat predmetga qaratilganda ishlatiladi. "
            "Misol: 'The book was written by Tolstoy' — kitob muhimroq, kim yozgani emas."
        ),
        'rules': [
            {
                'title': 'Present Simple Passive',
                'formula': 'Subject + am/is/are + V3 (+ by + agent)',
                'explanation': "to be (hozirgi) + asosiy fe'lning 3-shakli (past participle).",
                'examples': [
                    ('English is spoken worldwide.', 'Ingliz tilida butun dunyoda gapirishadi.', 'is spoken', False),
                    ('Cars are made in Japan.', 'Mashinalar Yaponiyada ishlab chiqariladi.', 'are made', False),
                ],
            },
            {
                'title': 'Past Simple Passive',
                'formula': 'Subject + was/were + V3 (+ by + agent)',
                'explanation': "to be (o'tgan: was/were) + V3.",
                'examples': [
                    ('The book was written in 1869.', 'Kitob 1869 yilda yozilgan.', 'was written', False),
                    ('The houses were built last year.', 'Uylar o\'tgan yili qurilgan.', 'were built', False),
                ],
            },
        ],
    },

    # ============================================================
    # YANGI A1 TOPICS
    # ============================================================

    {
        'title': 'Personal Pronouns',
        'category': 'pronouns',
        'cefr_level': 'A1',
        'icon': '👤',
        'short_description': "I, you, he, she, it, we, they — shaxs olmoshlari.",
        'description': (
            "Inglizchada 7 ta shaxs olmoshi bor. Bu olmoshlar gap egasi sifatida ishlatiladi.\n\n"
            "- **I** — men\n"
            "- **You** — siz/sen (yakka va ko'plik bir xil!)\n"
            "- **He** — u (erkak)\n"
            "- **She** — u (ayol)\n"
            "- **It** — u (jonsiz narsa, hayvon)\n"
            "- **We** — biz\n"
            "- **They** — ular"
        ),
        'rules': [
            {
                'title': 'Subject pronouns as gap egasi',
                'formula': 'Pronoun + Verb + Object',
                'explanation': (
                    "Inglizcha gapda ega doim bo'lishi shart. O'zbek tilida ega tushib qolishi mumkin, "
                    "lekin inglizchada yo'q."
                ),
                'tips': (
                    "Eslatma:\n"
                    "- 'You' yakka va ko'plik bir xil\n"
                    "- 'It' faqat jonsiz narsalar va hayvonlar uchun\n"
                    "- 'I' har doim bosh harf bilan yoziladi (gap o'rtasida ham)"
                ),
                'common_mistakes': (
                    "❌ Am a student.\n"
                    "✓ I am a student.\n\n"
                    "❌ Is hot today.\n"
                    "✓ It is hot today."
                ),
                'examples': [
                    ('I am from Uzbekistan.', "Men O'zbekistondanman.", 'I', False),
                    ('You are my friend.', "Sen mening do'stimsan.", 'You', False),
                    ('He is a doctor.', "U shifokor.", 'He', False),
                    ('She is my sister.', "U mening opam.", 'She', False),
                    ('It is a big city.', "U katta shahar.", 'It', False),
                    ('We are happy.', "Biz baxtlimiz.", 'We', False),
                    ('They are students.', "Ular o'quvchilar.", 'They', False),
                    ('Am a teacher.', "(noto'g'ri — ega yo'q)", 'Am', True),
                ],
            },
        ],
    },

    {
        'title': 'Demonstratives: this, that, these, those',
        'category': 'pronouns',
        'cefr_level': 'A1',
        'icon': '👉',
        'short_description': "this/that/these/those — bu, anavi, bular, anavilar.",
        'description': (
            "Demonstrative olmoshlar — biror narsani ko'rsatish uchun ishlatiladi.\n\n"
            "Yaqindagi narsalar uchun: **this** (yakka), **these** (ko'plik)\n\n"
            "Uzoqdagi narsalar uchun: **that** (yakka), **those** (ko'plik)"
        ),
        'rules': [
            {
                'title': 'Yaqin va uzoqdagi narsalar',
                'formula': 'this/that + Singular Noun  /  these/those + Plural Noun',
                'explanation': (
                    "this/that — bitta narsa uchun. "
                    "these/those — bir nechta narsa uchun. "
                    "this/these — yaqindagi narsalar. "
                    "that/those — uzoqdagi narsalar."
                ),
                'tips': (
                    "Vizual yodlash:\n"
                    "- this 👉 (men yonidagi bitta narsa)\n"
                    "- that 👈 (uzoqdagi bitta narsa)\n"
                    "- these 👇 (men yonidagi ko'p narsa)\n"
                    "- those ↗️ (uzoqdagi ko'p narsa)"
                ),
                'common_mistakes': (
                    "❌ This are my books.\n"
                    "✓ These are my books. (ko'plik — these)\n\n"
                    "❌ That books are interesting.\n"
                    "✓ Those books are interesting."
                ),
                'examples': [
                    ('This is my book.', "Bu mening kitobim.", 'This', False),
                    ('That is your car.', "Anavi sizning mashinangiz.", 'That', False),
                    ('These are my friends.', "Bular mening do'stlarim.", 'These', False),
                    ('Those are her shoes.', "Anavilar uning tuflilari.", 'Those', False),
                    ('This are my pens.', "(noto'g'ri)", 'This', True),
                ],
            },
        ],
    },

    {
        'title': 'There is / There are',
        'category': 'other',
        'cefr_level': 'A1',
        'icon': '📍',
        'short_description': "Bor / Mavjud — biror narsa borligini bildirish.",
        'description': (
            "**There is** va **there are** — biror joyda nimadir borligini aytish uchun "
            "ishlatiladi. O'zbekchada 'bor' ma'nosida.\n\n"
            "- **There is** + yakka ot (bitta narsa)\n"
            "- **There are** + ko'plik ot (bir nechta narsa)"
        ),
        'rules': [
            {
                'title': 'Affirmative (tasdiq)',
                'formula': 'There is + singular  /  There are + plural',
                'explanation': (
                    "'There is' qisqa shakli — there's. 'There are' qisqa shakli yo'q "
                    "(faqat yozma matnda 'there're ko'rinishi mumkin)."
                ),
                'tips': (
                    "Joy belgilari bilan ishlatiladi:\n"
                    "- in the room — xonada\n"
                    "- on the table — stolda\n"
                    "- under the chair — stul ostida\n"
                    "- next to the door — eshik yonida"
                ),
                'examples': [
                    ('There is a book on the table.', "Stol ustida kitob bor.", 'There is', False),
                    ('There are five chairs in the room.', "Xonada beshta stul bor.", 'There are', False),
                    ("There's a cat in the garden.", "Bog'da mushuk bor.", "There's", False),
                ],
            },
            {
                'title': 'Negative and questions',
                'formula': "There isn't + singular  /  Is there + singular?",
                'explanation': "Inkor: there is not (isn't), there are not (aren't). Savol: Is/Are there...?",
                'examples': [
                    ("There isn't any milk.", "Sut yo'q.", "isn't", False),
                    ("There aren't any students here.", "Bu yerda o'quvchilar yo'q.", "aren't", False),
                    ('Is there a hotel near here?', "Yaqin atrofda mehmonxona bormi?", 'Is there', False),
                    ('Are there any questions?', "Savollar bormi?", 'Are there', False),
                ],
            },
        ],
    },

    {
        'title': 'Have got',
        'category': 'tenses',
        'cefr_level': 'A1',
        'icon': '🎒',
        'short_description': "Egalik bildirish: I have got = I have.",
        'description': (
            "**Have got** — egalik bildirish uchun ishlatiladi. "
            "Britaniya inglizchasida ko'p, Amerika inglizchasida kamroq.\n\n"
            "**Have got** = **have** ma'nosi bir xil, lekin 'have got' ko'pincha hozirgi "
            "vaqtdagi egalik uchun ishlatiladi."
        ),
        'rules': [
            {
                'title': 'Have/Has got',
                'formula': "Subject + have/has + got + Object",
                'explanation': (
                    "He/she/it bilan 'has got'. Boshqa ega bilan 'have got'. "
                    "Qisqa shakl: I've got, He's got, She's got."
                ),
                'tips': (
                    "Qachon ishlatish:\n"
                    "- Hozirgi egalik: I've got a car.\n"
                    "- Oilaviy aloqalar: She's got two brothers.\n"
                    "- Tana qismlari: He's got blue eyes.\n"
                    "- Kasalliklar: I've got a headache."
                ),
                'common_mistakes': (
                    "❌ He have got a dog.\n"
                    "✓ He has got a dog.\n\n"
                    "❌ I got a problem.\n"
                    "✓ I've got a problem."
                ),
                'examples': [
                    ("I've got a new phone.", "Mening yangi telefonim bor.", "I've got", False),
                    ("She's got long hair.", "Uning sochi uzun.", "She's got", False),
                    ("We've got two children.", "Bizning ikkita bolamiz bor.", "We've got", False),
                    ("Have you got a pen?", "Sizning ruchkangiz bormi?", 'Have you got', False),
                    ("He haven't got a car.", "(noto'g'ri)", "haven't", True),
                ],
            },
        ],
    },

    {
        'title': 'Prepositions of Place',
        'category': 'other',
        'cefr_level': 'A1',
        'icon': '📦',
        'short_description': "in, on, under, at — joy bildiruvchi predloglar.",
        'description': (
            "Predloglar — narsalarning joylashishini bildirish uchun ishlatiladi. "
            "Eng asosiy 3 tasi: **in**, **on**, **at**."
        ),
        'rules': [
            {
                'title': 'In / On / At',
                'formula': "in (ichida)  /  on (ustida)  /  at (yonida)",
                'explanation': (
                    "- **in** — yopiq joy ichida (in the room, in the box)\n"
                    "- **on** — yuza ustida (on the table, on the wall)\n"
                    "- **at** — aniq nuqta (at home, at school, at the door)"
                ),
                'tips': (
                    "Maxsus joylar:\n"
                    "- at home (uyda — predlog yo'q!)\n"
                    "- at work (ishda)\n"
                    "- at school (maktabda)\n"
                    "- in bed (yotoqda)\n"
                    "- in hospital (kasalxonada)"
                ),
                'examples': [
                    ('The book is on the table.', "Kitob stol ustida.", 'on', False),
                    ('The cat is in the box.', "Mushuk quti ichida.", 'in', False),
                    ('I am at home.', "Men uydaman.", 'at', False),
                    ('She is in the kitchen.', "U oshxonada.", 'in', False),
                ],
            },
            {
                'title': 'Other place prepositions',
                'formula': "under / next to / behind / in front of / between",
                'explanation': "Boshqa muhim predloglar joylashishni aniqroq bildiradi.",
                'examples': [
                    ('The ball is under the chair.', "To'p stul ostida.", 'under', False),
                    ('My car is next to the house.', "Mening mashinam uy yonida.", 'next to', False),
                    ('The garden is behind the house.', "Bog' uy orqasida.", 'behind', False),
                    ('A man is in front of the door.', "Eshik oldida bir kishi.", 'in front of', False),
                    ('The bank is between the shop and the cafe.', "Bank do'kon va kafe orasida.", 'between', False),
                ],
            },
        ],
    },

    {
        'title': 'Question Words',
        'category': 'other',
        'cefr_level': 'A1',
        'icon': '❓',
        'short_description': "What, where, when, who, why, how — savol so'zlari.",
        'description': (
            "Savol so'zlari (Wh-questions) — gap boshida keladi va aniq ma'lumot so'raydi. "
            "'Yes/No' javob talab qilmaydi.\n\n"
            "Eng muhim 6 ta: What, Where, When, Who, Why, How"
        ),
        'rules': [
            {
                'title': 'Basic question words',
                'formula': 'Question word + auxiliary + Subject + Verb?',
                'explanation': (
                    "Savol so'zi doim gap boshida. Keyin yordamchi fe'l (do/does/is/are), "
                    "keyin ega, keyin asosiy fe'l."
                ),
                'tips': (
                    "Har biri nima so'raydi:\n"
                    "- **What** — nima? (narsa)\n"
                    "- **Where** — qayerda? (joy)\n"
                    "- **When** — qachon? (vaqt)\n"
                    "- **Who** — kim? (odam)\n"
                    "- **Why** — nega? (sabab)\n"
                    "- **How** — qanday? (usul, holat)"
                ),
                'examples': [
                    ('What is your name?', "Ismingiz nima?", 'What', False),
                    ('Where do you live?', "Qayerda yashaysiz?", 'Where', False),
                    ('When is your birthday?', "Tug'ilgan kuningiz qachon?", 'When', False),
                    ('Who is that man?', "Anavi kishi kim?", 'Who', False),
                    ('Why are you sad?', "Nega g'amginsiz?", 'Why', False),
                    ('How are you?', "Qalaysiz?", 'How', False),
                ],
            },
            {
                'title': 'How + adjective/adverb',
                'formula': "How + adj/adv + ...?",
                'explanation': "How so'zi sifat yoki ravish bilan birikib, aniq miqdor yoki daraja so'raydi.",
                'tips': (
                    "Foydali iboralar:\n"
                    "- How much? — qancha? (sanab bo'lmaydigan)\n"
                    "- How many? — qancha? (sanab bo'ladigan)\n"
                    "- How old? — necha yoshda?\n"
                    "- How long? — qancha uzun/vaqt?\n"
                    "- How often? — qanchalik tez-tez?"
                ),
                'examples': [
                    ('How old are you?', "Necha yoshdasiz?", 'How old', False),
                    ('How much is this?', "Buning narxi qancha?", 'How much', False),
                    ('How many books do you have?', "Nechta kitobingiz bor?", 'How many', False),
                    ('How long does it take?', "Qancha vaqt oladi?", 'How long', False),
                ],
            },
        ],
    },

    # ============================================================
    # YANGI A2 TOPIC
    # ============================================================

    {
        'title': 'Adverbs of Frequency',
        'category': 'other',
        'cefr_level': 'A2',
        'icon': '⏰',
        'short_description': "always, usually, often, sometimes, never — tez-tezlik ravishlari.",
        'description': (
            "Tez-tezlik ravishlari — qancha tez-tez biror narsa qilinishini bildiradi. "
            "Asosan Present Simple bilan ishlatiladi.\n\n"
            "Tarkibi (yuqoridan pastga — eng tez-tezdan eng kamigacha):\n"
            "- **always** — har doim (100%)\n"
            "- **usually** — odatda (90%)\n"
            "- **often** — ko'pincha (70%)\n"
            "- **sometimes** — ba'zan (50%)\n"
            "- **rarely** — kamdan-kam (20%)\n"
            "- **never** — hech qachon (0%)"
        ),
        'rules': [
            {
                'title': 'Position in sentence',
                'formula': 'Subject + frequency adverb + Verb  (be bilan: Subject + be + frequency)',
                'explanation': (
                    "Asosiy fe'l bilan: ravish fe'ldan oldin keladi.\n"
                    "'Be' fe'li bilan: ravish 'be' dan keyin keladi."
                ),
                'tips': (
                    "Gap boshida bo'lishi mumkin (asosan 'sometimes', 'usually', 'often'):\n"
                    "- Sometimes I go to the park.\n"
                    "- Usually we eat at 7."
                ),
                'common_mistakes': (
                    "❌ I go always to school by bus.\n"
                    "✓ I always go to school by bus.\n\n"
                    "❌ She is never late.\n"
                    "✓ She is never late. (be bilan to'g'ri)"
                ),
                'examples': [
                    ('I always drink coffee in the morning.', "Men ertalab har doim qahva ichaman.", 'always', False),
                    ('She usually goes to bed at 11.', "U odatda 11 da yotadi.", 'usually', False),
                    ('We often eat at restaurants.', "Biz ko'pincha restoranda ovqat yeymiz.", 'often', False),
                    ('They sometimes visit us.', "Ular ba'zan bizga kelishadi.", 'sometimes', False),
                    ('He never smokes.', "U hech qachon chekmaydi.", 'never', False),
                    ('She is always happy.', "U doim baxtli.", 'is always', False),
                    ('I go always to school.', "(noto'g'ri — tartib xato)", 'go always', True),
                ],
            },
        ],
    },
]


# ============================================================
# Lesson → Grammar Topic mapping
# ============================================================

LESSON_GRAMMAR_MAP = {
    # Salomlashish
    'Saying Hello': ['Present Simple', 'Personal Pronouns'],
    'Hello and Hi': ['Personal Pronouns'],
    'Asking names': ['Question Words', 'Personal Pronouns'],
    'Where are you from?': ['Question Words', 'Personal Pronouns'],
    'My name is...': ['Personal Pronouns', 'Possessive Pronouns'],

    # Asoslar
    'To be': ['Present Simple', 'Personal Pronouns'],
    'To have': ['Have got'],
    'Action verbs': ['Present Simple'],
    'The English alphabet': ['Articles (a / an / the)'],
    'Numbers 1-100': ['Plural Nouns'],

    # Oila va kun
    'Family members': ['Possessive Pronouns', 'Have got'],
    'Time and schedule': ['Present Simple', 'Adverbs of Frequency'],
    'Morning routine': ['Adverbs of Frequency', 'Present Simple'],
    'Weekend activities': ['Adverbs of Frequency'],
    'Daily Routines': ['Adverbs of Frequency'],

    # Ranglar va narsalar
    'Colors and shapes': ['Demonstratives: this, that, these, those'],

    # Past zamon
    'Regular verbs in past': ['Past Simple'],
    'Irregular verbs': ['Past Simple'],
    'Last weekend story': ['Past Simple'],

    # Kelajak
    'Going to': ['First Conditional'],
    'Will vs going to': ['First Conditional'],

    # Taqqoslash
    'Comparative adjectives': ['Comparatives and Superlatives'],
    'Superlatives': ['Comparatives and Superlatives'],

    # Modallar
    'Should and must': ['Modal Verbs: can / could'],
    'May and might': ['Modal Verbs: can / could'],

    # Passiv
    'Passive in present': ['Passive Voice'],
    'Passive in past': ['Passive Voice'],

    # Sayohat
    'Check-in dialogue': ['Question Words'],
    'Airport signs': ['Prepositions of Place'],
    'Booking a room': ['There is / There are', 'Question Words'],
    'Hotel facilities': ['There is / There are', 'Prepositions of Place'],
}


class Command(BaseCommand):
    help = "17 ta Grammar Topic + qoidalar + misollar seed (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: grammar topiclar o'chiriladi..."))
            LessonGrammar.objects.all().delete()
            GrammarExample.objects.all().delete()
            GrammarRule.objects.all().delete()
            GrammarTopic.objects.all().delete()

        self.stdout.write("📖 Grammar seed boshlandi...\n")

        for order, topic_data in enumerate(GRAMMAR_TOPICS, start=1):
            rules_data = topic_data.pop('rules')

            topic, t_created = GrammarTopic.objects.get_or_create(
                title=topic_data['title'],
                defaults={
                    'category': topic_data['category'],
                    'cefr_level': topic_data['cefr_level'],
                    'icon': topic_data.get('icon', ''),
                    'short_description': topic_data.get('short_description', ''),
                    'description': topic_data.get('description', ''),
                    'order': order,
                    'is_published': True,
                },
            )
            marker = '+ yangi' if t_created else '✓ mavjud'
            self.stdout.write(f"  [{marker}] {topic.title}")

            for r_order, rule_data in enumerate(rules_data, start=1):
                examples_data = rule_data.pop('examples', [])

                rule, r_created = GrammarRule.objects.get_or_create(
                    topic=topic,
                    title=rule_data['title'],
                    defaults={
                        'formula': rule_data.get('formula', ''),
                        'explanation': rule_data.get('explanation', ''),
                        'explanation_uz': rule_data.get('explanation_uz', ''),
                        'tips': rule_data.get('tips', ''),
                        'common_mistakes': rule_data.get('common_mistakes', ''),
                        'order': r_order,
                        'is_published': True,
                    },
                )

                for e_order, ex_tuple in enumerate(examples_data, start=1):
                    sentence, translation, highlight, is_incorrect = ex_tuple
                    GrammarExample.objects.get_or_create(
                        rule=rule,
                        sentence=sentence,
                        defaults={
                            'translation': translation,
                            'highlight': highlight,
                            'is_incorrect': is_incorrect,
                            'order': e_order,
                        },
                    )

        # Lessonlarga biriktirish
        self._attach_to_lessons()

        # Hisobot
        self.stdout.write(self.style.SUCCESS(
            f"\n✓ {GrammarTopic.objects.count()} ta topic, "
            f"{GrammarRule.objects.count()} ta rule, "
            f"{GrammarExample.objects.count()} ta misol."
        ))

    def _attach_to_lessons(self):
        self.stdout.write("\n🔗 Grammar mavzularini darslariga biriktirish...")
        attached_count = 0

        for lesson_title, topic_titles in LESSON_GRAMMAR_MAP.items():
            lessons = Lesson.objects.filter(title__icontains=lesson_title)
            for lesson in lessons:
                for order, topic_title in enumerate(topic_titles, start=1):
                    topic = GrammarTopic.objects.filter(title=topic_title).first()
                    if not topic:
                        continue
                    _, created = LessonGrammar.objects.get_or_create(
                        lesson=lesson,
                        topic=topic,
                        defaults={
                            'order': order,
                            'is_main_topic': order == 1,
                        },
                    )
                    if created:
                        attached_count += 1

        self.stdout.write(f"   {attached_count} ta yangi biriktirish.")