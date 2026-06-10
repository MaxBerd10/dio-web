from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email',
        'username',
        'full_name',
        'role',
        'cefr_level',
        'learning_goal',
        'is_verified',
        'is_active',
        'created_at',
    )
    list_filter = ('role', 'cefr_level', 'learning_goal', 'is_verified', 'is_active')
    search_fields = ('email', 'username', 'full_name', 'phone')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')

    fieldsets = (
        ('Login', {'fields': ('email', 'username', 'password')}),
        ('Profil', {
            'fields': ('full_name', 'avatar', 'bio', 'phone'),
        }),
        ('Role & Status', {
            'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser'),
        }),
        ('Learning', {
            'fields': ('cefr_level', 'learning_goal', 'target_ielts_score'),
        }),
        ('Permissions', {
            'classes': ('collapse',),
            'fields': ('groups', 'user_permissions'),
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role'),
        }),
    )