from django.db import migrations


COURSES = [
    # --- Débutant ---
    {
        "titre": "Les bases des index",
        "niveau": "DEB",
        "slug": "bases-index",
        "description": "Découvrez comment les index fonctionnent et comment ils peuvent considérablement améliorer les performances de vos requêtes SQL.",
        "contenu_markdown": "",  # contenu géré par la page de démonstration
    },
    {
        "titre": "Comprendre EXPLAIN",
        "niveau": "DEB",
        "slug": "comprendre-explain",
        "description": "Apprenez à lire le plan d'exécution d'une requête SQL pour repérer les opérations coûteuses.",
        "contenu_markdown": (
            "EXPLAIN affiche le plan que PostgreSQL prévoit d'utiliser pour exécuter une requête, "
            "sans l'exécuter réellement.\n\n"
            "EXPLAIN ANALYZE exécute réellement la requête et ajoute les temps mesurés "
            "ainsi que le nombre de lignes effectivement traitées.\n\n"
            "Repérez les Seq Scan sur de grandes tables : ils indiquent souvent un index manquant."
        ),
    },
    # --- Intermédiaire ---
    {
        "titre": "Jointures et performance",
        "niveau": "INT",
        "slug": "jointures-performance",
        "description": "Hash Join, Nested Loop, Merge Join : comprenez comment PostgreSQL choisit sa stratégie de jointure.",
        "contenu_markdown": (
            "PostgreSQL choisit automatiquement entre plusieurs algorithmes de jointure selon "
            "la taille des tables et les statistiques disponibles.\n\n"
            "Le Nested Loop Join est efficace pour de petits ensembles de données ou lorsqu'un "
            "index permet de retrouver rapidement les lignes correspondantes.\n\n"
            "Le Hash Join est souvent préféré pour joindre de grandes tables sans tri préalable.\n\n"
            "Le Merge Join est performant lorsque les deux ensembles sont déjà triés sur la clé de jointure."
        ),
    },
    {
        "titre": "VACUUM et statistiques",
        "niveau": "INT",
        "slug": "vacuum-statistiques",
        "description": "Maintenance des tables et mise à jour des statistiques utilisées par l'optimiseur de requêtes.",
        "contenu_markdown": (
            "VACUUM récupère l'espace occupé par les lignes supprimées ou modifiées (tuples morts), "
            "évitant ainsi le gonflement des tables au fil du temps.\n\n"
            "ANALYZE met à jour les statistiques (distribution des valeurs, cardinalités) que "
            "l'optimiseur utilise pour choisir le meilleur plan d'exécution.\n\n"
            "VACUUM ANALYZE combine les deux opérations et devrait être exécuté régulièrement "
            "sur les tables fréquemment modifiées."
        ),
    },
    # --- Avancé ---
    {
        "titre": "Index couvrants et Index-Only Scan",
        "niveau": "AV",
        "slug": "index-couvrants",
        "description": "Éliminez les accès à la table principale grâce aux index couvrants (covering index).",
        "contenu_markdown": (
            "Un index couvrant contient toutes les colonnes nécessaires à une requête, ce qui permet "
            "à PostgreSQL de répondre uniquement à partir de l'index : un Index-Only Scan.\n\n"
            "Cela évite l'accès aux pages de la table (heap), ce qui réduit fortement le temps d'exécution "
            "sur les grandes tables.\n\n"
            "Pensez à inclure les colonnes du SELECT dans l'index avec la clause INCLUDE."
        ),
    },
    {
        "titre": "Résoudre le problème N+1",
        "niveau": "AV",
        "slug": "probleme-n-plus-1",
        "description": "Détectez et corrigez les requêtes en cascade générées par le code applicatif.",
        "contenu_markdown": (
            "Le problème N+1 survient lorsqu'une requête principale récupère N lignes, puis que "
            "le code applicatif exécute une requête supplémentaire pour chacune de ces lignes : "
            "soit 1 + N requêtes au total.\n\n"
            "Solution : remplacer les N requêtes individuelles par une seule requête utilisant "
            "JOIN ou WHERE ... IN (...).\n\n"
            "Les ORM proposent généralement un mécanisme de chargement anticipé (eager loading) "
            "pour éviter ce problème."
        ),
    },
]


def seed_cours(apps, schema_editor):
    Cours = apps.get_model('labo_performance', 'Cours')
    for data in COURSES:
        Cours.objects.update_or_create(slug=data['slug'], defaults=data)


def remove_cours(apps, schema_editor):
    Cours = apps.get_model('labo_performance', 'Cours')
    Cours.objects.filter(slug__in=[c['slug'] for c in COURSES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('labo_performance', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_cours, remove_cours),
    ]
