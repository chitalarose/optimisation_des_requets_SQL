from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Inclut les routes de l'application core (Connexion, Inscription, Liste des cours)
    path('', include('core.urls')),
    # Inclut les routes de l'application labo_performance (API SQL et page laboratoire)
    path('labo/', include('labo_performance.urls')),
]