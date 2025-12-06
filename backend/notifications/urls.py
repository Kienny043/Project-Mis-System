from django.urls import path
from .views import (
    UserNotificationsView,
    mark_notification_read,
    mark_all_read,
    delete_notification,
)

urlpatterns = [
    path("my/", UserNotificationsView.as_view(), name="my_notifications"),
    path("<int:pk>/mark-read/", mark_notification_read, name="mark_notification_read"),
    path("mark-all-read/", mark_all_read, name="mark_all_read"),
    path("<int:pk>/", delete_notification, name="delete_notification"),
]