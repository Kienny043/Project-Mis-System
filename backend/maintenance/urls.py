from django.urls import path
from .views import (
    CreateRequestView,
    ListRequestsView,
    ClaimRequestView,
    CompleteRequestView,
)

urlpatterns = [
    path("create/", CreateRequestView.as_view()),
    path("all/", ListRequestsView.as_view()),
    path("claim/<int:pk>/", ClaimRequestView.as_view()),
    path("complete/<int:pk>/", CompleteRequestView.as_view()),
]
