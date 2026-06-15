from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.pagination import StandardPagination, LargePagination
from accounts.permissions import IsStudent
from content.models import Lesson
from progress.models import WordProgress
from progress.serializers import WordProgressSerializer, ReviewSubmitSerializer

from .models import Word, LessonWord, WordSet
from .serializers import (
    WordSerializer, WordCompactSerializer,
    LessonWordSerializer,
    WordSetListSerializer, WordSetDetailSerializer,
)


class LessonWordsView(APIView):
    """
    GET /api/vocabulary/lessons/{lesson_id}/words/
    Dars ichidagi barcha so'zlar (tartib bilan).
    Avtomatik student uchun WordProgress yozuvlarini yaratadi.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson, id=lesson_id, is_published=True,
        )
        lesson_words = (
            lesson.lesson_words
            .select_related('word')
            .order_by('order')
        )

        # Student bo'lsa, har bir so'z uchun progress yozuvi bo'lishini ta'minlaymiz
        if request.user.role == 'student':
            existing = set(
                WordProgress.objects
                .filter(student=request.user, word__in=[lw.word_id for lw in lesson_words])
                .values_list('word_id', flat=True)
            )
            to_create = [
                WordProgress(student=request.user, word_id=lw.word_id)
                for lw in lesson_words if lw.word_id not in existing
            ]
            if to_create:
                WordProgress.objects.bulk_create(to_create, ignore_conflicts=True)

        serializer = LessonWordSerializer(lesson_words, many=True)
        return Response(serializer.data)


class WordSetListView(APIView):
    """
    GET /api/vocabulary/wordsets/
    GET /api/vocabulary/wordsets/?cefr_level=A1
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = WordSet.objects.filter(is_published=True)

        cefr_level = request.query_params.get('cefr_level')
        if cefr_level:
            qs = qs.filter(cefr_level=cefr_level)

        qs = qs.order_by('order', 'title')

        # word_count uchun annotate
        from django.db.models import Count
        qs = qs.annotate(word_count=Count('words'))

        serializer = WordSetListSerializer(qs, many=True)
        return Response(serializer.data)


class WordSetDetailView(APIView):
    """GET /api/vocabulary/wordsets/{id}/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        wordset = get_object_or_404(
            WordSet, id=id, is_published=True,
        )
        from django.db.models import Count
        wordset.word_count = wordset.words.count()
        serializer = WordSetDetailSerializer(wordset)
        return Response(serializer.data)


# ============================================================
# SRS — Spaced Repetition System
# ============================================================

class ReviewQueueView(APIView):
    """
    GET /api/vocabulary/review/queue/?limit=20
    Bugun takrorlanishi kerak bo'lgan so'zlar (next_review_at <= hozir).
    Faqat studentlar uchun.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        limit = int(request.query_params.get('limit', 20))
        limit = min(limit, 50)  # max 50

        now = timezone.now()

        # Avval — takrorlash kerak bo'lganlar (next_review_at o'tdi)
        due = WordProgress.objects.filter(
            student=request.user,
            next_review_at__lte=now,
        ).exclude(
            status=WordProgress.Status.NEW,
        ).select_related('word').order_by('next_review_at')[:limit]

        # Agar joy qolsa — yangi so'zlar
        remaining = limit - len(due)
        new_words = []
        if remaining > 0:
            new_words = WordProgress.objects.filter(
                student=request.user,
                status=WordProgress.Status.NEW,
            ).select_related('word')[:remaining]

        # Birlashtirib qaytaramiz
        items = list(due) + list(new_words)

        # Word'larni alohida ham qaytaramiz (frontend uchun qulay)
        from .serializers import WordSerializer
        data = []
        for wp in items:
            data.append({
                'progress_id': wp.id,
                'word': WordSerializer(wp.word).data,
                'status': wp.status,
                'repetitions': wp.repetitions,
                'is_new': wp.status == WordProgress.Status.NEW,
            })

        return Response({
            'count': len(data),
            'due_count': len(due),
            'new_count': len(new_words),
            'items': data,
        })


class ReviewSubmitView(APIView):
    """
    POST /api/vocabulary/review/submit/
    body: {"word_id": 5, "quality": 4}

    quality 0-5 — SM-2 algoritmga uzatiladi.
    Streak va XP avtomatik yangilanadi.
    """
    permission_classes = [IsStudent]

    def post(self, request):
        serializer = ReviewSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        word_id = serializer.validated_data['word_id']
        quality = serializer.validated_data['quality']

        # WordProgress'ni topish yoki yaratish
        progress, _ = WordProgress.objects.get_or_create(
            student=request.user,
            word_id=word_id,
        )

        # SM-2 algoritm
        progress.apply_review(quality)

        # Streak va XP yangilash
        from progress.models import Streak, UserXP

        streak, _ = Streak.objects.get_or_create(student=request.user)
        streak.record_activity()

        # Har so'z review = 2 XP (to'g'ri javob uchun) yoki 0
        if quality >= 3:
            xp_amount = 2
            xp_profile, _ = UserXP.objects.get_or_create(student=request.user)
            xp_profile.add_xp(xp_amount)

        return Response({
            'progress': WordProgressSerializer(progress).data,
            'next_review_at': progress.next_review_at,
            'interval_days': progress.interval_days,
            'status': progress.status,
            'xp_earned': 2 if quality >= 3 else 0,
            'current_streak': streak.current_streak,
        })


class StudentWordStatsView(APIView):
    """
    GET /api/vocabulary/stats/
    Studentning umumiy lug'at statistikasi.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        from django.db.models import Count, Q

        stats = WordProgress.objects.filter(student=request.user).aggregate(
            total=Count('id'),
            new=Count('id', filter=Q(status=WordProgress.Status.NEW)),
            learning=Count('id', filter=Q(status=WordProgress.Status.LEARNING)),
            review=Count('id', filter=Q(status=WordProgress.Status.REVIEW)),
            mastered=Count('id', filter=Q(status=WordProgress.Status.MASTERED)),
        )

        # Bugun takrorlash kerak bo'lganlar soni
        now = timezone.now()
        due_now = WordProgress.objects.filter(
            student=request.user,
            next_review_at__lte=now,
        ).exclude(status=WordProgress.Status.NEW).count()

        stats['due_now'] = due_now
        return Response(stats)