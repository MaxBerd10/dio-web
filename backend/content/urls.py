from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    TrackListView,
    CourseViewSet,
    ModuleDetailView,
    LessonDetailView,
)

app_name = 'content'

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('tracks/', TrackListView.as_view(), name='tracks'),
    path('modules/<int:id>/', ModuleDetailView.as_view(), name='module-detail'),
    path('lessons/<int:id>/', LessonDetailView.as_view(), name='lesson-detail'),
]

urlpatterns += router.urls