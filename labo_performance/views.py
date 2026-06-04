from django.shortcuts import render
from .models import Cours, RequeteSandbox

# Vue pour le Dashboard principal (Home)
def dashboard_home(request):
    # On récupère les 5 dernières analyses pour les afficher sur le tableau de bord
    dernieres_analyses = RequeteSandbox.objects.all().order_by('-cree_le')[:5]
    
    context = {
        'dernieres_analyses': dernieres_analyses,
    }
    # On utilise index.html (le fichier de ta développeuse)
    return render(request, 'labo_performance/index.html', context)

# Vue pour la liste des cours (Espace Learn)
def liste_cours(request):
    cours_debutant = Cours.objects.filter(niveau='DEB')
    cours_intermediaire = Cours.objects.filter(niveau='INT')
    cours_avance = Cours.objects.filter(niveau='AV')
    
    context = {
        'cours_debutant': cours_debutant,
        'cours_intermediaire': cours_intermediaire,
        'cours_avance': cours_avance,
    }
    # On utilise cours_liste.html (le fichier de ta développeuse)
    return render(request, 'labo_performance/cours_liste.html', context)