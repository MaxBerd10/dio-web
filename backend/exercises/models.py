from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# ============================================================
# 1. QUIZ — avtomatik tekshiriladigan testlar
# ============================================================

class Quiz(models.Model):
    """
    Quiz — Lesson bilan bog'langan testlar to'plami.
    Bir Lesson da bitta yoki bir nechta Quiz bo'lishi mumkin
    (masalan: vocabulary quiz, grammar quiz, mixed quiz).
    """
    lesson = models.ForeignKey(
        'content.Lesson',
        on_delete=models.CASCADE,
        related_name='quizzes',
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Sozlamalar
    passing_score = models.PositiveIntegerField(
        default=70,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="O'tish uchun minimum foiz",
    )
    time_limit_seconds = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Vaqt cheklovi (sekundlarda). Bo'sh — cheklovsiz.",
    )
    max_attempts = models.PositiveIntegerField(
        default=0,
        help_text="0 = cheksiz. 3 = 3 marta urinish mumkin.",
    )
    shuffle_questions = models.BooleanField(default=True)
    show_correct_answers = models.BooleanField(
        default=True,
        help_text="Tugagandan keyin to'g'ri javoblarni ko'rsatish",
    )

    # XP va order
    xp_reward = models.PositiveIntegerField(default=20)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lesson', 'order']

    def __str__(self):
        return f'{self.lesson.title} → {self.title}'

    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    explanation = models.TextField(
        blank=True,
        help_text='To\'g\'ri javob nima uchun shu — tushuntirish',
    )
    hint = models.CharField(
        max_length=300, blank=True,
        help_text="Savol qiyin bo'lsa ko'rsatiladigan yordam (ixtiyoriy)",
    )

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', "Bitta to'g'ri javob"
        MULTIPLE_SELECT = 'multiple_select', "Bir nechta to'g'ri javob"
        TRUE_FALSE = 'true_false', 'True / False'
        FILL_BLANK = 'fill_blank', "Bo'sh joyni to'ldirish"
        MATCHING = 'matching', 'Juftlash'
        SHORT_ANSWER = 'short_answer', 'Qisqa yozma javob'

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions',
    )
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.MULTIPLE_CHOICE,
    )

    # Savol matni — fill_blank uchun ___ belgisini ishlatish mumkin
    text = models.TextField(
        help_text='Savol matni. Fill blank uchun ___ ishlat',
    )
    image = models.ImageField(upload_to='questions/', blank=True, null=True)
    audio_url = models.URLField(blank=True)

    # Fill blank yoki short answer uchun to'g'ri javob
    correct_answer_text = models.CharField(
        max_length=500, blank=True,
        help_text="Fill blank / Short answer / True-False uchun to'g'ri javob",
    )
    case_sensitive = models.BooleanField(
        default=False,
        help_text="Katta-kichik harf farqlansinmi? (asosan bo'lmaydi)",
    )

    # Tushuntirish (javob ko'rsatilganda chiqadi)
    explanation = models.TextField(
        blank=True,
        help_text='To\'g\'ri javob nima uchun shu — tushuntirish',
    )

    # Tartib va og'irlik
    points = models.PositiveIntegerField(default=1, help_text='Ball')
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['quiz', 'order']

    def __str__(self):
        return f'{self.quiz.title} — Q{self.order}: {self.text[:50]}'


class Choice(models.Model):
    """
    Multiple choice / multiple select / matching uchun variantlar.
    Matching savollar uchun `match_pair` ishlatiladi.
    """
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='choices',
    )
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    # Matching uchun: chap tomon variantlari uchun match_pair bo'sh,
    # o'ng tomon variantlari uchun match_pair = juftining ID si
    match_pair = models.CharField(
        max_length=100, blank=True,
        help_text="Matching savol uchun: juftining belgisi (A, B, 1, 2)",
    )

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question', 'order']

    def __str__(self):
        marker = "✓" if self.is_correct else " "
        return f'[{marker}] {self.text[:60]}'


# ============================================================
# 2. ASSIGNMENT — qo'lda baholanadigan vazifalar
# ============================================================

