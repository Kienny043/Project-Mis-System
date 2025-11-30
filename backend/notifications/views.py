from django.db import models
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            models.Q(user=user) | models.Q(user=None)
        ).order_by("-created_at")


class NotificationCreateView(generics.CreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAdminUser]


class NotificationMarkReadView(APIView):
    def post(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"status": "marked_read"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)


class NotificationDeleteView(APIView):
    def delete(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, user=request.user)
            notif.delete()
            return Response({"status": "deleted"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
