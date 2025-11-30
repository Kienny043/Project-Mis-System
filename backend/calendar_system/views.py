from rest_framework import viewsets, permissions
from django.db import models
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Event.objects.filter(
            models.Q(is_global=True)
            | models.Q(created_by=user)
            | models.Q(assigned_to=user)
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
