import json
from django.core.management.base import BaseCommand
from grammar.models import GrammarTopic, GrammarRule, GrammarExample


class Command(BaseCommand):
    help = "grammar_export.json fixture'ini nom bo'yicha moslashtirib import qiladi"

    def handle(self, *args, **options):
        path = 'grammar/fixtures/grammar_export.json'
        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        created = 0
        skipped = 0

        for item in data:
            if GrammarTopic.objects.filter(title=item['title']).exists():
                skipped += 1
                continue

            topic = GrammarTopic.objects.create(
                title=item['title'],
                category=item['category'],
                cefr_level=item['cefr_level'],
                short_description=item['short_description'],
                description=item['description'],
                icon=item['icon'],
                order=item['order'],
                is_published=True,
            )

            for rule_data in item['rules']:
                rule = GrammarRule.objects.create(
                    topic=topic,
                    title=rule_data['title'],
                    formula=rule_data['formula'],
                    explanation=rule_data['explanation'],
                    explanation_uz=rule_data['explanation_uz'],
                    tips=rule_data['tips'],
                    common_mistakes=rule_data['common_mistakes'],
                    order=rule_data['order'],
                )
                for ex_data in rule_data['examples']:
                    GrammarExample.objects.create(
                        rule=rule,
                        sentence=ex_data['sentence'],
                        translation=ex_data['translation'],
                        highlight=ex_data['highlight'],
                        is_incorrect=ex_data['is_incorrect'],
                        order=ex_data['order'],
                    )
            created += 1
            self.stdout.write(f"Qo'shildi: {item['title']}")

        self.stdout.write(self.style.SUCCESS(f"\n{created} ta yangi mavzu qo'shildi"))
        self.stdout.write(f"{skipped} ta o'tkazib yuborildi (allaqachon bor edi)")