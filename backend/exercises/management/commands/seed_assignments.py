"""
IELTS Writing lessonlariga essay assignment'lar qo'shadi.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Lesson
from exercises.models import Assignment


# Lesson sarlavhasiga qarab tegishli topshiriq
ASSIGNMENTS = {
    'Line graphs': {
        'title': "Task 1: Line graph — population growth",
        'type': 'essay',
        'instructions': (
            "The line graph below shows the population of three countries "
            "between 1980 and 2020.\n\n"
            "Summarise the information by selecting and reporting the main "
            "features, and make comparisons where relevant.\n\n"
            "Write at least 150 words."
        ),
        'rubric': (
            "**IELTS Task 1 Band Descriptors:**\n\n"
            "- **Task Achievement** — barcha asosiy tendensiyalar yoritilgan\n"
            "- **Coherence & Cohesion** — paragraf tuzilishi, bog'lovchi so'zlar\n"
            "- **Lexical Resource** — boy lug'at, sinonimlar\n"
            "- **Grammatical Range** — turli grammatik tuzilmalar"
        ),
        'min_words': 150, 'max_words': 250,
        'time_minutes': 20,
        'xp': 50,
    },
    'Bar charts and pie charts': {
        'title': "Task 1: Bar chart — energy sources",
        'type': 'essay',
        'instructions': (
            "The bar chart shows the percentage of energy produced by "
            "different sources in 4 European countries.\n\n"
            "Summarise the information by selecting and reporting the main "
            "features, and make comparisons where relevant.\n\n"
            "Write at least 150 words."
        ),
        'rubric': "Standard IELTS Task 1 band descriptors apply.",
        'min_words': 150, 'max_words': 250,
        'time_minutes': 20,
        'xp': 50,
    },
    'Essay structure': {
        'title': "Task 2: Technology and education",
        'type': 'essay',
        'instructions': (
            "Some people think that technology has made our lives more "
            "comfortable, while others argue it has caused many problems.\n\n"
            "Discuss both views and give your own opinion.\n\n"
            "Write at least 250 words."
        ),
        'rubric': (
            "**IELTS Task 2 Band Descriptors:**\n\n"
            "- **Task Response** — savolga to'liq javob, fikr aniq\n"
            "- **Coherence & Cohesion** — toza struktura (intro, body, conclusion)\n"
            "- **Lexical Resource** — boy va aniq lug'at\n"
            "- **Grammatical Range & Accuracy** — turli tuzilmalar, kam xato"
        ),
        'min_words': 250, 'max_words': 350,
        'time_minutes': 40,
        'xp': 80,
    },
    'Body paragraphs': {
        'title': "Task 2: Working from home",
        'type': 'essay',
        'instructions': (
            "Many companies allow employees to work from home. "
            "Do you think the advantages outweigh the disadvantages?\n\n"
            "Give reasons for your answer and include any relevant examples "
            "from your own knowledge or experience.\n\n"
            "Write at least 250 words."
        ),
        'rubric': "Standard IELTS Task 2 band descriptors apply.",
        'min_words': 250, 'max_words': 350,
        'time_minutes': 40,
        'xp': 80,
    },
    'Formal vs informal': {
        'title': "Email: complaint to a service provider",
        'type': 'short_writing',
        'instructions': (
            "Write a formal email to your internet service provider:\n\n"
            "- Explain the problem (slow speed, disconnections)\n"
            "- Ask for a refund or technical visit\n"
            "- Use formal tone\n\n"
            "Write 80-120 words."
        ),
        'rubric': "Use formal register, clear structure, polite tone.",
        'min_words': 80, 'max_words': 120,
        'time_minutes': 15,
        'xp': 30,
    },
    'Cue card strategies': {
        'title': "Speaking Part 2: Describe a person",
        'type': 'speaking',
        'instructions': (
            "Describe a person who has had an important influence on your life.\n\n"
            "You should say:\n"
            "- who this person is\n"
            "- how you met them\n"
            "- what makes them special\n"
            "- and explain why they have influenced your life.\n\n"
            "Speak for 1-2 minutes. Record yourself and submit the audio."
        ),
        'rubric': (
            "**Speaking Part 2 criteria:**\n\n"
            "- Fluency and coherence\n"
            "- Lexical resource (use varied vocabulary)\n"
            "- Grammatical range and accuracy\n"
            "- Pronunciation"
        ),
        'min_words': None, 'max_words': None,
        'time_minutes': 3,
        'xp': 60,
    },
}


class Command(BaseCommand):
    help = "IELTS lessonlariga essay/speaking topshiriqlar qo'shadi."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: barcha assignmentlar o'chiriladi..."))
            Assignment.objects.all().delete()

        self.stdout.write("✍️  Assignment seed boshlandi...\n")

        created_count = 0
        for lesson_title_key, data in ASSIGNMENTS.items():
            lessons = Lesson.objects.filter(title__icontains=lesson_title_key)
            if not lessons.exists():
                self.stdout.write(self.style.WARNING(
                    f"  ⚠️  Lesson topilmadi: {lesson_title_key}"
                ))
                continue

            for lesson in lessons:
                assignment, created = Assignment.objects.get_or_create(
                    lesson=lesson,
                    title=data['title'],
                    defaults={
                        'assignment_type': data['type'],
                        'instructions': data['instructions'],
                        'rubric': data['rubric'],
                        'min_words': data['min_words'],
                        'max_words': data['max_words'],
                        'time_limit_minutes': data['time_minutes'],
                        'xp_reward': data['xp'],
                        'is_published': True,
                    },
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"  + {lesson.title} → {data['title'][:50]}")

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ {created_count} ta yangi assignment. "
            f"Jami: {Assignment.objects.count()} ta."
        ))