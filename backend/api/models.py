from django.db import models
from buildings.models import Building, Floor, Room
from accounts.models import User as StaffAccounts


class MaintenanceRequest(models.Model):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("instructor", "Instructor"),
        ("staff", "Staff"),
    ]

    STATUS_CHOICES = [
        ("pending", "Not Started"),
        ("in_progress", "Underway"),
        ("completed", "Completed"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    requester_name = models.CharField(max_length=100)
    section = models.CharField(max_length=50, blank=True, null=True)
    student_id = models.CharField(max_length=20, blank=True, null=True)

    building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True)
    floor = models.ForeignKey(Floor, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)

    description = models.TextField()
    image = models.ImageField(upload_to="request_images/", null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    taken_by = models.ForeignKey(
        StaffAccounts,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="taken_requests",
    )

    completed_image = models.ImageField(upload_to="completed/", null=True, blank=True)
    completion_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester_name} - {self.description[:20]}"
