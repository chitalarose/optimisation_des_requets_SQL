from django.contrib import admin
from .models import Cours, RequeteSandbox, RecommandationOptimisation, CommandeTest

# Enregistrement de tes modèles pour qu'ils apparaissent dans l'admin
admin.site.register(Cours)
admin.site.register(RequeteSandbox)
admin.site.register(RecommandationOptimisation)
admin.site.register(CommandeTest)