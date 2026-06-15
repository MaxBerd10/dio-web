from django.db import models
from django.utils.text import slugify
from content.models import CEFRLevel


class GrammarTopic(models.Model):
    """
    Katta grammar mavzu (Tenses, Conditionals, Articles, va h.k.).
    Bir mavzu ichida bir nechta GrammarRule bo'ladi.
    """

    class Category(models.TextChoices):
        TENSES = 'tenses', 'Tenses (Zamonlar)'
        ARTICLES = 'articles', 'Articles (a/an/the)'
        PRONOUNS = 'pronouns', 'Pronouns (Olmoshlar)'
        PREPOSITIONS = 'prepositions', 'Prepositions'
        CONDITIONALS = 'conditionals', 'Conditionals (Shart gaplari)'
        MODALS = 'modals', 'Modal Verbs'
        PASSIVE = 'passive', 'Passive Voice'
        REPORTED = 'reported', 'Reported Speech'
        CLAUSES = 'clauses', 'Relative Clauses'
        WORD_ORDER = 'word_order', 'Word Order'
        QUESTIONS = 'questions', 'Questions & Negatives'
        COMPARATIVES = 'comparatives', 'Comparatives & Superlatives'
        QUANTIFIERS = 'quantifiers', 'Quantifiers (some/any/much/many)'
        PHRASAL_VERBS = 'phrasal_verbs', 'Phrasal Verbs'
        OTHER = 'other', 'Boshqa'

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
    )
    cefr_level = models.CharField(
        max_length=2,
        choices=CEFRLevel.choices,
        blank=True,
        db_index=True,
    )
    short_description = models.CharField(
        max_length=300, blank=True,
        help_text="Qisqacha tushuntirish (1 jumla)",
    )
    description = models.TextField(
        blank=True, help_text="To'liq tushuntirish (Markdown)",
    )
    icon = models.CharField(max_length=10, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'order', 'title']
        indexes = [
            models.Index(fields=['category', 'cefr_level']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class GrammarRule(models.Model):
    """
    Mavzu ichidagi yagona qoida.
    Misol: "Present Simple" topic ichida 3 ta rule bo'lishi mumkin:
      1. Affirmative form (I work)
      2. Negative form (I don't work)
      3. Question form (Do I work?)
    """
    topic = models.ForeignKey(
        GrammarTopic,
        on_delete=models.CASCADE,
        related_name='rules',
    )
    title = models.CharField(max_length=200)
    formula = models.CharField(
        max_length=500, blank=True,
        help_text="Qoidaning sxemasi, masalan: Subject + V1 + Object",
    )
    explanation = models.TextField(help_text="Qoidani tushuntirish (Markdown)")
    explanation_uz = models.TextField(
        blank=True, help_text="O'zbekcha tushuntirish (ixtiyoriy)",
    )

    # Maslahatlar va xato ogohlantirishlari
    tips = models.TextField(
        blank=True, help_text="Foydali maslahatlar va eslatmalar",
    )
    common_mistakes = models.TextField(
        blank=True, help_text="Tez-tez uchraydigan xatolar",
    )

    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['topic', 'order']
        indexes = [
            models.Index(fields=['topic', 'order']),
        ]

    def __str__(self):
        return f"{self.topic.title} → {self.title}"


class GrammarExample(models.Model):
    """
    Qoida uchun misol gap.
    Har bir rule ko'p misol bilan kuchayadi.
    """
    rule = models.ForeignKey(
        GrammarRule,
        on_delete=models.CASCADE,
        related_name='examples',
    )

    sentence = models.TextField(help_text="Inglizcha misol gap")
    translation = models.TextField(
        blank=True, help_text="O'zbekcha tarjima",
    )

    # Ta'kidlash uchun (frontend'da bold/rangli qilamiz)
    highlight = models.CharField(
        max_length=200, blank=True,
        help_text="Gap ichidagi muhim qism (frontend bunda bold qiladi)",
    )

    is_incorrect = models.BooleanField(
        default=False,
        help_text="Bu — XATO misol (qanday qilmaslik kerakligini ko'rsatish uchun)",
    )

    audio_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['rule', 'order']

    def __str__(self):
        marker = "❌ " if self.is_incorrect else "✓ "
        return f"{marker}{self.sentence[:60]}"


class LessonGrammar(models.Model):
    """
    Lesson ↔ GrammarTopic bog'lovchi (through model).
    Bitta lessonda bitta yoki bir nechta grammar topic bo'lishi mumkin.
    """
    lesson = models.ForeignKey(
        'content.Lesson',
        on_delete=models.CASCADE,
        related_name='lesson_grammar',
    )
    topic = models.ForeignKey(
        GrammarTopic,
        on_delete=models.CASCADE,
        related_name='lesson_appearances',
    )
    order = models.PositiveIntegerField(default=0)
    is_main_topic = models.BooleanField(
        default=False,
        help_text="Shu darsning asosiy grammar mavzusi",
    )

    class Meta:
        ordering = ['lesson', 'order']
        unique_together = [('lesson', 'topic')]

    def __str__(self):
        return f"{self.lesson.title} ← {self.topic.title}"