from django.contrib import admin
from .models import MaintenanceSchedule


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "request",
        "schedule_date",
        "estimated_duration",
        "assigned_staff",
        "created_at",
    ]
    list_filter = ["schedule_date", "created_at"]
    search_fields = ["request__description", "request__requester_name"]
    date_hierarchy = "schedule_date"
    readonly_fields = ["created_at"]
    raw_id_fields = ["request", "assigned_staff"]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("request", "assigned_staff")