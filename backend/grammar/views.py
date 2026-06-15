from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from content.models import Lesson

from .models import GrammarTopic, LessonGrammar
from .serializers import (
    GrammarTopicListSerializer,
    GrammarTopicDetailSerializer,
    LessonGrammarSerializer,
)


class GrammarTopicListView(APIView):
    """
    GET /api/grammar/topics/?category=tenses&cefr_level=A1
    Grammar reference sahifasi uchun.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = GrammarTopic.objects.filter(is_published=True)

        category = request.query_params.get('category')
        cefr_level = request.query_params.get('cefr_level')

        if category:
            qs = qs.filter(category=category)
        if cefr_level:
            qs = qs.filter(cefr_level=cefr_level)

        qs = qs.order_by('category', 'order', 'title')
        serializer = GrammarTopicListSerializer(qs, many=True)
        return Response(serializer.data)


class GrammarTopicDetailView(APIView):
    """
    GET /api/grammar/topics/{id}/
    Yagona mavzu — to'liq qoida + misollar bilan.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        topic = get_object_or_404(
            GrammarTopic, id=id, is_published=True,
        )
        serializer = GrammarTopicDetailSerializer(topic)
        return Response(serializer.data)


class LessonGrammarView(APIView):
    """
    GET /api/grammar/lessons/{lesson_id}/
    Lesson ichidagi grammar mavzulari (to'liq qoidalar bilan).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson, id=lesson_id, is_published=True,
        )
        lesson_grammar = (
            lesson.lesson_grammar
            .select_related('topic')
            .prefetch_related('topic__rules__examples')
            .order_by('order')
        )
        serializer = LessonGrammarSerializer(lesson_grammar, many=True)
        return Response(serializer.data)


class GrammarCategoriesView(APIView):
    """
    GET /api/grammar/categories/
    Grammar kategoriyalari ro'yxati (frontend filter uchun).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count

        # Mavjud kategoriyalar va har birida nechta topic borligini hisoblaymiz
        counts = (
            GrammarTopic.objects
            .filter(is_published=True)
            .values('category')
            .annotate(count=Count('id'))
        )
        count_map = {c['category']: c['count'] for c in counts}

        categories = []
        for value, label in GrammarTopic.Category.choices:
            categories.append({
                'code': value,
                'name': label,
                'topic_count': count_map.get(value, 0),
            })
        return Response(categories)