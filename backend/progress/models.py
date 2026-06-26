from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone


# ============================================================
# 1. LESSON PROGRESS
# ============================================================

class LessonProgress(models.Model):
    """
    O'quvchining yagona dars bo'yicha holati.
    """

    class Status(models.TextChoices):
        NOT_STARTED = 'not_started', 'Boshlanmagan'
        IN_PROGRESS = 'in_progress', 'O\'rganilmoqda'
        COMPLETED = 'completed', 'Tugatildi'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress',
    )
    lesson = models.ForeignKey(
        'content.Lesson',
        on_delete=models.CASCADE,
        related_name='student_progress',
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_STARTED,
        db_index=True,
    )

    # Vaqt
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    # Foiz hisobi (0-100)
    completion_percentage = models.PositiveIntegerField(default=0)

    # Olingan XP
    xp_earned = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('student', 'lesson')]
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['student', 'completed_at']),
        ]

    def __str__(self):
        return f'{self.student.username} → {self.lesson.title} [{self.status}]'


# ============================================================
# 2. WORD PROGRESS — SM-2 SRS algoritmi
# ============================================================

class WordProgress(models.Model):
    """
    Har bir o'quvchi-so'z juftligi uchun spaced repetition holati.
    SM-2 algoritmi (SuperMemo 2): https://en.wikipedia.org/wiki/SuperMemo
    Anki ham shu asosga qurilgan.

    Asosiy field'lar:
      - ease_factor: 1.3 - 2.5+ (qiyinlikka qarab moslashuvchan)
      - interval_days: keyingi takrorlashgacha qancha kun
      - repetitions: muvaffaqiyatli takrorlashlar soni
      - next_review_at: keyingi takrorlash sanasi
    """

    class Status(models.TextChoices):
        NEW = 'new', 'Yangi'
        LEARNING = 'learning', 'O\'rganilmoqda'
        REVIEW = 'review', 'Takrorlash'
        MASTERED = 'mastered', 'O\'zlashtirilgan'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='word_progress',
    )
    word = models.ForeignKey(
        'vocabulary.Word',
        on_delete=models.CASCADE,
        related_name='student_progress',
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )

    # === SM-2 algoritm holati ===
    ease_factor = models.DecimalField(
        max_digits=4, decimal_places=2,
        default=Decimal('2.50'),
        help_text='SM-2 ease factor (1.3 = juda qiyin, 2.5+ = oson)',
    )
    interval_days = models.PositiveIntegerField(
        default=0,
        help_text='Keyingi takrorlashgacha kunlar soni',
    )
    repetitions = models.PositiveIntegerField(
        default=0,
        help_text='Ketma-ket muvaffaqiyatli takrorlashlar soni',
    )

    # Sanalar
    next_review_at = models.DateTimeField(
        null=True, blank=True, db_index=True,
        help_text='Keyingi takrorlash vaqti',
    )
    last_reviewed_at = models.DateTimeField(null=True, blank=True)

    # Statistika
    total_reviews = models.PositiveIntegerField(default=0)
    correct_reviews = models.PositiveIntegerField(default=0)
    lapses = models.PositiveIntegerField(
        default=0,
        help_text='Mastered bo\'lgandan keyin xato qilganlar soni',
    )

    first_seen_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('student', 'word')]
        ordering = ['next_review_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['student', 'next_review_at']),
        ]

    def __str__(self):
        return f'{self.student.username} ← {self.word.word} [{self.status}]'

    def apply_review(self, quality: int):
        """
        SM-2 algoritmi:
        quality: 0-5 baho:
          0 — umuman eslay olmadi (qaytadan)
          1 — eslay olmadi, lekin javob ko'rinda tanidi
          2 — qiynaldi, lekin eslay oldi
          3 — eslay oldi, biroz qiyinchilik bilan
          4 — eslay oldi, oson
          5 — eslay oldi, juda oson

        quality < 3 — yana 1-kun ichida ko'rsatamiz
        quality >= 3 — interval va ease_factor yangilanadi
        """
        if quality < 0 or quality > 5:
            raise ValueError('quality must be 0-5')

        ef = float(self.ease_factor)
        self.total_reviews += 1
        self.last_reviewed_at = timezone.now()

        if quality < 3:
            # Xato javob — qaytadan o'rganish
            self.repetitions = 0
            self.interval_days = 1
            if self.status == self.Status.MASTERED:
                self.lapses += 1
            self.status = self.Status.LEARNING
        else:
            # To'g'ri javob
            self.correct_reviews += 1
            self.repetitions += 1

            if self.repetitions == 1:
                self.interval_days = 1
            elif self.repetitions == 2:
                self.interval_days = 6
            else:
                self.interval_days = int(round(self.interval_days * ef))

            # Status yangilanishi
            if self.repetitions >= 5 and self.interval_days >= 30:
                self.status = self.Status.MASTERED
            elif self.repetitions >= 2:
                self.status = self.Status.REVIEW
            else:
                self.status = self.Status.LEARNING

        # Ease factor yangilanishi (SM-2 formulasi)
        ef_change = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        new_ef = ef + ef_change
        if new_ef < 1.3:
            new_ef = 1.3
        self.ease_factor = Decimal(str(round(new_ef, 2)))

        # Keyingi takrorlash vaqti
        self.next_review_at = timezone.now() + timedelta(days=self.interval_days)
        self.save()


