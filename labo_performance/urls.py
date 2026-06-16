from django.urls import path
from . import views

urlpatterns = [
    path('', views.laboratoire_view, name='laboratoire'),
    path('api/sql/', views.api_executer_requete_sql, name='api_sql'),
]