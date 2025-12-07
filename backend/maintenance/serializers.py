from rest_framework import serializers
from .models import MaintenanceRequest
from accounts.serializers import StaffProfileSerializer, UserSerializer
from accounts.models import User
from buildings.serializers import BuildingSimpleSerializer, FloorSimpleSerializer, RoomSimpleSerializer 

# maintenance/serializers.py
class MaintenanceRequestSerializer(serializers.ModelSerializer):
    building = BuildingSimpleSerializer(read_only=True)
    floor = FloorSimpleSerializer(read_only=True)
    room = RoomSimpleSerializer(read_only=True)

    # Incoming write values
    building_id = serializers.IntegerField(write_only=True)
    floor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    room_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

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

    assigned_to_details_maintenance = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceRequest
        fields = [
            'id', 'building', 'building_id', 'floor', 'floor_id', 'room', 'room_id',
            'requester_name', 'role', 'section', 'student_id',
            'description', 'issue_photo',
            'status', 'created_at', 'updated_at',
            'assigned_to', 'assigned_to_details', 'assigned_to_details_maintenance',
            'created_by',
            'completion_notes', 'completion_photo'
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_assigned_to_details_maintenance(self, obj):
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'username': obj.assigned_to.username,
                'first_name': obj.assigned_to.first_name,
                'last_name': obj.assigned_to.last_name,
                'email': obj.assigned_to.email
            }
        return None

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

