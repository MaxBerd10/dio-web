from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with role-based access.
    Email login ham qo'llab-quvvatlanadi.
    """

    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        TEACHER = 'teacher', 'Teacher'
        ADMIN = 'admin', 'Admin'

    class CEFRLevel(models.TextChoices):
        A1 = 'A1', 'A1 — Beginner'
        A2 = 'A2', 'A2 — Elementary'
        B1 = 'B1', 'B1 — Intermediate'
        B2 = 'B2', 'B2 — Upper-Intermediate'
        C1 = 'C1', 'C1 — Advanced'
        C2 = 'C2', 'C2 — Proficient'

    class LearningGoal(models.TextChoices):
        GENERAL = 'general', 'General English'
        CEFR = 'cefr', 'CEFR Levels (A1–C2)'
        IELTS = 'ielts', 'IELTS Preparation'

    # Email majburiy va unique
    email = models.EmailField(unique=True)

    # Role
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    # Profil ma'lumotlari
    full_name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    # O'rganish konteksti (student uchun)
    cefr_level = models.CharField(
        max_length=2,
        choices=CEFRLevel.choices,
        blank=True,
        help_text='Joriy CEFR darajasi (placement test yoki o\'zi tanlaydi)',
    )
    learning_goal = models.CharField(
        max_length=20,
        choices=LearningGoal.choices,
        default=LearningGoal.GENERAL,
    )
    target_ielts_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        blank=True,
        null=True,
        help_text='Maqsadli IELTS bali (masalan: 7.0)',
    )

    # Status
    is_verified = models.BooleanField(default=False, help_text='Email tasdiqlangan')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Login uchun email ishlatamiz, username — display name
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f'{self.email} ({self.get_role_display()})'

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER