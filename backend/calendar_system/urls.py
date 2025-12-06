from django.urls import path
from .views import SetScheduleView, CalendarMonthView


urlpatterns = [
    path("schedule/<int:pk>/", SetScheduleView.as_view(), name="set_schedule"),
    path("calendar/month/", CalendarMonthView.as_view(), name="calendar_month"),
]