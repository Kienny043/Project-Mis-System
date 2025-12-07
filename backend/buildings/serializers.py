# locations/serializers.py

from rest_framework import serializers
from .models import Building, Floor, Room


class BuildingSerializer(serializers.ModelSerializer):
    """Serialize building with only essential fields"""
    class Meta:
        model = Building
        fields = ['id', 'name', 'has_floors', 'total_floors']


class FloorSerializer(serializers.ModelSerializer):
    """Serialize floor with simplified building info"""
    building_name = serializers.CharField(source='building.name', read_only=True)
    
    class Meta:
        model = Floor
        fields = ['id', 'building', 'building_name', 'number', 'label']


class RoomSerializer(serializers.ModelSerializer):
    """Serialize room with simplified building and floor info"""
    building_name = serializers.CharField(source='building.name', read_only=True)
    floor_label = serializers.CharField(source='floor.label', read_only=True, allow_null=True)
    floor_number = serializers.IntegerField(source='floor.number', read_only=True, allow_null=True)
    
    class Meta:
        model = Room
        fields = ['id', 'building', 'building_name', 'floor', 'floor_label', 'floor_number', 'name', 'room_type']


# For nested serialization in maintenance requests
class BuildingSimpleSerializer(serializers.ModelSerializer):
    """Simple building serializer for nested use"""
    class Meta:
        model = Building
        fields = ['id', 'name']


class FloorSimpleSerializer(serializers.ModelSerializer):
    """Simple floor serializer for nested use"""
    class Meta:
        model = Floor
        fields = ['id', 'number', 'label']


class RoomSimpleSerializer(serializers.ModelSerializer):
    """Simple room serializer for nested use"""
    class Meta:
        model = Room
        fields = ['id', 'name']