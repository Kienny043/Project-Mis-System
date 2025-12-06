from rest_framework import serializers
from .models import MaintenanceSchedule
from maintenance.serializers import MaintenanceRequestSerializer
from accounts.serializers import UserSerializer
from accounts.models import User


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    # Include full request details
    request_details = MaintenanceRequestSerializer(source="request", read_only=True)
    
    # Include assigned staff user details
    assigned_staff_details = UserSerializer(source="assigned_staff", read_only=True)

    # Accept User ID for assignment
    assigned_staff = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = MaintenanceSchedule
        fields = [
            "id",
            "request",
            "request_details",
            "schedule_date",
            "estimated_duration",
            "assigned_staff",
            "assigned_staff_details",
            "created_at",
        ]
        read_only_fields = ["created_at"]

