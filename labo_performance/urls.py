from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_home, name='dashboard_home'),
    path('learn/', views.liste_cours, name='liste_cours'),
]