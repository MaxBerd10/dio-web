from django.db import models
from django.utils.text import slugify


class Track(models.TextChoices):
    """3 ta asosiy o'rganish yo'nalishi."""
    GENERAL = 'general', 'General English'
    CEFR = 'cefr', 'CEFR Levels'
    IELTS = 'ielts', 'IELTS Preparation'


class CEFRLevel(models.TextChoices):
    """CEFR darajalari — bir nechta model'da ishlatiladi."""
    A1 = 'A1', 'A1 — Beginner'
    A2 = 'A2', 'A2 — Elementary'
    B1 = 'B1', 'B1 — Intermediate'
    B2 = 'B2', 'B2 — Upper-Intermediate'
    C1 = 'C1', 'C1 — Advanced'
    C2 = 'C2', 'C2 — Proficient'


class Course(models.Model):
    """
    Track ichidagi katta yo'nalish.
    """
    class IELTSSkill(models.TextChoices):
        LISTENING = 'listening', 'Listening'
        READING = 'reading', 'Reading'
        WRITING = 'writing', 'Writing'
        SPEAKING = 'speaking', 'Speaking'

    track = models.CharField(max_length=20, choices=Track.choices, db_index=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)

    cefr_level = models.CharField(
        max_length=2,
        choices=CEFRLevel.choices,
        blank=True,
        help_text='Faqat CEFR track uchun majburiy',
    )
    ielts_skill = models.CharField(
        max_length=20,
        choices=IELTSSkill.choices,
        blank=True,
        help_text='Faqat IELTS track uchun',
    )

    icon = models.CharField(max_length=10, blank=True, help_text='Emoji yoki kichik belgi')
    color = models.CharField(max_length=20, blank=True, help_text='Hex yoki tailwind class')
    cover_image = models.ImageField(upload_to='covers/courses/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['track', 'order', 'title']
        indexes = [
            models.Index(fields=['track', 'is_published']),
            models.Index(fields=['track', 'cefr_level']),
        ]

    def __str__(self):
        return f'[{self.get_track_display()}] {self.title}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f'{self.track}-{self.title}')
        super().save(*args, **kwargs)


class Module(models.Model):
    """Course ichidagi bo'lim."""
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='modules',
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, blank=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['course', 'order']
        unique_together = [('course', 'slug')]
        indexes = [
            models.Index(fields=['course', 'order']),
        ]

    def __str__(self):
        return f'{self.course.title} → {self.title}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Lesson(models.Model):
    """Yagona dars — bir kunlik mashg'ulot."""

    class LessonType(models.TextChoices):
        VOCABULARY = 'vocabulary', "So'z o'rganish"
        GRAMMAR = 'grammar', 'Grammatika'
        READING = 'reading', "O'qish"
        LISTENING = 'listening', 'Tinglash'
        SPEAKING = 'speaking', "Gapirish"
        WRITING = 'writing', 'Yozish'
        MIXED = 'mixed', 'Aralash'

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='lessons',
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, blank=True)
    lesson_type = models.CharField(
        max_length=20,
        choices=LessonType.choices,
        default=LessonType.MIXED,
    )
    description = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text='Markdown matn')
    video_url = models.URLField(blank=True)
    audio_url = models.URLField(blank=True)

    estimated_minutes = models.PositiveIntegerField(default=15)
    order = models.PositiveIntegerField(default=0)
    xp_reward = models.PositiveIntegerField(default=10)

    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['module', 'order']
        unique_together = [('module', 'slug')]
        indexes = [
            models.Index(fields=['module', 'order']),
            models.Index(fields=['is_published']),
        ]

    def __str__(self):
        return f'{self.module} → {self.title}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def track(self):
        return self.module.course.track

    @property
    def cefr_level(self):
        return self.module.course.cefr_level