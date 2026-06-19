from django.urls import path
from . import views

urlpatterns = [
    path('', views.liste_cours_view, name='liste_cours'),
    path('cours/', views.liste_cours_view, name='liste_cours'),
    path('cours/<slug:slug>/', views.detail_cours_view, name='detail_cours'),
    path('inscription/', views.inscription_view, name='inscription'),
    path('connexion/', views.connexion_view, name='connexion'),
    path('deconnexion/', views.deconnexion_view, name='deconnexion'),
]