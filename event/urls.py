from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    #path('success/', views.success, name='success'),  # Define a success view
    path('register/', views.register, name='register'),
    path('user_confirmation/', views.user_confirmation, name='user_confirmation'),
]
