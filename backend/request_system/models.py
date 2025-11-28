from django.db import models
from django.conf import settings
from buildings.models import Building


class Request(models.Model):
    REQUEST_TYPES = [
        ("maintenance", "Maintenance"),
        ("room", "Room Issue"),
        ("equipment", "Equipment Issue"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="requests"
    )
    request_type = models.CharField(max_length=50, choices=REQUEST_TYPES)
    building = models.ForeignKey(
        Building, on_delete=models.SET_NULL, null=True, blank=True
    )
    room = models.CharField(max_length=100, blank=True)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_requests",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.request_type} - {self.requester.username} ({self.status})"
