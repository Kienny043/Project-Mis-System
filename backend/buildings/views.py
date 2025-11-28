from rest_framework import generics
from .models import Building, Floor, Room
from .serializers import BuildingSerializer, FloorSerializer, RoomSerializer


class BuildingListView(generics.ListAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer


class FloorListView(generics.ListAPIView):
    serializer_class = FloorSerializer

    def get_queryset(self):
        building_id = self.kwargs["building_id"]
        return Floor.objects.filter(building_id=building_id)


class RoomListView(generics.ListAPIView):
    serializer_class = RoomSerializer

    def get_queryset(self):
        floor_id = self.kwargs.get("floor_id", None)
        building_id = self.kwargs.get("building_id", None)

        # DFA / Grounds → no floors
        if floor_id is None:
            return Room.objects.filter(building_id=building_id)

        return Room.objects.filter(floor_id=floor_id)
