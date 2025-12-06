from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/maintenance/", include("maintenance.urls")),
    # path("api/requests/", include("request_system.urls")),
    path("api/location/", include("buildings.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/calendar/", include("calendar_system.urls")),
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
