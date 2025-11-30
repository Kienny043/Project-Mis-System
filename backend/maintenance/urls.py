from django.urls import path
from .views import (
    CreateRequestView,
    ListRequestsView,
    ClaimRequestView,
    CompleteRequestView,
)

urlpatterns = [
    path("requests/", ListRequestsView.as_view(), name="list-requests"),
    path("requests/create/", CreateRequestView.as_view(), name="create-request"),
    path("requests/<int:pk>/claim/", ClaimRequestView.as_view(), name="claim-request"),
    path("requests/<int:pk>/complete/", CompleteRequestView.as_view(), name="complete-request"),
]