import re
import time
from django.db import connection

def verifier_securite_sql(requete_sql):
    """
    Vérifie si la requête SQL utilisateur contient des commandes interdites.
    Retourne (True, None) si c'est sécurisé.
    Retourne (False, message_erreur) si c'est dangereux.
    """
    sql_clean = requete_sql.strip().upper()
    
    # Sécurité absolue : Seules les requêtes de lecture (SELECT) sont autorisées
    if not sql_clean.startswith("SELECT") and not sql_clean.startswith("EXPLAIN"):
        return False, "Action interdite. Seules les requêtes de lecture (SELECT) sont autorisées dans la Sandbox."
    
    # Détection des mots-clés destructeurs ou modificateurs interdits
    mots_interdits = [
        r'\bDROP\b', r'\bDELETE\b', r'\bALTER\b', r'\bUPDATE\b', 
        r'\bINSERT\b', r'\bTRUNCATE\b', r'\bGRANT\b', r'\bREVOKE\b'
    ]
    
    for mot in mots_interdits:
        if re.search(mot, sql_clean):
            return False, "Sécurité : Les modifications de structure ou de données sont strictement interdites."
            
    return True, None

def executer_et_analyser_sql(requete_sql):
    """
    Exécute la requête SQL, calcule son temps en millisecondes
    et récupère le plan d'exécution EXPLAIN ANALYZE.
    """
    resultats = []
    colonnes = []
    temps_execution_ms = 0.0
    explain_plan = ""

    # Préparation automatique du EXPLAIN ANALYZE pour l'analyse de performance
    sql_explain = f"EXPLAIN ANALYZE {requete_sql}" if not requete_sql.strip().upper().startswith("EXPLAIN") else requete_sql

    with connection.cursor() as cursor:
        try:
            # --- Chronométrage de haute précision ---
            start_time = time.perf_counter()
            cursor.execute(requete_sql)
            resultats = cursor.fetchall()
            colonnes = [desc[0] for desc in cursor.description] if cursor.description else []
            end_time = time.perf_counter()
            
            # Calcul précis en millisecondes
            temps_execution_ms = (end_time - start_time) * 1000

            # --- Récupération du plan d'optimisation (EXPLAIN ANALYZE) ---
            cursor.execute(sql_explain)
            raw_explain = cursor.fetchall()
            explain_plan = "\n".join([row[0] for row in raw_explain])

        except Exception as e:
            return {
                'succes': False,
                'erreur': str(e)
            }

    return {
        'succes': True,
        'resultats': resultats,
        'colonnes': colonnes,
        'temps_ms': round(temps_execution_ms, 3),
        'explain': explain_plan
    }