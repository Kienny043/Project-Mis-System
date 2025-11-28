from rest_framework import serializers
from .models import MaintenanceRequest
from accounts.serializers import StaffProfileSerializer, UserSerializer


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    assigned_to = StaffProfileSerializer(read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = "__all__"
        read_only_fields = ["status", "assigned_to", "created_at", "updated_at"]


class ClaimRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = ["assigned_to", "status"]


class CompleteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = ["status", "completion_notes", "completion_photo"]
