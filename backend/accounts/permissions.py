from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Faqat student role'idagi userlar."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'student'
        )


class IsTeacher(permissions.BasePermission):
    """Faqat teacher role'idagi userlar."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'teacher'
        )


class IsTeacherOrAdmin(permissions.BasePermission):
    """Teacher yoki admin."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ('teacher', 'admin')
        )


class ReadOnlyForStudents(permissions.BasePermission):
    """
    Student'lar faqat GET qila oladi.
    Teacher/admin'lar to'liq access.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ('teacher', 'admin')