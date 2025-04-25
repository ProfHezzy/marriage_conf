from django.contrib import admin
from import_export.admin import ExportMixin
from .models import Registration

@admin.register(Registration)
class RegistrationAdmin(ExportMixin, admin.ModelAdmin):
    list_display = (
        'full_name',
        'email',
        'phone',
        'marital_status',
        'age',
        'country',
        'attendance_mode',
        'registered_at',
    )
    search_fields = ('full_name', 'email', 'phone', 'country')
    list_filter = ('country', 'attendance_mode', 'marital_status', 'age')
