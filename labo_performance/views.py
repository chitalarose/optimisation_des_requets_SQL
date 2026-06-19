from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

# Importation de tes modèles (Dev 1 & 2)
from .models import RequeteSandbox, CommandeTest
# Importation de ton moteur de sécurité et de performance (Dev 2)
from .utils import verifier_securite_sql, executer_et_analyser_sql

# Vue pour le Dashboard principal (Home)
def dashboard_home(request):
    # On récupère les 5 dernières analyses pour les afficher sur le tableau de bord
    dernieres_analyses = RequeteSandbox.objects.all().order_by('-cree_le')[:5]

    context = {
        'dernieres_analyses': dernieres_analyses,
    }
    # On utilise index.html (le fichier de ta développeuse)
    return render(request, 'labo_performance/index.html', context)

# Vue pour le Laboratoire Avant/Après
def labo(request):
    return render(request, 'labo_performance/labo.html')

# Vue pour le Quiz
def quiz(request):
    return render(request, 'labo_performance/quiz.html')

# Vue pour À propos
def a_propos(request):
    return render(request, 'labo_performance/a_propos.html')


@require_POST
def execute_sql(request):

    try:
        body = json.loads(request.body)
        sql = body.get('sql', '')

        # Données de démonstration (en attendant le moteur EXPLAIN ANALYZE du Dev 2)
        # execution_plan_json suit le format PostgreSQL EXPLAIN (ANALYZE, FORMAT JSON)
        result = {
            "execution_time": 1248.32,
            "rows_analyzed": 522963,
            "index_used": False,
            "temps_execution_avant": 1248.32,
            "temps_execution_apres": 0.48,
            "explain": """
            Seq Scan on commandes
            (cost=0.00..18450.00 rows=37 width=128)
            (actual time=0.02..1248.32 rows=37 loops=1)
              Filter: (date(created_at) = '2024-01-01'::date)
              Rows Removed by Filter: 522963
                """,
            "execution_plan_json": [{
                "Plan": {
                    "Node Type": "Seq Scan",
                    "Relation Name": "commandes",
                    "Total Cost": 18450.00,
                    "Plan Rows": 37,
                    "Actual Rows": 37,
                    "Actual Total Time": 1248.32,
                    "Filter": "(date(created_at) = '2024-01-01'::date)",
                    "Rows Removed by Filter": 522963,
                    "Plans": []
                },
                "Planning Time": 0.40,
                "Execution Time": 1248.32
            }],
        }

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=400
        )


# =====================================================================
#  PARTIE DÉV 2 : MOTEUR SQL, ANALYSE & SÉCURITÉ (LABORATOIRE)
#  Moteur réel (utils.py) — branché sur une route séparée en attendant
#  que le JS (editor.js) soit adapté au format de réponse de ce moteur.
# =====================================================================

@login_required
def laboratoire_view(request):
    """Affiche la page du laboratoire d'optimisation (Page 4 de la maquette)"""
    return render(request, 'labo_performance/labo.html')

@login_required
def api_executer_requete_sql(request):
    """
    API asynchrone appelée en arrière-plan par le Développeur 3 (JavaScript)
    pour analyser et exécuter le SQL de la Sandbox (Page 4 de la maquette).
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            requete_sql = data.get('sql', '')

            # 1. Sécurité : Filtre de sécurité
            est_securise, message_erreur = verifier_securite_sql(requete_sql)
            if not est_securise:
                return JsonResponse({
                    'succes': False,
                    'erreur': message_erreur
                }, status=400)

            # 2. Performance : Analyse et exécution
            analyse_resultat = executer_et_analyser_sql(requete_sql)

            # Renvoie le dictionnaire complet généré par utils.py
            return JsonResponse(analyse_resultat)

        except Exception as e:
            return JsonResponse({'succes': False, 'erreur': str(e)}, status=500)

    return JsonResponse({'succes': False, 'erreur': 'Méthode non autorisée'}, status=405)
