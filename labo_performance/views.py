from django.shortcuts import render, get_object_or_404
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

# Vue pour la lecture d'un cours
def cours_detail(request, slug):
    cours = get_object_or_404(Cours, slug=slug)
    return render(request, 'labo_performance/cours_detail.html', {'cours': cours})

# Vue pour le Laboratoire Avant/Après
def labo(request):
    return render(request, 'labo_performance/labo.html')

# Vue pour le Quiz
def quiz(request):
    return render(request, 'labo_performance/quiz.html')

# Vue pour À propos
def a_propos(request):
    return render(request, 'labo_performance/a_propos.html')


import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST

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