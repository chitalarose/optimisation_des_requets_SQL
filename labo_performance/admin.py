from django.contrib import admin
from .models import RequeteSandbox, RecommandationOptimisation, CommandeTest

# Enregistrement de tes modèles pour qu'ils apparaissent dans l'admin
# (Cours est géré par l'app "core", voir core/admin.py)
admin.site.register(RequeteSandbox)
admin.site.register(RecommandationOptimisation)
admin.site.register(CommandeTest)
