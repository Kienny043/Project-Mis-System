from django.urls import path, include

urlpatterns = [
    path("accounts/", include("accounts.urls")),
    path("maintenance/", include("maintenance.urls")),
    path("location/", include("buildings.urls")),
    path("requests/", include("request_system.urls")),
    path("calendar/", include("calendar_system.urls")),
]
