// ============================================
// EDITOR.JS - Dev5 - Éditeur SQL + fetch()
// ============================================

const sqlInput = document.getElementById('sql-input');
const runBtn = document.getElementById('run-btn');
const resultBox = document.getElementById('explain-box');
const loadingSpinner = document.getElementById('loading');

// Commandes interdites (Sandbox)
const BLOCKED = /\b(DROP|DELETE|ALTER|TRUNCATE|UPDATE|INSERT)\b/i;

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const c = cookie.trim();
            if (c.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(c.slice(name.length + 1));
            }
        });
    }
    return cookieValue;
}

async function runQuery() {
    const sql = sqlInput.value.trim();

    if (!sql) {
        showError('Écrivez une requête SQL dabord !');
        return;
    }

    if (BLOCKED.test(sql)) {
        showError('Commande bloquée : DROP, DELETE, ALTER et TRUNCATE sont interdits.');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch('/api/execute/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ sql: sql })
        });

        const data = await response.json();

        if (data.error) {
            showError(data.error);
        } else {
            showResult(data);
        }

    } catch (err) {
        showError('Erreur de connexion au serveur.');
    } finally {
        setLoading(false);
    }
}

function showResult(data) {
    // Temps execution
    document.getElementById('exec-time').textContent = data.execution_time + ' ms';
    document.getElementById('rows-count').textContent = data.rows_analyzed.toLocaleString();
    document.getElementById('index-used').textContent = data.index_used ? 'Oui' : 'Non';

    // EXPLAIN
    if (resultBox) resultBox.textContent = data.explain || 'Pas de plan disponible.';

    // Mettre à jour le graphique
    if (typeof updateChart === 'function') {
        updateChart(data.execution_time);
    }
}

function showError(msg) {
    const warn = document.getElementById('warn-box');
    if (warn) {
        warn.textContent = msg;
        warn.style.display = 'block';
        setTimeout(() => { warn.style.display = 'none'; }, 4000);
    }
}

function setLoading(state) {
    if (runBtn) runBtn.disabled = state;
    if (loadingSpinner) loadingSpinner.style.display = state ? 'block' : 'none';
}

// Bouton Exécuter
if (runBtn) runBtn.addEventListener('click', runQuery);

// Raccourci clavier Ctrl+Enter
if (sqlInput) {
    sqlInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') runQuery();
    });
}
