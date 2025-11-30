from django.urls import path
from .views import (
    NotificationListView,
    NotificationCreateView,
    NotificationMarkReadView,
    NotificationDeleteView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("create/", NotificationCreateView.as_view(), name="notifications-create"),
    path(
        "<int:pk>/read/", NotificationMarkReadView.as_view(), name="notifications-read"
    ),
    path(
        "<int:pk>/delete/",
        NotificationDeleteView.as_view(),
        name="notifications-delete",
    ),
]
