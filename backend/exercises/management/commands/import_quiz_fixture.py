import json
from django.core.management.base import BaseCommand
from content.models import Lesson
from exercises.models import Quiz, Question, Choice


class Command(BaseCommand):
    help = "quiz_export.json fixture'ini nom bo'yicha moslashtirib import qiladi"

    def handle(self, *args, **options):
        path = 'exercises/fixtures/quiz_export.json'
        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        created = 0
        skipped = 0
        not_found = 0

        for item in data:
            lesson = Lesson.objects.filter(
                title=item['lesson_title'],
                module__title=item['module_title'],
                module__course__title=item['course_title'],
            ).first()

            if not lesson:
                self.stdout.write(f"TOPILMADI: {item['course_title']} > {item['module_title']} > {item['lesson_title']}")
                not_found += 1
                continue

            if Quiz.objects.filter(lesson=lesson, title=item['quiz_title']).exists():
                skipped += 1
                continue

            quiz = Quiz.objects.create(
                lesson=lesson,
                title=item['quiz_title'],
                description=item['description'],
                passing_score=item['passing_score'],
                xp_reward=item['xp_reward'],
                max_attempts=item['max_attempts'],
                is_published=True,
            )
            for q_data in item['questions']:
                q = Question.objects.create(
                    quiz=quiz,
                    text=q_data['text'],
                    question_type=q_data['question_type'],
                    points=q_data['points'],
                    order=q_data['order'],
                    hint=q_data.get('hint', ''),
                    correct_answer_text=q_data.get('correct_answer_text', ''),
                    explanation=q_data.get('explanation', ''),
                )
                for c_data in q_data['choices']:
                    Choice.objects.create(
                        question=q,
                        text=c_data['text'],
                        is_correct=c_data['is_correct'],
                        order=c_data['order'],
                    )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"{created} ta yangi test qo'shildi"))
        self.stdout.write(f"{skipped} ta o'tkazib yuborildi")
        self.stdout.write(f"{not_found} ta dars topilmadi")