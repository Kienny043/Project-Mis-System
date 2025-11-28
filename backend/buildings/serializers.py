from rest_framework import serializers
from .models import Building, Floor, Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"


class FloorSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Floor
        fields = "__all__"


class BuildingSerializer(serializers.ModelSerializer):
    floors = FloorSerializer(many=True, read_only=True)
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Building
        fields = "__all__"
