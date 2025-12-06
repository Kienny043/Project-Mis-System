from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).select_related(
            'maintenance_request',
            'maintenance_request__building',
            'maintenance_request__room'  # Add this if room is ForeignKey
        ).order_by("-created_at")


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, pk):
    """Mark a single notification as read"""
    try:
        notification = Notification.objects.get(id=pk, user=request.user)
        notification.is_read = True
        notification.save()
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read for current user"""
    updated = Notification.objects.filter(user=request.user, is_read=False).update(
        is_read=True
    )

    return Response(
        {"message": f"{updated} notifications marked as read", "count": updated}
    )


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def delete_notification(request, pk):
    """Delete a notification"""
    try:
        notification = Notification.objects.get(id=pk, user=request.user)
        notification.delete()
        return Response(
            {"message": "Notification deleted"}, status=status.HTTP_204_NO_CONTENT
        )
    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
        )