// ============================================
// FLOWCHART.JS - Dev5 - Plan d'exécution
// ============================================

const PLANS = {
    slow: [
        { type: 'start',  label: 'Début de la requête',        cost: '' },
        { type: 'bad',    label: 'Seq Scan — commandes',        cost: 'Coût : 18450 — 523 000 lignes' },
        { type: 'filter', label: 'Filtre : DATE(created_at)',   cost: 'Rows removed : 522 963' },
        { type: 'result', label: 'Résultat retourné',           cost: 'Temps : 1 248 ms' }
    ],
    fast: [
        { type: 'start',  label: 'Début de la requête',        cost: '' },
        { type: 'scan',   label: 'Index Scan — idx_created_at', cost: 'Coût : 12.51 — 37 lignes' },
        { type: 'filter', label: 'Index Cond : created_at',     cost: 'Rows removed : 0' },
        { type: 'result', label: 'Résultat retourné',           cost: 'Temps : 48 ms' }
    ]
};

function renderFlowchart(planKey) {
    const container = document.getElementById('flowchart');
    if (!container) return;

    const plan = PLANS[planKey] || PLANS.slow;
    container.innerHTML = '';

    plan.forEach((node, i) => {
        const div = document.createElement('div');
        div.className = 'fc-node fc-' + node.type;
        div.innerHTML = node.label + (node.cost ? `<div class="fc-cost">${node.cost}</div>` : '');
        container.appendChild(div);

        if (i < plan.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'fc-arrow';
            container.appendChild(arrow);
        }
    });
}

// Boutons slow / fast
const btnSlow = document.getElementById('btn-plan-slow');
const btnFast = document.getElementById('btn-plan-fast');

if (btnSlow) btnSlow.addEventListener('click', () => renderFlowchart('slow'));
if (btnFast) btnFast.addEventListener('click', () => renderFlowchart('fast'));

document.addEventListener('DOMContentLoaded', () => renderFlowchart('slow'));