class Assignment(models.Model):
    """
    Yozma vazifa — teacher tekshiradi.
    Misol: IELTS Writing Task 1/2 essay, speaking recording.
    """

    class AssignmentType(models.TextChoices):
        ESSAY = 'essay', 'Essay (yozma matn)'
        SHORT_WRITING = 'short_writing', 'Qisqa yozma javob'
        SPEAKING = 'speaking', 'Speaking (audio)'
        TRANSLATION = 'translation', 'Tarjima'
        OTHER = 'other', 'Boshqa'

    lesson = models.ForeignKey(
        'content.Lesson',
        on_delete=models.CASCADE,
        related_name='assignments',
    )
    title = models.CharField(max_length=200)
    assignment_type = models.CharField(
        max_length=20,
        choices=AssignmentType.choices,
        default=AssignmentType.ESSAY,
    )

    # Topshiriq
    instructions = models.TextField(
        help_text='Topshiriqning to\'liq matni (Markdown)',
    )

    image = models.ImageField(
        upload_to='assignments/',
        blank=True, null=True,
        help_text="IELTS Writing Task 1 uchun chart/grafik/diagramma rasmi",
    )


    rubric = models.TextField(
        blank=True,
        help_text='Baholash mezonlari (IELTS uchun band descriptors)',
    )

    # Yozma vazifa uchun
    min_words = models.PositiveIntegerField(null=True, blank=True)
    max_words = models.PositiveIntegerField(null=True, blank=True)

    # Vaqt
    time_limit_minutes = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Vaqt cheklovi (minut)',
    )

    # XP
    xp_reward = models.PositiveIntegerField(default=50)

    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lesson', 'order']

    def __str__(self):
        return f'{self.lesson.title} → {self.title}'


class AssignmentSubmission(models.Model):
    """
    O'quvchining vazifani topshirgani.
    Teacher buni tekshiradi va baho beradi.
    """

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Qoralama'
        SUBMITTED = 'submitted', 'Topshirildi'
        IN_REVIEW = 'in_review', 'Tekshirilmoqda'
        GRADED = 'graded', 'Baholandi'
        RETURNED = 'returned', 'Qaytarildi (qayta yozish)'

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name='submissions',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assignment_submissions',
        limit_choices_to={'role': 'student'},
    )

    # Topshirgan kontent
    content = models.TextField(
        blank=True,
        help_text='Yozma javob (essay matni)',
    )
    audio_file = models.FileField(
        upload_to='submissions/audio/', blank=True, null=True,
    )
    attachment = models.FileField(
        upload_to='submissions/files/', blank=True, null=True,
    )
    word_count = models.PositiveIntegerField(default=0)

    # Holat
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    submitted_at = models.DateTimeField(null=True, blank=True)

    # === Teacher baho qismi ===
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_submissions',
        limit_choices_to={'role': 'teacher'},
    )

    # Umumiy ball (0-100 yoki IELTS band: 0-9)
    score = models.DecimalField(
        max_digits=4, decimal_places=1,
        null=True, blank=True,
        help_text='0-100 yoki IELTS band (0-9)',
    )

    # Teacher umumiy feedback
    feedback = models.TextField(
        blank=True,
        help_text='O\'quvchiga umumiy izoh (Markdown)',
    )
    strengths = models.TextField(
        blank=True, help_text='Kuchli tomonlari',
    )
    improvements = models.TextField(
        blank=True, help_text='Yaxshilash kerak bo\'lgan joylar',
    )

    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-submitted_at', '-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['assignment', 'status']),
        ]

    def __str__(self):
        return f'{self.student.username} → {self.assignment.title} [{self.status}]'

    def save(self, *args, **kwargs):
        # Word count avtomatik hisoblanadi
        if self.content:
            self.word_count = len(self.content.split())
        super().save(*args, **kwargs)


class FeedbackComment(models.Model):
    """
    Teacher submission ichida aniq joyga izoh qoldirishi mumkin.
    Misol: 5-paragraf 3-jumlasiga "Tense xatosi" deb belgi qo'yish.
    Bu IELTS Writing'ni baholashda juda muhim.
    """
    submission = models.ForeignKey(
        AssignmentSubmission,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedback_comments',
    )

    # Highlight qilingan joy
    quoted_text = models.TextField(
        blank=True,
        help_text="'Submission'dan tanlangan parcha",
    )
    start_offset = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Matn ichida boshlanish pozitsiyasi',
    )
    end_offset = models.PositiveIntegerField(
        null=True, blank=True,
    )

    # Izoh
    comment = models.TextField(help_text='Teacher izohi')

    class Category(models.TextChoices):
        GRAMMAR = 'grammar', 'Grammar'
        VOCABULARY = 'vocabulary', 'Vocabulary'
        SPELLING = 'spelling', 'Spelling'
        STRUCTURE = 'structure', 'Structure'
        STYLE = 'style', 'Style'
        OTHER = 'other', 'Other'

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['submission', 'start_offset', 'created_at']

    def __str__(self):
        return f'{self.author.username}: {self.comment[:50]}'