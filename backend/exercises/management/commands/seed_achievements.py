"""
10 ta tayyor achievement badge yaratadi.
Bu badge'lar admin'da kategoriyalar va target qiymatlari bilan saqlanadi.
Kelajakda har user uchun avtomatik checking signals orqali bo'ladi.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from progress.models import Achievement


ACHIEVEMENTS = [
    # Streak
    {'code': 'streak_3', 'category': 'streak', 'title': "3 kunlik alanga",
     'description': '3 kun ketma-ket o\'rganish', 'target': 3, 'xp': 30, 'icon': '🔥'},
    {'code': 'streak_7', 'category': 'streak', 'title': "Bir hafta!",
     'description': '7 kun ketma-ket o\'rganish', 'target': 7, 'xp': 70, 'icon': '🔥'},
    {'code': 'streak_30', 'category': 'streak', 'title': "Oy bo'yi sodiq",
     'description': '30 kun ketma-ket o\'rganish', 'target': 30, 'xp': 300, 'icon': '🏅'},

    # Vocabulary
    {'code': 'words_50', 'category': 'vocabulary', 'title': "50 ta so'z",
     'description': '50 ta so\'zni o\'rganib chiqdingiz', 'target': 50, 'xp': 50, 'icon': '📖'},
    {'code': 'words_100', 'category': 'vocabulary', 'title': "Centurion",
     'description': '100 ta so\'zni o\'zlashtirgansiz', 'target': 100, 'xp': 100, 'icon': '📚'},
    {'code': 'words_500', 'category': 'vocabulary', 'title': "Lug'at ustasi",
     'description': '500 ta so\'zni o\'zlashtirgansiz', 'target': 500, 'xp': 500, 'icon': '🎓'},

    # Lessons
    {'code': 'lessons_5', 'category': 'lesson', 'title': "Ilk qadamlar",
     'description': '5 ta darsni tugatdingiz', 'target': 5, 'xp': 40, 'icon': '🌱'},
    {'code': 'lessons_25', 'category': 'lesson', 'title': "Sabrli o'quvchi",
     'description': '25 ta darsni tugatdingiz', 'target': 25, 'xp': 150, 'icon': '🌿'},
    {'code': 'lessons_100', 'category': 'lesson', 'title': "Dasturni hazm qildi",
     'description': '100 ta darsni tugatdingiz', 'target': 100, 'xp': 600, 'icon': '🌳'},

    # Quiz
    {'code': 'quiz_perfect_5', 'category': 'quiz', 'title': "Mukammal ishlovchi",
     'description': '5 ta quizni 100% bilan o\'tdingiz', 'target': 5, 'xp': 100, 'icon': '💯'},

    # XP
    {'code': 'xp_1000', 'category': 'xp', 'title': "1000 XP",
     'description': '1000 XP yig\'dingiz', 'target': 1000, 'xp': 50, 'icon': '⚡'},
    {'code': 'xp_10000', 'category': 'xp', 'title': "Elita o'quvchi",
     'description': '10,000 XP yig\'dingiz', 'target': 10000, 'xp': 500, 'icon': '👑'},
]


class Command(BaseCommand):
    help = "10+ ta tayyor achievement badge yaratadi."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: achievementlar o'chiriladi..."))
            Achievement.objects.all().delete()

        self.stdout.write("🏆 Achievement seed boshlandi...\n")

        for order, a in enumerate(ACHIEVEMENTS, start=1):
            obj, created = Achievement.objects.get_or_create(
                code=a['code'],
                defaults={
                    'title': a['title'],
                    'description': a['description'],
                    'category': a['category'],
                    'icon': a['icon'],
                    'target_value': a['target'],
                    'xp_reward': a['xp'],
                    'order': order,
                    'is_active': True,
                },
            )
            marker = '+ yangi' if created else '✓ mavjud'
            self.stdout.write(f"  [{marker}] {a['icon']} {a['title']}")

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Jami: {Achievement.objects.count()} ta achievement."
        ))