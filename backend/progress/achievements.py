"""Achievement tekshirish va avtomatik berish."""

from __future__ import annotations

from decimal import Decimal

from django.db import transaction

from .models import (
    Achievement,
    LessonProgress,
    QuizAttempt,
    Streak,
    UserAchievement,
    UserXP,
    WordProgress,
)


def _metric_value(student, achievement: Achievement) -> int:
    category = achievement.category

    if category == Achievement.Category.STREAK:
        streak = Streak.objects.filter(student=student).first()
        return streak.current_streak if streak else 0

    if category == Achievement.Category.VOCABULARY:
        return WordProgress.objects.filter(student=student).exclude(
            status=WordProgress.Status.NEW,
        ).count()

    if category == Achievement.Category.LESSON:
        return LessonProgress.objects.filter(
            student=student,
            status=LessonProgress.Status.COMPLETED,
        ).count()

    if category == Achievement.Category.QUIZ:
        return QuizAttempt.objects.filter(
            student=student,
            status=QuizAttempt.Status.COMPLETED,
            percentage__gte=Decimal('100'),
        ).count()

    if category == Achievement.Category.XP:
        xp = UserXP.objects.filter(student=student).first()
        return xp.total_xp if xp else 0

    return 0


@transaction.atomic
def check_and_award_achievements(student) -> list[Achievement]:
    """
    Faol achievementlarni tekshiradi va shart bajarilganlarini beradi.
    XP mukofoti berilganda qo'shimcha XP achievementlar ham tekshiriladi.
    """
    awarded: list[Achievement] = []
    max_passes = 4

    for _ in range(max_passes):
        earned_ids = set(
            UserAchievement.objects.filter(student=student).values_list(
                'achievement_id', flat=True,
            ),
        )
        new_in_pass: list[Achievement] = []

        for achievement in Achievement.objects.filter(is_active=True).order_by('order'):
            if achievement.id in earned_ids:
                continue
            if _metric_value(student, achievement) >= achievement.target_value:
                UserAchievement.objects.create(
                    student=student,
                    achievement=achievement,
                )
                new_in_pass.append(achievement)

                if achievement.xp_reward:
                    xp_profile, _ = UserXP.objects.get_or_create(student=student)
                    xp_profile.add_xp(achievement.xp_reward)

        if not new_in_pass:
            break
        awarded.extend(new_in_pass)

    return awarded
