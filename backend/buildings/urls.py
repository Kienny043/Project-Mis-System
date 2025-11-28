from django.urls import path
from .views import BuildingListView, FloorListView, RoomListView

urlpatterns = [
    path("buildings/", BuildingListView.as_view()),
    path("<int:building_id>/floors/", FloorListView.as_view()),
    path("<int:building_id>/rooms/", RoomListView.as_view()),  # DFA / GROUND
    path("floors/<int:floor_id>/rooms/", RoomListView.as_view()),  # buildings w/ floors
]
