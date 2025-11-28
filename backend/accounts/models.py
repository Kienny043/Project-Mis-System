from django.db import models
from django.contrib.auth.models import User


class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default="Maintenance Staff")
    contact_number = models.CharField(max_length=20, blank=True, null=True)

    # Example: plumbing, electrical, etc.
    specialization = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
