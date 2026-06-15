from rest_framework import viewsets, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.pagination import StandardPagination
from .models import Course, Module, Lesson, Track
from .serializers import (
    TrackSerializer,
    CourseListSerializer, CourseDetailSerializer,
    ModuleDetailSerializer,
    LessonDetailSerializer,
)


class TrackListView(APIView):
    """
    GET /api/content/tracks/
    3 ta asosiy track haqida statik ma'lumot + dinamik course soni.
    """
    permission_classes = [IsAuthenticated]

    TRACK_META = {
        'general': {
            'name': 'General English',
            'description': 'Kundalik suhbat, sayohat, ish va kommunikatsiya uchun',
            'icon': '🗣️',
        },
        'cefr': {
            'name': 'CEFR Levels',
            'description': "A1 dan C2 gacha — har bir daraja uchun tartibli darslar",
            'icon': '📚',
        },
        'ielts': {
            'name': 'IELTS Preparation',
            'description': 'IELTS imtihoniga: Listening, Reading, Writing, Speaking',
            'icon': '🎯',
        },
    }

    def get(self, request):
        tracks_data = []
        for code, meta in self.TRACK_META.items():
            count = Course.objects.filter(
                track=code, is_published=True,
            ).count()
            tracks_data.append({
                'code': code,
                'name': meta['name'],
                'description': meta['description'],
                'icon': meta['icon'],
                'course_count': count,
            })
        serializer = TrackSerializer(tracks_data, many=True)
        return Response(serializer.data)


class CourseViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    GET /api/content/courses/?track=cefr&cefr_level=A1
    GET /api/content/courses/{id}/
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    lookup_field = 'id'

    def get_queryset(self):
        qs = Course.objects.filter(is_published=True)

        # Filterlar
        track = self.request.query_params.get('track')
        cefr_level = self.request.query_params.get('cefr_level')
        ielts_skill = self.request.query_params.get('ielts_skill')

        if track:
            qs = qs.filter(track=track)
        if cefr_level:
            qs = qs.filter(cefr_level=cefr_level)
        if ielts_skill:
            qs = qs.filter(ielts_skill=ielts_skill)

        return qs.order_by('track', 'order', 'title')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer


class ModuleDetailView(APIView):
    """
    GET /api/content/modules/{id}/ — module + ichidagi lessonlar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            module = Module.objects.select_related('course').get(
                id=id, is_published=True,
            )
        except Module.DoesNotExist:
            return Response(
                {'detail': 'Module topilmadi.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ModuleDetailSerializer(module)
        return Response(serializer.data)


class LessonDetailView(APIView):
    """
    GET /api/content/lessons/{id}/ — to'liq lesson ma'lumoti.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            lesson = Lesson.objects.select_related(
                'module__course',
            ).get(id=id, is_published=True)
        except Lesson.DoesNotExist:
            return Response(
                {'detail': 'Lesson topilmadi.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = LessonDetailSerializer(lesson)
        return Response(serializer.data)