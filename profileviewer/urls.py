from django.urls import path
from . import views

app_name = "profileviewer"
urlpatterns = [
    path('', views.index, name="index"),
    path('profile_display', views.profileViewerPage, name="profile_display"),
    path('profile_query_api', views.profileViewerApi, name="profile_query_api"),
]