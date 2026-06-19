// ============================================
// FLOWCHART.JS - Dev5 - Plan d'exécution
// ============================================
// renderFlowchart() accepte :
//  - un plan JSON au format EXPLAIN (ANALYZE, FORMAT JSON) de PostgreSQL
//    (tableau [{ "Plan": {...}, "Execution Time": ... }] ou objet "Plan" direct)
//  - ou la clé 'slow' / 'fast' pour afficher un plan de démonstration

// Plans de démonstration au format EXPLAIN (ANALYZE, FORMAT JSON)
const DEMO_PLANS = {
    slow: [{
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
    fast: [{
        "Plan": {
            "Node Type": "Index Scan",
            "Relation Name": "commandes",
            "Index Name": "idx_created_at",
            "Total Cost": 12.51,
            "Plan Rows": 37,
            "Actual Rows": 37,
            "Actual Total Time": 0.42,
            "Index Cond": "(created_at = '2024-01-01'::date)",
            "Plans": []
        },
        "Planning Time": 0.08,
        "Execution Time": 0.48
    }]
};

// Détermine le type visuel (couleur) du noeud en fonction du plan PostgreSQL
function classifyPlanNode(node) {
    const type = node['Node Type'] || '';
    if (/Seq Scan/i.test(type)) {
        return (node['Rows Removed by Filter'] > 0) ? 'bad' : 'scan';
    }
    if (/Index|Bitmap/i.test(type)) return 'scan';
    return 'op';
}

// Construit le libellé principal d'un noeud (type + table/index)
function planNodeLabel(node) {
    let label = node['Node Type'] || 'Étape';
    if (node['Relation Name']) label += ' — ' + node['Relation Name'];
    if (node['Index Name']) label += ' (' + node['Index Name'] + ')';
    return label;
}

// Construit la ligne de métriques (coût, lignes, temps)
function planNodeCost(node) {
    const parts = [];
    if (node['Total Cost'] !== undefined) parts.push('Coût : ' + node['Total Cost']);
    if (node['Actual Rows'] !== undefined) {
        parts.push(node['Actual Rows'].toLocaleString('fr-FR') + ' lignes');
    }
    if (node['Actual Total Time'] !== undefined) {
        parts.push(node['Actual Total Time'] + ' ms');
    }
    return parts.join(' — ');
}

// Génère un noeud "filtre" séparé si le plan applique une condition (Filter / Index Cond)
function planFilterNode(node) {
    const cond = node['Filter'] || node['Index Cond'] || node['Join Filter'] || node['Hash Cond'];
    if (!cond) return null;

    const label = node['Filter'] ? 'Filtre' : (node['Index Cond'] ? 'Index Cond' : 'Condition');
    const removed = node['Rows Removed by Filter']
        ?? node['Rows Removed by Index Recheck']
        ?? node['Rows Removed by Join Filter']
        ?? 0;

    return {
        type: 'filter',
        label: label + ' : ' + cond,
        cost: 'Rows removed : ' + removed.toLocaleString('fr-FR')
    };
}

// Aplatit l'arbre du plan en ordre d'exécution (les enfants s'exécutent avant leur parent)
function flattenPlan(planNode, out) {
    (planNode.Plans || []).forEach(child => flattenPlan(child, out));
    out.push(planNode);
}

// Normalise les différentes formes possibles du JSON EXPLAIN
function extractRootPlan(planData) {
    if (Array.isArray(planData)) planData = planData[0];
    if (planData && planData.Plan) {
        return { plan: planData.Plan, executionTime: planData['Execution Time'] };
    }
    return { plan: planData, executionTime: undefined };
}

function renderFlowchart(planData) {
    const container = document.getElementById('flowchart');
    if (!container) return;

    // Compatibilité avec les boutons de démo ('slow' / 'fast')
    if (typeof planData === 'string') {
        planData = DEMO_PLANS[planData] || DEMO_PLANS.slow;
    }
    if (!planData) planData = DEMO_PLANS.slow;

    const { plan, executionTime } = extractRootPlan(planData);
    if (!plan || !plan['Node Type']) return;

    const flatPlans = [];
    flattenPlan(plan, flatPlans);

    const nodes = [{ type: 'start', label: 'Début de la requête', cost: '' }];

    flatPlans.forEach(node => {
        nodes.push({
            type: classifyPlanNode(node),
            label: planNodeLabel(node),
            cost: planNodeCost(node)
        });

        const filterNode = planFilterNode(node);
        if (filterNode) nodes.push(filterNode);
    });

    nodes.push({
        type: 'result',
        label: 'Résultat retourné',
        cost: executionTime !== undefined ? 'Temps total : ' + executionTime + ' ms' : ''
    });

    container.innerHTML = '';
    nodes.forEach((node, i) => {
        const div = document.createElement('div');
        div.className = 'fc-node fc-' + node.type;
        div.innerHTML = node.label + (node.cost ? `<div class="fc-cost">${node.cost}</div>` : '');
        container.appendChild(div);

        if (i < nodes.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'fc-arrow';
            container.appendChild(arrow);
        }
    });
}

// Boutons slow / fast (démonstration)
const btnSlow = document.getElementById('btn-plan-slow');
const btnFast = document.getElementById('btn-plan-fast');

if (btnSlow) btnSlow.addEventListener('click', () => renderFlowchart('slow'));
if (btnFast) btnFast.addEventListener('click', () => renderFlowchart('fast'));

document.addEventListener('DOMContentLoaded', () => renderFlowchart('slow'));