# ============================================================
# 3. QUIZ ATTEMPT
# ============================================================

class QuizAttempt(models.Model):
    """
    Yagona quiz urinishi.
    Bir o'quvchi bir quiz'ni bir necha marta yechishi mumkin (max_attempts cheklovi).
    """

    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'Davom etmoqda'
        COMPLETED = 'completed', 'Tugatildi'
        ABANDONED = 'abandoned', 'Tashlab ketildi'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts',
    )
    quiz = models.ForeignKey(
        'exercises.Quiz',
        on_delete=models.CASCADE,
        related_name='attempts',
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
        db_index=True,
    )

    # Natijalar
    score = models.PositiveIntegerField(
        default=0, help_text='Olingan ball',
    )
    max_score = models.PositiveIntegerField(
        default=0, help_text='Maksimal mumkin bo\'lgan ball',
    )
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'),
    )
    passed = models.BooleanField(default=False)

    # Vaqt
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    # Olingan XP
    xp_earned = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['student', 'quiz']),
            models.Index(fields=['student', 'completed_at']),
        ]

    def __str__(self):
        return f'{self.student.username} → {self.quiz.title} ({self.percentage}%)'


class QuestionResponse(models.Model):
    """
    QuizAttempt ichidagi bir savolga javob.
    Analytics uchun (qaysi savollar qiyin, qaysi oson) muhim.
    """
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name='responses',
    )
    question = models.ForeignKey(
        'exercises.Question',
        on_delete=models.CASCADE,
        related_name='responses',
    )

    # Javob — turli formatlarda
    selected_choices = models.ManyToManyField(
        'exercises.Choice',
        blank=True,
        help_text='Tanlangan variantlar (multiple choice/select uchun)',
    )
    text_answer = models.TextField(
        blank=True,
        help_text='Fill blank / short answer matni',
    )

    # Natija
    is_correct = models.BooleanField(default=False)
    points_earned = models.PositiveIntegerField(default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('attempt', 'question')]
        ordering = ['attempt', 'answered_at']

    def __str__(self):
        mark = '✓' if self.is_correct else '✗'
        return f'{mark} {self.attempt.student.username} — Q{self.question.order}'


# ============================================================
# 4. STREAK (kunlik o'rganish ketma-ketligi)
# ============================================================

class Streak(models.Model):
    """
    O'quvchining kunlik faollik ketma-ketligi.
    Duolingo'cha — har kun bittada bir narsa qilsa streak oshadi.
    """
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='streak',
    )

    current_streak = models.PositiveIntegerField(
        default=0, help_text='Hozirgi ketma-ket kunlar',
    )
    longest_streak = models.PositiveIntegerField(
        default=0, help_text='Eng uzun streak (rekord)',
    )

    last_activity_date = models.DateField(null=True, blank=True)
    streak_started_date = models.DateField(null=True, blank=True)

    # Streak Freeze (yo'qotmaslik uchun "muzlatish")
    freeze_count = models.PositiveIntegerField(
        default=0, help_text='Mavjud streak freeze\'lar soni',
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['current_streak']),
        ]

    def __str__(self):
        return f'{self.student.username}: {self.current_streak} kun'

    def record_activity(self):
        """
        Foydalanuvchi biror faoliyat qilganda chaqiriladi
        (lesson tugatdi, quiz yechdi, so'z o'rgandi).
        """
        today = timezone.now().date()

        if self.last_activity_date == today:
            # Bugun allaqachon hisoblangan
            return

        if self.last_activity_date is None:
            # Birinchi marta
            self.current_streak = 1
            self.streak_started_date = today
        else:
            days_diff = (today - self.last_activity_date).days
            if days_diff == 1:
                # Ketma-ket — streak oshdi
                self.current_streak += 1
            elif days_diff > 1:
                # Streak buzildi — yangidan
                self.current_streak = 1
                self.streak_started_date = today

        # Rekordni yangila
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak

        self.last_activity_date = today
        self.save()


