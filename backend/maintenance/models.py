from django.db import models
from accounts.models import User


class MaintenanceRequest(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    # Request info
    requester_name = models.CharField(max_length=255)
    requester_role = models.CharField(max_length=50)  # student, staff, instructor
    section = models.CharField(max_length=50, blank=True, null=True)
    student_id = models.CharField(max_length=50, blank=True, null=True)

    description = models.TextField()
    issue_photo = models.ImageField(upload_to="issue_photos/", null=True, blank=True)

    # Location
    building = models.CharField(max_length=100)
    floor = models.CharField(max_length=50, null=True, blank=True)
    room = models.CharField(max_length=100)

    # Status & timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Staff assigned
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_requests",
    )

    # Completion details
    completion_notes = models.TextField(null=True, blank=True)
    completion_photo = models.ImageField(
        upload_to="completed_photos/", null=True, blank=True
    )

    def __str__(self):
        return f"{self.description[:30]}... ({self.status})"
