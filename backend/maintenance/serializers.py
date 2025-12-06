from rest_framework import serializers
from .models import MaintenanceRequest
from accounts.serializers import StaffProfileSerializer, UserSerializer
from accounts.models import User


# maintenance/serializers.py
class MaintenanceRequestSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    issue_photo = serializers.ImageField(use_url=True, required=False)
    completion_photo = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = MaintenanceRequest
        fields = [
            'id', 'requester_name', 'role', 'section', 'student_id',
            'description', 'issue_photo', 'building', 'floor', 'room',
            'status', 'created_at', 'updated_at',
            'assigned_to', 'assigned_to_details',
            'created_by',  # Add this
            'completion_notes', 'completion_photo'
        ]
        read_only_fields = ["created_at", "updated_at"]

class ClaimRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRequest
        fields = ["assigned_to", "status"]


class CompleteRequestSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = MaintenanceRequest
        fields = ["status", "completion_notes", "completion_photo", "assigned_to"]