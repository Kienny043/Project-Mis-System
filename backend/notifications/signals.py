from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings

from request_system.models import Request
from .models import Notification


# Track old status before saving
@receiver(pre_save, sender=Request)
def track_old_status(sender, instance, **kwargs):
    if instance.pk:
        old = Request.objects.get(pk=instance.pk)
        instance._old_status = old.status
        instance._old_assigned_to = old.assigned_to
    else:
        instance._old_status = None
        instance._old_assigned_to = None


# 1) Notification when a new request is created
@receiver(post_save, sender=Request)
def notify_new_request(sender, instance, created, **kwargs):
    if created:
        # Notify ADMIN (or all superusers)
        admins = settings.AUTH_USER_MODEL.objects.filter(is_superuser=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"New request submitted by {instance.requester.username}.",
                notif_type="management",
            )


# 2) Notify staff when assigned
@receiver(post_save, sender=Request)
def notify_assignment(sender, instance, created, **kwargs):
    if not created and instance.assigned_to != instance._old_assigned_to:
        if instance.assigned_to:
            Notification.objects.create(
                user=instance.assigned_to,
                message=f"You have been assigned a new request (ID {instance.id}).",
                notif_type="request",
            )


# 3) Notify requester when status changes
@receiver(post_save, sender=Request)
def notify_status_change(sender, instance, created, **kwargs):
    if not created and instance.status != instance._old_status:
        Notification.objects.create(
            user=instance.requester,
            message=f"Your request (ID {instance.id}) is now '{instance.status}'.",
            notif_type="request",
        )
