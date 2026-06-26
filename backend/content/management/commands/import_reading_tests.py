import json

from django.core.management.base import BaseCommand
from content.models import Module
from exercises.models import Quiz, Question, Choice


class Command(BaseCommand):
    help = "ielts_reading_tests_2to5.json fixture'ini import qiladi (nom bo'yicha moslashtiruvchi)"

    def handle(self, *args, **options):
        path = 'exercises/fixtures/ielts_reading_tests_2to5.json'
        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        module = Module.objects.filter(
            title="To'liq amaliy testlar",
            course__title='IELTS Reading',
        ).first()

        if not module:
            self.stdout.write(self.style.ERROR("Modul topilmadi: 'To'liq amaliy testlar' / 'IELTS Reading'"))
            return

        lessons_created = 0
        quizzes_created = 0

        for item in data:
            lesson = module.lessons.filter(title=item['title']).first()

            if not lesson:
                from content.models import Lesson
                lesson = Lesson.objects.create(
                    module=module,
                    title=item['title'],
                    lesson_type=item['lesson_type'],
                    description=item['description'],
                    content=item['content'],
                    estimated_minutes=item['estimated_minutes'],
                    xp_reward=item['xp_reward'],
                    order=item['order'],
                    is_published=True,
                )
                lessons_created += 1
                self.stdout.write(f"Dars yaratildi: {lesson.title}")
            else:
                self.stdout.write(f"Dars allaqachon bor: {lesson.title}")

            for quiz_data in item['quizzes']:
                if Quiz.objects.filter(lesson=lesson, title=quiz_data['title']).exists():
                    self.stdout.write(f"  O'tkazib yuborildi: {quiz_data['title']}")
                    continue

                quiz = Quiz.objects.create(
                    lesson=lesson,
                    title=quiz_data['title'],
                    description=quiz_data['description'],
                    passing_score=quiz_data['passing_score'],
                    xp_reward=quiz_data['xp_reward'],
                    max_attempts=quiz_data['max_attempts'],
                    is_published=True,
                )
                for q_data in quiz_data['questions']:
                    q = Question.objects.create(
                        quiz=quiz,
                        text=q_data['text'],
                        question_type=q_data['question_type'],
                        points=q_data['points'],
                        order=q_data['order'],
                    )
                    for c_data in q_data['choices']:
                        Choice.objects.create(
                            question=q,
                            text=c_data['text'],
                            is_correct=c_data['is_correct'],
                            order=c_data['order'],
                        )
                quizzes_created += 1
                self.stdout.write(f"  Qo'shildi: {quiz_data['title']}")

        self.stdout.write(self.style.SUCCESS(
            f"\n{lessons_created} ta dars, {quizzes_created} ta test qo'shildi"
        ))