from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json

# Importation de tes modèles (Dev 1 & 2)
from .models import Cours, CommandeTest
# Importation de ton moteur de sécurité et performance (Dev 2)
from .utils import verifier_securite_sql, executer_et_analyser_sql

# ==========================================
#  PARTIE DÉV 1 : AUTHENTIFICATION & COURS
# ==========================================

def inscription_view(request):
    """Gère la création de compte étudiant"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('liste_cours')
    else:
        form = UserCreationForm()
    return render(request, 'core/inscription.html', {'form': form})

def connexion_view(request):
    """Gère la connexion de l'étudiant"""
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('liste_cours')
    else:
        form = AuthenticationForm()
    return render(request, 'core/connexion.html', {'form': form})

def deconnexion_view(request):
    """Déconnecte l'étudiant"""
    logout(request)
    return redirect('connexion')

def liste_cours_view(request):
    """Affiche tous les cours disponibles (Page 2 de la maquette)"""
    # On récupère tous les cours créés dans la base de données
    les_cours = Cours.objects.all()
    return render(request, 'core/cours_liste.html', {'cours_list': les_cours})

def detail_cours_view(request, slug):
    """Affiche le contenu d'un cours spécifique (Page 3 de la maquette)"""
    un_cours = get_object_or_404(Cours, slug=slug)
    return render(request, 'core/cours_detail.html', {'cours': un_cours})


# ==========================================
#  PARTIE DÉV 2 : LABORATOIRE SQL (API AJAX)
# ==========================================

@login_required
def api_executer_requete_sql(request):
    """
    API appelée en arrière-plan par le Développeur 3 (JavaScript) 
    pour analyser et exécuter le SQL de la Sandbox (Page 4 de la maquette).
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            requete_sql = data.get('sql', '')
            
            # 1. Sécurité : On passe le code dans ton filtre de sécurité
            est_securise, message_erreur = verifier_securite_sql(requete_sql)
            if not est_securise:
                return JsonResponse({
                    'succes': False,
                    'erreur': message_erreur
                }, status=400)
            
            # 2. Exécution & Chronométrage : On lance ton moteur de performance
            analyse_resultat = executer_et_analyser_sql(requete_sql)
            
            # On renvoie toutes les métriques au front-end (Dev 3 et Dev 5)
            return JsonResponse(analyse_resultat)
            
        except Exception as e:
            return JsonResponse({'succes': False, 'erreur': str(e)}, status=500)
            
    return JsonResponse({'succes': False, 'erreur': 'Méthode non autorisée'}, status=405)

@login_required
def laboratoire_view(request):
    """Affiche la page du laboratoire vide (Page 4 de la maquette)"""
    return render(request, 'core/labo.html')