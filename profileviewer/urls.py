from django.urls import path
from . import views

app_name = "profileviewer"
urlpatterns = [
    path('', views.index, name="index"),
    path('profile_display', views.profileViewer, name="profile_display"),
]