from request_system.views import RequestViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"requests", RequestViewSet, basename="requests")
