from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_home, name='dashboard_home'),
    path('labo/', views.labo, name='labo'),
    path('quiz/', views.quiz, name='quiz'),
    path('a-propos/', views.a_propos, name='a_propos'),
    path('api/execute/', views.execute_sql, name='execute_sql'),

    # Moteur SQL réel du Dev 2 (utils.py) — nécessite une connexion (login_required)
    path('engine/', views.laboratoire_view, name='laboratoire'),
    path('engine/api/sql/', views.api_executer_requete_sql, name='api_sql'),
]