from django.db import models
from django.conf import settings


class Event(models.Model):
    EVENT_TYPES = [
        ("school", "School Event"),
        ("maintenance", "Maintenance Schedule"),
        ("request", "Request Schedule"),
        ("personal", "Personal Event"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_events",
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_events",
    )

    is_global = models.BooleanField(default=False)  # shows for everyone?

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.event_type})"
