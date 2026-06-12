from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_home, name='dashboard_home'),
    path('learn/', views.liste_cours, name='liste_cours'),
    path('labo/', views.labo, name='labo'),
    path('quiz/', views.quiz, name='quiz'),
    path('a-propos/', views.a_propos, name='a_propos'),
]