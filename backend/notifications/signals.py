from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Notification
from calendar_system.models import MaintenanceSchedule
from maintenance.models import MaintenanceRequest


# When a schedule is added or updated
@receiver(post_save, sender=MaintenanceSchedule)
def notify_schedule(sender, instance, created, **kwargs):
    req = instance.request
    staff = instance.assigned_staff

    # Notify requester (the person who created the request)
    if req.created_by:  # Assuming you have a created_by field
        Notification.objects.create(
            user=req.created_by,
            message=f"Your maintenance request has been scheduled for {instance.schedule_date}.",
            maintenance_request=req,
        )

    # Notify assigned staff
    if staff and staff.user:  # Assuming StaffProfile has a user field
        Notification.objects.create(
            user=staff.user,
            message=f"You have been assigned a maintenance task scheduled for {instance.schedule_date}.",
            maintenance_request=req,
        )


# When status changes
@receiver(pre_save, sender=MaintenanceRequest)
def store_old_status(sender, instance, **kwargs):
    """Store the old status before save"""
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=MaintenanceRequest)
def notify_status_change(sender, instance, created, **kwargs):
    """Notify when status changes"""
    if created:
        return  # Don't notify on creation

    old_status = getattr(instance, "_old_status", None)

    if old_status and old_status != instance.status:
        # Notify the requester
        if instance.created_by:
            Notification.objects.create(
                user=instance.created_by,
                message=f"Your maintenance request status changed to {instance.get_status_display()}.",
                maintenance_request=instance,
            )

        # Notify assigned staff if any
        if instance.assigned_to:
            Notification.objects.create(
                user=instance.assigned_to,
                message=f"Request #{instance.id} status changed to {instance.get_status_display()}.",
                maintenance_request=instance,
            )