# ============================================================
# 5. USER XP (umumiy daraja va ball)
# ============================================================

class UserXP(models.Model):
    """
    O'quvchining umumiy XP va levelini saqlaydi.
    Daraja oshishi (level up) — XP threshold orqali.
    """
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='xp_profile',
    )

    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)

    # Haftalik / kunlik XP (leaderboard uchun)
    weekly_xp = models.PositiveIntegerField(default=0)
    daily_xp = models.PositiveIntegerField(default=0)

    last_xp_earned_at = models.DateTimeField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['-total_xp']),
            models.Index(fields=['-weekly_xp']),
        ]

    def __str__(self):
        return f'{self.student.username}: Lv{self.level} ({self.total_xp} XP)'

    @staticmethod
    def xp_for_level(level: int) -> int:
        """
        Quadratic curve: keyingi darajaga o'tish uchun kerakli XP.
        Level 1 → 2: 100 XP
        Level 2 → 3: 250 XP
        Level 3 → 4: 450 XP
        Level n → n+1: 50 * n * (n + 1)
        """
        return 50 * level * (level + 1)

    def add_xp(self, amount: int):
        """XP qo'shadi va kerak bo'lsa darajani oshiradi."""
        self.total_xp += amount
        self.daily_xp += amount
        self.weekly_xp += amount
        self.last_xp_earned_at = timezone.now()

        # Level up tekshiruvi
        next_threshold = self.xp_for_level(self.level)
        cumulative = sum(self.xp_for_level(l) for l in range(1, self.level + 1))

        while self.total_xp >= cumulative:
            self.level += 1
            cumulative += self.xp_for_level(self.level)

        self.save()


# ============================================================
# 6. ACHIEVEMENT (badgelar)
# ============================================================

class Achievement(models.Model):
    """
    Mavjud badge/achievement turlari (admin tomonidan yaratiladi).
    """

    class Category(models.TextChoices):
        STREAK = 'streak', 'Streak'
        VOCABULARY = 'vocabulary', 'Vocabulary'
        QUIZ = 'quiz', 'Quiz'
        LESSON = 'lesson', 'Lesson'
        XP = 'xp', 'XP'
        SPECIAL = 'special', 'Special'

    code = models.SlugField(
        max_length=50, unique=True,
        help_text='Kod (masalan: streak_7_days, words_100)',
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)

    icon = models.CharField(max_length=10, blank=True, help_text='Emoji')
    image = models.ImageField(upload_to='achievements/', blank=True, null=True)

    # Shartlar (target)
    target_value = models.PositiveIntegerField(
        default=1,
        help_text='Maqsadli qiymat (masalan: 7 kun streak, 100 so\'z)',
    )

    xp_reward = models.PositiveIntegerField(default=50)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'order']

    def __str__(self):
        return f'{self.icon} {self.title}'


class UserAchievement(models.Model):
    """
    O'quvchining ochgan achievement'lari.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements',
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name='earned_by',
    )
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('student', 'achievement')]
        ordering = ['-earned_at']

    def __str__(self):
        return f'{self.student.username} ← {self.achievement.title}'




import uuid


class Certificate(models.Model):
    """
    Student bir kursni to'liq tugatganda avtomatik yaratiladigan sertifikat.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    course = models.ForeignKey(
        'content.Course',
        on_delete=models.CASCADE,
        related_name='certificates',
    )
    certificate_number = models.CharField(
        max_length=20, unique=True, default=uuid.uuid4,
        editable=False,
    )
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('student', 'course')]
        ordering = ['-issued_at']

    def __str__(self):
        return f'{self.student.username} — {self.course.title}'

    def save(self, *args, **kwargs):
        if not self.certificate_number or len(str(self.certificate_number)) > 20:
            self.certificate_number = f'DIO-{uuid.uuid4().hex[:10].upper()}'
        super().save(*args, **kwargs)