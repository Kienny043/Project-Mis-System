from django.db import models
from maintenance.models import MaintenanceRequest
from accounts.models import User

class MaintenanceSchedule(models.Model):
    request = models.OneToOneField(
        MaintenanceRequest, 
        on_delete=models.CASCADE, 
        related_name="schedule"
    )
    schedule_date = models.DateField()
    estimated_duration = models.CharField(max_length=100, blank=True, null=True)
    
    # ✅ FIX: Use User instead of StaffProfile
    assigned_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scheduled_tasks",
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Schedule for Request #{self.request.id} on {self.schedule_date}"