from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/maintenance/", include("maintenance.urls")),
    path("api/requests/", include("request_system.urls")),  # Add this
    path("api/location/", include("buildings.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)