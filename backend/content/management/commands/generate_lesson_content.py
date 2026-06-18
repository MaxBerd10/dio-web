"""
Lessonlarga Claude AI yordamida real darslik matnini generatsiya qiladi.

Foydalanish:
    python manage.py generate_lesson_content
    python manage.py generate_lesson_content --level A1
    python manage.py generate_lesson_content --level A1 --force
    python manage.py generate_lesson_content --lesson-id 5
    python manage.py generate_lesson_content --dry-run
"""

import time
import re
from django.core.management.base import BaseCommand

from content.models import Lesson
from vocabulary.models import LessonWord
from grammar.models import LessonGrammar


def get_claude_client():
    from decouple import config
    try:
        import anthropic
    except ImportError:
        raise ImportError("anthropic o'rnatilmagan. Ishga tushir: pip install anthropic")
    api_key = config('ANTHROPIC_API_KEY', default='')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY topilmadi. .env faylga qo'shing.")
    return anthropic.Anthropic(api_key=api_key)


PROMPT_TEMPLATE = """Sen — O'zbekistondagi ingliz tili o'qituvchisisan. O'zbekzabon o'quvchilar uchun ingliz tili darslarini tayyorlaysan.

Quyidagi dars uchun professional darslik matnini yoz:

**Dars sarlavhasi:** {title}
**CEFR daraja:** {cefr_level}
**Dars turi:** {lesson_type}
**Modul:** {module_title}
**Kurs:** {course_title}

{word_section}

{grammar_section}

**Talab:**
- 250-400 so'z atrofida
- Markdown formatida yoz
- O'zbek tilida tushuntir, lekin inglizcha misollar bilan
- Boshi: kirish paragraf (mavzu nima haqida, nima o'rganamiz)
- Asosiy qism: muhim narsalar, dialog yoki situatsiya misoli
- Foydali iboralar (markdown ro'yxat shaklida)
- Maslahatlar yoki tez-tez qilinadigan xatolar
- Oxirgi paragraf: nimani esda tutish kerakligi haqida

**Struktura:**

# [Dars sarlavhasi]

## Kirish
[2-3 jumla]

## Asosiy materiallar
[Tushuntirish + inglizcha misollar]

## Foydali iboralar
- **Hello!** — Salom!
- **How are you?** — Qalaysiz?

## Dialog / Misol
[Real situatsiya, 4-8 ta dialog satri]

## Maslahatlar
[2-3 ta amaliy maslahat]

## Xulosa
[1-2 jumla]

MUHIM:
- Faqat markdown matn qaytar (hech qanday kirish so'zsiz)
- Inglizcha so'zlar **bold** ko'rinishida
- O'zbekcha izohlar oddiy matnda
- Mavzuga aniq mos kelishi shart"""


def build_word_section(lesson) -> str:
    words = LessonWord.objects.filter(lesson=lesson).select_related('word')[:10]
    if not words:
        return ""
    lines = ["**Bu darsda quyidagi so'zlar ishlatiladi:**"]
    for lw in words:
        w = lw.word
        lines.append(f"- {w.word} ({w.translation_uz})")
    return "\n".join(lines)


def build_grammar_section(lesson) -> str:
    grammar = LessonGrammar.objects.filter(lesson=lesson).select_related('topic')
    if not grammar:
        return ""
    lines = ["**Bu darsda quyidagi grammar mavzulari yoritiladi:**"]
    for g in grammar:
        lines.append(f"- {g.topic.title} ({g.topic.short_description})")
    return "\n".join(lines)


def generate_content(client, prompt: str) -> str:
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    content = message.content[0].text.strip()
    if content.startswith('```'):
        lines = content.split('\n')
        content = '\n'.join(lines[1:-1] if lines[-1].startswith('```') else lines[1:])
    return content


def extract_description(content: str) -> str:
    plain_lines = [
        line.strip() for line in content.split('\n')
        if line.strip() and not line.strip().startswith('#')
    ]
    if plain_lines:
        first = plain_lines[0].replace('**', '').replace('*', '')
        return first[:300]
    return ''


class Command(BaseCommand):
    help = "Lessonlarga Claude AI orqali markdown darslik matnini generatsiya qiladi."

    def add_arguments(self, parser):
        parser.add_argument('--level', type=str,
                            help="CEFR darajasi (A1, A2, B1, ...). Bo'lmasa hammasi.")
        parser.add_argument('--lesson-id', type=int,
                            help="Faqat bitta lesson uchun.")
        parser.add_argument('--force', action='store_true',
                            help="Mavjud content'ni ham qayta yozadi.")
        parser.add_argument('--dry-run', action='store_true',
                            help="Saqlamaydi, faqat ko'rsatadi.")
        parser.add_argument('--limit', type=int, default=0,
                            help="Maksimum N ta lesson (0 = limitsiz).")

    def handle(self, *args, **opts):
        client = get_claude_client()
        self.stdout.write(self.style.SUCCESS("✓ Claude API ga ulandi"))

        # Lessonlarni filter qilish
        qs = Lesson.objects.filter(is_published=True)

        if opts['lesson_id']:
            qs = qs.filter(id=opts['lesson_id'])
        else:
            if opts['level']:
                qs = qs.filter(module__course__cefr_level=opts['level'])
            if not opts['force']:
                qs = qs.filter(content='')

        qs = qs.select_related('module', 'module__course').order_by(
            'module__course__order', 'module__order', 'order'
        )

        if opts['limit'] > 0:
            qs = qs[:opts['limit']]

        total = qs.count()
        if total == 0:
            self.stdout.write(self.style.WARNING("Hech qanday lesson topilmadi."))
            return

        self.stdout.write(f"\n📝 {total} ta lesson uchun content generatsiya qilinadi...\n")

        success_count = 0
        error_count = 0

        for i, lesson in enumerate(qs, start=1):
            course = lesson.module.course
            self.stdout.write(
                f"\n[{i}/{total}] {course.title} → "
                f"{lesson.module.title} → {lesson.title}"
            )

            prompt = PROMPT_TEMPLATE.format(
                title=lesson.title,
                cefr_level=course.cefr_level or 'A1',
                lesson_type=(
                    lesson.get_lesson_type_display()
                    if hasattr(lesson, 'get_lesson_type_display')
                    else lesson.lesson_type
                ),
                module_title=lesson.module.title,
                course_title=course.title,
                word_section=build_word_section(lesson),
                grammar_section=build_grammar_section(lesson),
            )

            try:
                content = generate_content(client, prompt)
                self.stdout.write(f"  ✓ Generated ({len(content)} chars)")

                if opts['dry_run']:
                    self.stdout.write(self.style.WARNING("  [DRY RUN — saqlanmadi]"))
                    self.stdout.write(f"\n--- preview ---\n{content[:400]}...\n")
                else:
                    lesson.content = content
                    if not lesson.description or lesson.description.endswith('berilgan.'):
                        desc = extract_description(content)
                        if desc:
                            lesson.description = desc
                    lesson.save(update_fields=['content', 'description'])
                    self.stdout.write(self.style.SUCCESS("  💾 Saqlandi"))

                success_count += 1
                time.sleep(0.5)  # Claude rate limit yuqori, 0.5s yetarli

            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f"  ✗ Xato: {e}"))
                time.sleep(2)
                continue

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Tugadi: {success_count} ta muvaffaqiyatli, "
            f"{error_count} ta xato."
        ))