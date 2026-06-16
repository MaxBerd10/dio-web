"""
50+ asosiy A1-A2 so'z va ularni vocabulary lessonlarga biriktirish.

Foydalanish:
    python manage.py seed_words
    python manage.py seed_words --reset    # avval so'zlarni o'chiradi
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Lesson
from vocabulary.models import Word, LessonWord


# ============================================================
# 50+ A1-A2 SO'ZLAR
# Format: (word, pos, uz, ru, ipa, example_en, example_uz, cefr, freq_rank)
# ============================================================

WORDS = [
    # Greetings & introductions
    ('hello', 'interjection', 'salom', 'привет', '/həˈloʊ/',
     'Hello, how are you?', 'Salom, qalaysiz?', 'A1', 50),
    ('goodbye', 'interjection', 'xayr', 'до свидания', '/ɡʊdˈbaɪ/',
     'Goodbye, see you tomorrow.', 'Xayr, ertaga ko\'rishamiz.', 'A1', 350),
    ('name', 'noun', 'ism', 'имя', '/neɪm/',
     'My name is John.', 'Mening ismim John.', 'A1', 80),
    ('please', 'adverb', 'iltimos', 'пожалуйста', '/pliːz/',
     'Please sit down.', 'Iltimos, o\'tiring.', 'A1', 200),
    ('thank you', 'phrase', 'rahmat', 'спасибо', '/ˈθæŋk juː/',
     'Thank you very much.', 'Katta rahmat.', 'A1', 100),
    ('yes', 'adverb', 'ha', 'да', '/jɛs/',
     'Yes, I agree.', 'Ha, men roziman.', 'A1', 25),
    ('no', 'adverb', 'yo\'q', 'нет', '/noʊ/',
     'No, I don\'t want it.', 'Yo\'q, men buni xohlamayman.', 'A1', 30),

    # Family
    ('mother', 'noun', 'ona', 'мать', '/ˈmʌðər/',
     'My mother is a teacher.', 'Mening onam o\'qituvchi.', 'A1', 150),
    ('father', 'noun', 'ota', 'отец', '/ˈfɑːðər/',
     'His father works in a bank.', 'Uning otasi bankda ishlaydi.', 'A1', 180),
    ('brother', 'noun', 'aka/uka', 'брат', '/ˈbrʌðər/',
     'I have one brother.', 'Mening bitta akam bor.', 'A1', 220),
    ('sister', 'noun', 'opa/singil', 'сестра', '/ˈsɪstər/',
     'My sister lives in London.', 'Mening opam Londonda yashaydi.', 'A1', 230),
    ('family', 'noun', 'oila', 'семья', '/ˈfæməli/',
     'We are a big family.', 'Biz katta oilamiz.', 'A1', 95),

    # Numbers / time
    ('one', 'noun', 'bir', 'один', '/wʌn/',
     'I have one cat.', 'Mening bitta mushugim bor.', 'A1', 40),
    ('two', 'noun', 'ikki', 'два', '/tuː/',
     'Two coffees, please.', 'Ikkita qahva, iltimos.', 'A1', 60),
    ('time', 'noun', 'vaqt', 'время', '/taɪm/',
     'What time is it?', 'Soat necha?', 'A1', 70),
    ('day', 'noun', 'kun', 'день', '/deɪ/',
     'Have a nice day!', 'Yaxshi kun bo\'lsin!', 'A1', 110),
    ('week', 'noun', 'hafta', 'неделя', '/wiːk/',
     'See you next week.', 'Keyingi haftagacha.', 'A1', 290),
    ('month', 'noun', 'oy', 'месяц', '/mʌnθ/',
     'This month is busy.', 'Bu oy band.', 'A1', 270),
    ('year', 'noun', 'yil', 'год', '/jɪər/',
     'Happy New Year!', 'Yangi yil muborak!', 'A1', 120),

    # Basic verbs
    ('be', 'verb', 'bo\'lmoq', 'быть', '/biː/',
     'I am a student.', 'Men talabaman.', 'A1', 10),
    ('have', 'verb', 'ega bo\'lmoq', 'иметь', '/hæv/',
     'I have a dog.', 'Mening itim bor.', 'A1', 35),
    ('go', 'verb', 'bormoq', 'идти', '/ɡoʊ/',
     'I go to school.', 'Men maktabga boraman.', 'A1', 45),
    ('come', 'verb', 'kelmoq', 'приходить', '/kʌm/',
     'Come here, please.', 'Bu yerga keling, iltimos.', 'A1', 85),
    ('eat', 'verb', 'yemoq', 'есть', '/iːt/',
     'I eat breakfast at 8.', 'Men 8 da nonushta qilaman.', 'A1', 320),
    ('drink', 'verb', 'ichmoq', 'пить', '/drɪŋk/',
     'I drink tea every morning.', 'Men har kuni ertalab choy ichaman.', 'A1', 410),
    ('want', 'verb', 'xohlamoq', 'хотеть', '/wɒnt/',
     'I want some water.', 'Men suv xohlayman.', 'A1', 130),
    ('like', 'verb', 'yoqmoq', 'нравиться', '/laɪk/',
     'I like coffee.', 'Menga qahva yoqadi.', 'A1', 90),
    ('work', 'verb', 'ishlamoq', 'работать', '/wɜːrk/',
     'I work in Tashkent.', 'Men Toshkentda ishlayman.', 'A1', 140),
    ('study', 'verb', 'o\'qimoq', 'учиться', '/ˈstʌdi/',
     'She studies English.', 'U ingliz tilini o\'qiydi.', 'A1', 380),

    # Food
    ('water', 'noun', 'suv', 'вода', '/ˈwɔːtər/',
     'A glass of water, please.', 'Bir stakan suv, iltimos.', 'A1', 250),
    ('bread', 'noun', 'non', 'хлеб', '/brɛd/',
     'Bread is on the table.', 'Non stol ustida.', 'A1', 540),
    ('coffee', 'noun', 'qahva', 'кофе', '/ˈkɒfi/',
     'I drink coffee in the morning.', 'Men ertalab qahva ichaman.', 'A1', 360),
    ('tea', 'noun', 'choy', 'чай', '/tiː/',
     'Would you like tea?', 'Choy xohlaysizmi?', 'A1', 450),
    ('food', 'noun', 'ovqat', 'еда', '/fuːd/',
     'The food is delicious.', 'Ovqat juda mazali.', 'A1', 195),

    # Places
    ('home', 'noun', 'uy', 'дом', '/hoʊm/',
     'I am at home.', 'Men uydaman.', 'A1', 75),
    ('school', 'noun', 'maktab', 'школа', '/skuːl/',
     'My school is big.', 'Mening maktabim katta.', 'A1', 105),
    ('city', 'noun', 'shahar', 'город', '/ˈsɪti/',
     'Tashkent is a big city.', 'Toshkent katta shahar.', 'A1', 145),
    ('country', 'noun', 'mamlakat', 'страна', '/ˈkʌntri/',
     'Uzbekistan is my country.', 'O\'zbekiston mening mamlakatim.', 'A1', 175),

    # Adjectives
    ('good', 'adjective', 'yaxshi', 'хороший', '/ɡʊd/',
     'This is a good idea.', 'Bu yaxshi fikr.', 'A1', 55),
    ('bad', 'adjective', 'yomon', 'плохой', '/bæd/',
     'It is a bad day.', 'Yomon kun.', 'A1', 280),
    ('big', 'adjective', 'katta', 'большой', '/bɪɡ/',
     'This is a big house.', 'Bu katta uy.', 'A1', 115),
    ('small', 'adjective', 'kichik', 'маленький', '/smɔːl/',
     'I have a small dog.', 'Mening kichik itim bor.', 'A1', 165),
    ('new', 'adjective', 'yangi', 'новый', '/njuː/',
     'I bought a new phone.', 'Men yangi telefon sotib oldim.', 'A1', 65),
    ('old', 'adjective', 'eski/qari', 'старый', '/oʊld/',
     'This is an old book.', 'Bu eski kitob.', 'A1', 155),
    ('happy', 'adjective', 'baxtli', 'счастливый', '/ˈhæpi/',
     'I am happy today.', 'Men bugun baxtliman.', 'A2', 470),
    ('sad', 'adjective', 'g\'amgin', 'грустный', '/sæd/',
     'She looks sad.', 'U g\'amgin ko\'rinadi.', 'A2', 720),

    # Colors
    ('white', 'adjective', 'oq', 'белый', '/waɪt/',
     'The wall is white.', 'Devor oq.', 'A1', 240),
    ('black', 'adjective', 'qora', 'чёрный', '/blæk/',
     'My cat is black.', 'Mening mushugim qora.', 'A1', 190),
    ('red', 'adjective', 'qizil', 'красный', '/rɛd/',
     'I have a red car.', 'Mening qizil mashinam bor.', 'A1', 310),

    # Daily phrases
    ('today', 'adverb', 'bugun', 'сегодня', '/təˈdeɪ/',
     'It is hot today.', 'Bugun issiq.', 'A1', 88),
    ('tomorrow', 'adverb', 'ertaga', 'завтра', '/təˈmɒroʊ/',
     'See you tomorrow.', 'Ertaga ko\'rishamiz.', 'A1', 215),
    ('yesterday', 'adverb', 'kecha', 'вчера', '/ˈjɛstərdeɪ/',
     'Yesterday was Sunday.', 'Kecha yakshanba edi.', 'A1', 285),
]


class Command(BaseCommand):
    help = "50+ A1-A2 so'zlarni yaratish va vocabulary darslariga biriktirish."

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help="Avval barcha so'zlarni o'chiradi",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: barcha so'zlar o'chiriladi..."))
            LessonWord.objects.all().delete()
            Word.objects.all().delete()

        self.stdout.write(f"📚 {len(WORDS)} ta so'z qo'shilmoqda...\n")

        created_words = []
        for w_data in WORDS:
            (word, pos, uz, ru, ipa, ex_en, ex_uz, cefr, freq) = w_data

            obj, created = Word.objects.get_or_create(
                word=word,
                part_of_speech=pos,
                translation_uz=uz,
                defaults={
                    'translation_ru': ru,
                    'pronunciation': ipa,
                    'example_sentence': ex_en,
                    'example_translation': ex_uz,
                    'cefr_level': cefr,
                    'frequency_rank': freq,
                    'is_published': True,
                },
            )
            if created:
                created_words.append(obj)
                self.stdout.write(f"  + {word} ({uz})")

        # Vocabulary darslariga avtomatik biriktirish
        self._attach_words_to_lessons()

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ {len(created_words)} ta yangi so'z qo'shildi. "
            f"Jami: {Word.objects.count()} ta so'z."
        ))

    def _attach_words_to_lessons(self):
        """
        Vocabulary lessonlariga aloqador so'zlarni biriktiramiz.
        Strategiya: lesson title yoki module title'da so'zga bog'liq keyword bo'lsa.
        """
        self.stdout.write("\n🔗 So'zlarni lessonlarga biriktirish...")

        # Mapping: lesson title (or partial) → words to attach
        LESSON_WORD_MAP = {
            'Hello and Hi': ['hello', 'goodbye', 'name'],
            'Saying Hello': ['hello', 'goodbye', 'thank you', 'please', 'yes', 'no'],
            'Asking names': ['name', 'hello'],
            'Family members': ['mother', 'father', 'brother', 'sister', 'family'],
            'My name is...': ['name', 'hello'],
            'Numbers 1-100': ['one', 'two'],
            'Time and schedule': ['time', 'day', 'week', 'month', 'year'],
            'Morning routine': ['eat', 'drink', 'go', 'work', 'study'],
            'Food vocabulary': ['water', 'bread', 'coffee', 'tea', 'food'],
            'Ordering at a cafe': ['water', 'coffee', 'tea', 'please', 'thank you'],
            'At the supermarket': ['bread', 'water', 'food'],
            'Colors and shapes': ['white', 'black', 'red'],
            'Action verbs': ['go', 'come', 'eat', 'drink', 'want', 'like', 'work', 'study'],
            'To be': ['be'],
            'To have': ['have'],
            'The English alphabet': ['name', 'hello'],
        }

        attached_count = 0
        for lesson_title, word_list in LESSON_WORD_MAP.items():
            lessons = Lesson.objects.filter(title__icontains=lesson_title)
            for lesson in lessons:
                for order, word_text in enumerate(word_list, start=1):
                    word = Word.objects.filter(word=word_text).first()
                    if not word:
                        continue
                    _, created = LessonWord.objects.get_or_create(
                        lesson=lesson,
                        word=word,
                        defaults={
                            'order': order,
                            'is_key_word': order <= 3,  # birinchi 3 ta — key word
                        },
                    )
                    if created:
                        attached_count += 1

        self.stdout.write(f"   {attached_count} ta yangi biriktirish.")