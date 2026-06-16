"""
Vocabulary lessonlariga avtomatik quiz qo'shadi (so'zlar asosida).
Har quizda 5 ta multiple choice savol bo'ladi:
  - Translation match (English → Uzbek)
  - Reverse translation (Uzbek → English)
  - Example sentence gap-fill
  - Pronunciation match (kelajakda audio bilan)
"""

import random
from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import Lesson
from vocabulary.models import LessonWord
from exercises.models import Quiz, Question, Choice


def make_distractors(correct_word, all_words, n=3):
    """Boshqa so'zlardan distraktor (noto'g'ri variant) tanlash."""
    pool = [w for w in all_words if w.id != correct_word.id]
    return random.sample(pool, min(n, len(pool)))


class Command(BaseCommand):
    help = "Vocabulary darslariga avtomatik quiz yaratadi."

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING("⚠️  Reset: barcha quizlar o'chiriladi..."))
            Quiz.objects.all().delete()

        self.stdout.write("🎯 Quiz seed boshlandi...\n")

        # Faqat vocabulary lessonlarini olamiz, va ularda 4+ so'z bo'lganlar
        vocab_lessons = Lesson.objects.filter(
            lesson_type='vocabulary', is_published=True,
        )

        created_count = 0
        for lesson in vocab_lessons:
            lesson_words = list(
                LessonWord.objects.filter(lesson=lesson).select_related('word')
            )
            if len(lesson_words) < 4:
                continue

            quiz, q_created = Quiz.objects.get_or_create(
                lesson=lesson,
                title=f"{lesson.title} — Test",
                defaults={
                    'description': f"{lesson.title} darsidagi so'zlar bo'yicha test.",
                    'passing_score': 70,
                    'max_attempts': 0,
                    'xp_reward': 20,
                    'shuffle_questions': True,
                    'show_correct_answers': True,
                    'is_published': True,
                },
            )

            if not q_created:
                continue  # bu lessonda quiz allaqachon bor

            # Random 5 ta so'z tanlaymiz (kamida 4 ta bo'ladi)
            words = [lw.word for lw in lesson_words]
            sample = random.sample(words, min(5, len(words)))

            for order, word in enumerate(sample, start=1):
                # Har bir so'z uchun random question type
                q_type = random.choice(['en_to_uz', 'uz_to_en', 'fill_blank'])

                if q_type == 'en_to_uz':
                    self._make_en_to_uz(quiz, word, words, order)
                elif q_type == 'uz_to_en':
                    self._make_uz_to_en(quiz, word, words, order)
                else:
                    self._make_fill_blank(quiz, word, order)

            created_count += 1
            self.stdout.write(f"  + {lesson.title} (5 savol)")

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ {created_count} ta yangi quiz yaratildi. "
            f"Jami: {Quiz.objects.count()} ta quiz."
        ))

    def _make_en_to_uz(self, quiz, word, all_words, order):
        """English so'zga qaysi o'zbek tarjima to'g'ri keladi?"""
        question = Question.objects.create(
            quiz=quiz,
            question_type='multiple_choice',
            text=f"\"{word.word}\" so'zining o'zbek tilidagi tarjimasi qaysi?",
            explanation=f"{word.word} = {word.translation_uz}",
            points=1,
            order=order,
        )

        distractors = make_distractors(word, all_words, 3)
        all_choices = [word] + distractors
        random.shuffle(all_choices)

        for c_order, choice_word in enumerate(all_choices, start=1):
            Choice.objects.create(
                question=question,
                text=choice_word.translation_uz,
                is_correct=(choice_word.id == word.id),
                order=c_order,
            )

    def _make_uz_to_en(self, quiz, word, all_words, order):
        """O'zbek so'zga qaysi inglizcha to'g'ri keladi?"""
        question = Question.objects.create(
            quiz=quiz,
            question_type='multiple_choice',
            text=f"\"{word.translation_uz}\" — bu inglizcha qanday?",
            explanation=f"{word.translation_uz} = {word.word}",
            points=1,
            order=order,
        )

        distractors = make_distractors(word, all_words, 3)
        all_choices = [word] + distractors
        random.shuffle(all_choices)

        for c_order, choice_word in enumerate(all_choices, start=1):
            Choice.objects.create(
                question=question,
                text=choice_word.word,
                is_correct=(choice_word.id == word.id),
                order=c_order,
            )

    def _make_fill_blank(self, quiz, word, order):
        """Misol gapda bo'sh joyni to'ldirish."""
        sentence = word.example_sentence or f"I see a {word.word}."

        # Misol gapdagi so'zni ___ ga almashtiramiz (case-insensitive)
        import re
        pattern = re.compile(re.escape(word.word), re.IGNORECASE)
        blanked = pattern.sub('___', sentence, count=1)

        Question.objects.create(
            quiz=quiz,
            question_type='fill_blank',
            text=f"Bo'sh joyga mos so'zni yozing:\n\n{blanked}",
            correct_answer_text=word.word,
            case_sensitive=False,
            explanation=f"To'g'ri javob: \"{word.word}\". Misol: {sentence}",
            points=1,
            order=order,
        )