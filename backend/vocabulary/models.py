from django.db import models
from content.models import CEFRLevel


class Word(models.Model):
    """
    Lug'at boyligining asosiy birligi.
    Bir so'z bir nechta darslarga biriktirilishi mumkin (M2M orqali).
    Dio bot bilan bir xil DB ishlatilsa, bu jadval kelajakda bot bilan
    sinxronlanadi yoki shu yerda asosiy joy bo'ladi.
    """

    class PartOfSpeech(models.TextChoices):
        NOUN = 'noun', 'Noun (ot)'
        VERB = 'verb', 'Verb (fe\'l)'
        ADJECTIVE = 'adjective', 'Adjective (sifat)'
        ADVERB = 'adverb', 'Adverb (ravish)'
        PRONOUN = 'pronoun', 'Pronoun (olmosh)'
        PREPOSITION = 'preposition', 'Preposition (predlog)'
        CONJUNCTION = 'conjunction', 'Conjunction (bog\'lovchi)'
        INTERJECTION = 'interjection', 'Interjection (undov)'
        PHRASE = 'phrase', 'Phrase (ibora)'
        IDIOM = 'idiom', 'Idiom'

    # Asosiy
    word = models.CharField(max_length=100, db_index=True, help_text='Inglizcha so\'z')
    translation_uz = models.CharField(max_length=200, help_text='O\'zbekcha tarjima')
    translation_ru = models.CharField(
        max_length=200, blank=True, help_text='Ruscha tarjima (ixtiyoriy)',
    )

    # Linguistic
    part_of_speech = models.CharField(
        max_length=20,
        choices=PartOfSpeech.choices,
        default=PartOfSpeech.NOUN,
    )
    pronunciation = models.CharField(
        max_length=200, blank=True,
        help_text='IPA transkripsiya, masalan: /həˈloʊ/',
    )
    audio_url = models.URLField(blank=True, help_text='Talaffuz audio fayli')

    # Misol gaplar
    example_sentence = models.TextField(
        blank=True, help_text='Inglizcha misol gap (so\'z ishlatilgan)',
    )
    example_translation = models.TextField(
        blank=True, help_text='Misol gapning o\'zbekcha tarjimasi',
    )

    # Klassifikatsiya
    cefr_level = models.CharField(
        max_length=2,
        choices=CEFRLevel.choices,
        blank=True,
        db_index=True,
        help_text='Bu so\'z qaysi CEFR darajasiga tegishli',
    )

    # Qo'shimcha
    image = models.ImageField(upload_to='words/', blank=True, null=True)
    notes = models.TextField(blank=True, help_text='Qo\'shimcha izoh (qoidalar, sinonimlar)')

    # Frequency rank — IELTS/akademik uchun foydali
    frequency_rank = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Eng ko\'p uchraydigan 1000 so\'z ichidagi reytingi',
    )

    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['word']
        indexes = [
            models.Index(fields=['cefr_level']),
            models.Index(fields=['part_of_speech']),
            models.Index(fields=['word']),
        ]
        # Bir xil so'z + bir xil ma'no qaytarilmasligi uchun
        constraints = [
            models.UniqueConstraint(
                fields=['word', 'part_of_speech', 'translation_uz'],
                name='unique_word_pos_translation',
            ),
        ]

    def __str__(self):
        return f'{self.word} ({self.get_part_of_speech_display()}) — {self.translation_uz}'


class LessonWord(models.Model):
    """
    Lesson ↔ Word bog'lovchi jadval (through model).
    Bir Lesson da bir nechta Word bo'lishi mumkin, va bir Word bir nechta
    Lesson da uchrashi mumkin. Bu jadval ularning tartibini ham saqlaydi.
    """
    lesson = models.ForeignKey(
        'content.Lesson',
        on_delete=models.CASCADE,
        related_name='lesson_words',
    )
    word = models.ForeignKey(
        Word,
        on_delete=models.CASCADE,
        related_name='lesson_appearances',
    )
    order = models.PositiveIntegerField(default=0)
    is_key_word = models.BooleanField(
        default=False,
        help_text='Bu dars uchun eng muhim so\'zlardan biri',
    )

    class Meta:
        ordering = ['lesson', 'order']
        unique_together = [('lesson', 'word')]
        indexes = [
            models.Index(fields=['lesson', 'order']),
        ]

    def __str__(self):
        return f'{self.lesson.title} ← {self.word.word}'


class WordSet(models.Model):
    """
    Mavzu bo'yicha so'zlar to'plami.
    Misol: "Travel Essentials", "Business Vocabulary", "IELTS Academic Word List"
    Dars bilan bog'liq emas — alohida flashcard amaliyoti uchun.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    cefr_level = models.CharField(
        max_length=2, choices=CEFRLevel.choices, blank=True,
    )
    cover_image = models.ImageField(upload_to='wordsets/', blank=True, null=True)
    icon = models.CharField(max_length=10, blank=True)

    words = models.ManyToManyField(Word, related_name='word_sets', blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title

    @property
    def word_count(self):
        return self.words.count()