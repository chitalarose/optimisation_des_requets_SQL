// ============================================
// CHARTS.JS - Dev5 - Graphique Before/After
// ============================================

let barChart = null;
let beforeTime = 0;
let afterTime = 0;
let queryCount = 0;

function initChart() {
    const ctx = document.getElementById('bar-chart');
    if (!ctx) return;

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Avant', 'Après'],
            datasets: [{
                label: 'Temps (ms)',
                data: [0, 0],
                backgroundColor: [
                    'rgba(197, 108, 78, 0.2)',
                    'rgba(29, 158, 117, 0.2)'
                ],
                borderColor: [
                    '#D85A30',
                    '#1d9e75'
                ],
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (c) => ' ' + c.raw + ' ms'
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#888', font: { size: 12 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#888',
                        font: { size: 11 },
                        callback: (v) => v + ' ms'
                    },
                    grid: { color: 'rgba(128,128,128,0.1)' }
                }
            }
        }
    });
}

function updateChart(newTime) {
    if (!barChart) return;
    queryCount++;
    if (queryCount === 1) {
        beforeTime = newTime;
    } else {
        afterTime = newTime;
    }
    barChart.data.datasets[0].data = [beforeTime, afterTime];
    barChart.update();
    updateGainDisplay();
}

// Met à jour les deux barres en une seule fois (réponse contenant déjà
// temps_execution_avant / temps_execution_apres)
function updateChartPair(before, after) {
    if (!barChart) return;
    beforeTime = before;
    afterTime = after;
    queryCount = 2;
    barChart.data.datasets[0].data = [beforeTime, afterTime];
    barChart.update();
    updateGainDisplay();
}

function updateGainDisplay() {
    const gainEl = document.getElementById('perf-gain');
    if (!gainEl) return;
    if (beforeTime > 0 && afterTime > 0) {
        const gain = Math.round(((beforeTime - afterTime) / beforeTime) * 100);
        gainEl.textContent = gain > 0 ? gain + '% plus rapide !' : '';
    } else {
        gainEl.textContent = '';
    }
}

function resetChart() {
    beforeTime = 0;
    afterTime = 0;
    queryCount = 0;
    if (barChart) {
        barChart.data.datasets[0].data = [0, 0];
        barChart.update();
    }
}

document.addEventListener('DOMContentLoaded', initChart);
