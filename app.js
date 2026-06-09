/* ===== APP.JS ===== */
/* Controlador principal y eventos */

// ===== AGREGAR LÍNEA =====
function addLine() {
    const input = document.getElementById('newLine');
    const line = input.value.trim();

    if (!line) {
        alert('Por favor ingresa una línea');
        return;
    }

    if (dataManager.addLine(line)) {
        input.value = '';
        updateUI();
        alert('✅ Línea agregada correctamente');
    }
}

// ===== REGISTRAR LÍNEA REAL =====
function registerReal() {
    const input = document.getElementById('realLine');
    const realLine = input.value.trim();

    if (!realLine) {
        alert('Por favor ingresa la línea real');
        return;
    }

    const lastLineIndex = dataManager.lines.length - 1;

    if (dataManager.setReal(lastLineIndex, realLine)) {
        input.value = '';
        updateUI();
        alert('✅ Línea real registrada correctamente');
    }
}

// ===== ACTUALIZAR INTERFAZ =====
function updateUI() {
    updatePrediction();
    updateHistory();
    updateStats();
    updateCharts();
    updateSeries();
}

// ===== ACTUALIZAR PREDICCIÓN =====
function updatePrediction() {
    const resultContainer = document.getElementById('predictionResult');

    const prediction = mlEngine.generatePrediction();

    if (!prediction || dataManager.lines.length === 0) {
        resultContainer.innerHTML = '<p class="no-data">Agrega líneas para generar predicciones...</p>';
        return;
    }

    const confidence = mlEngine.getConfidenceScore();
    const deviationPred = mlEngine.predictNextDeviation();

    let html = `
        <div class="prediction-box">
            <div class="prediction-title">📮 Predicción para Siguiente Línea</div>
            <div class="prediction-line">${prediction.line}</div>
            
            <div class="prediction-confidence">
                <strong>Confianza Promedio:</strong> ${prediction.averageConfidence}%
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${prediction.averageConfidence}%"></div>
                </div>
            </div>

            <div class="prediction-confidence">
                <strong>Score General:</strong> ${confidence.overall}%
            </div>

            <div class="prediction-confidence">
                <strong>Desvío Esperado:</strong> ~${deviationPred.expected}% (Confianza: ${deviationPred.confidence}%)
            </div>
    `;

    // Mostrar recomendaciones
    const recommendations = mlEngine.getRecommendations();
    if (recommendations.length > 0) {
        html += '<div style="margin-top: 15px; text-align: left;">';
        recommendations.forEach(rec => {
            html += `<p style="font-size: 0.9em; margin: 5px 0;">${rec.message}</p>`;
        });
        html += '</div>';
    }

    html += '</div>';

    resultContainer.innerHTML = html;

    // Dibujar gráfica de predicción
    chartsManager.drawPredictionChart(prediction);
}

// ===== ACTUALIZAR HISTÓRICO =====
function updateHistory() {
    const tbody = document.getElementById('historyBody');
    const counter = document.getElementById('lineCount');
    const lines = dataManager.getAllLines();

    counter.textContent = lines.length;

    if (lines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin datos</td></tr>';
        return;
    }

    let html = '';

    lines.forEach((item, idx) => {
        const prediction = item.prediction ? item.prediction.line : 'N/A';
        const deviation = item.deviation !== null ? `${item.deviation}%` : 'N/A';
        const status = item.correct ? 
            '<span class="status-badge status-success">✅ Correcto</span>' : 
            '<span class="status-badge status-error">❌ Error</span>';

        const deviationClass = item.deviation !== null && item.deviation >= 70 ? 
            'deviation-positive' : 'deviation-negative';

        html += `
            <tr>
                <td>${item.id}</td>
                <td><span class="line">${item.line}</span></td>
                <td><span class="line">${prediction}</span></td>
                <td><span class="${deviationClass}">${deviation}</span></td>
                <td>${status}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function updateStats() {
    const container = document.getElementById('statsContainer');
    const stats = dataManager.getPositionStats();

    if (dataManager.lines.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Sin datos</p>';
        return;
    }

    let html = '';

    for (let pos = 0; pos < 14; pos++) {
        const stat = stats[pos];

        html += `
            <div class="stat-card">
                <div class="stat-position">Posición ${stat.position}</div>
                <div class="stat-values">
                    <div class="stat-value">
                        <span>
                            <span class="stat-number">${stat['1']}</span>
                            <span style="font-size: 0.7em;">${stat['1_pct']}%</span>
                        </span>
                        <span>
                            <span class="stat-number">${stat['2']}</span>
                            <span style="font-size: 0.7em;">${stat['2_pct']}%</span>
                        </span>
                        <span>
                            <span class="stat-number">${stat['X']}</span>
                            <span style="font-size: 0.7em;">${stat['X_pct']}%</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ===== ACTUALIZAR GRÁFICAS =====
function updateCharts() {
    if (dataManager.lines.length > 0) {
        chartsManager.updateAllCharts();
    }
}

// ===== ACTUALIZAR ANÁLISIS DE SERIES =====
function updateSeries() {
    const container = document.getElementById('seriesResult');

    const seriesData = dataManager.getSeriesAnalysis();

    if (!seriesData || dataManager.lines.length < 5) {
        container.innerHTML = '<p class="no-data">Se necesitan mínimo 5 líneas para análisis de series...</p>';
        return;
    }

    const { firstSeries, secondSeries, comparison } = seriesData;
    const firstCount = firstSeries.length;
    const secondCount = secondSeries.length;

    let html = `
        <div class="series-block">
            <h4>📊 Comparación de Bloques</h4>
            <p><strong>Bloque 1 (Líneas 1-${firstCount}):</strong> ${firstCount} líneas</p>
            <p><strong>Bloque 2 (Líneas ${firstCount + 1}-${firstCount + secondCount}):</strong> ${secondCount} líneas</p>
        </div>

        <div class="series-block">
            <h4>🔍 Cambios Detectados por Posición</h4>
    `;

    comparison.changes.forEach(change => {
        const change1 = parseFloat(change.change1);
        const change2 = parseFloat(change.change2);
        const changeX = parseFloat(change.changeX);

        const arrow1 = change1 > 0 ? '📈' : '📉';
        const arrow2 = change2 > 0 ? '📈' : '📉';
        const arrowX = changeX > 0 ? '📈' : '📉';

        html += `
            <p style="margin: 8px 0; font-size: 0.9em;">
                <strong>Pos ${change.position}:</strong>
                ${arrow1} 1: ${change1 > 0 ? '+' : ''}${change1.toFixed(1)}% | 
                ${arrow2} 2: ${change2 > 0 ? '+' : ''}${change2.toFixed(1)}% | 
                ${arrowX} X: ${changeX > 0 ? '+' : ''}${changeX.toFixed(1)}%
            </p>
        `;
    });

    html += '</div>';

    // Análisis de tendencias principales
    const mostChanged = comparison.changes.reduce((prev, curr) => {
        const prevChange = Math.abs(parseFloat(prev.change1)) + Math.abs(parseFloat(prev.change2)) + Math.abs(parseFloat(prev.changeX));
        const currChange = Math.abs(parseFloat(curr.change1)) + Math.abs(parseFloat(curr.change2)) + Math.abs(parseFloat(curr.changeX));
        return currChange > prevChange ? curr : prev;
    });

    html += `
        <div class="series-block">
            <h4>⚡ Posición de Mayor Cambio</h4>
            <p>La <span class="highlight">Posición ${mostChanged.position}</span> mostró el mayor cambio entre bloques.</p>
        </div>
    `;

    container.innerHTML = html;
}

// ===== TOGLEAR HISTÓRICO =====
function toggleHistory() {
    const container = document.getElementById('historyContainer');
    container.style.display = container.style.display === 'none' ? 'table' : 'none';
}

// ===== CAMBIAR GRÁFICA =====
function showChart(chartName) {
    document.getElementById('deviationsChart').style.display = chartName === 'deviations' ? 'block' : 'none';
    document.getElementById('accuracyChart').style.display = chartName === 'accuracy' ? 'block' : 'none';
    document.getElementById('frequencyChart').style.display = chartName === 'frequency' ? 'block' : 'none';

    // Actualizar botones activos
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.remove('active');
        if (i === ['deviations', 'accuracy', 'frequency'].indexOf(chartName)) {
            btn.classList.add('active');
        }
    });
}

// ===== LIMPIAR DATOS =====
function clearData() {
    if (dataManager.clearAll()) {
        chartsManager.destroyAllCharts();
        updateUI();
        alert('✅ Datos eliminados');
    }
}

// ===== EXPORTAR DATOS =====
function exportData() {
    dataManager.exportJSON();
    alert('✅ Datos descargados como JSON');
}

// ===== VALIDACIÓN EN TIEMPO REAL =====
document.addEventListener('DOMContentLoaded', () => {
    // Validar entrada de línea
    const newLineInput = document.getElementById('newLine');
    const realLineInput = document.getElementById('realLine');

    [newLineInput, realLineInput].forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^1|2|X]/g, '')
                    .substring(0, 14);
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (input === newLineInput) {
                        addLine();
                    } else {
                        registerReal();
                    }
                }
            });
        }
    });

    // Cargar interfaz inicial
    updateUI();

    // Actualizar cada 10 segundos si hay cambios
    setInterval(() => {
        // Podría agregar lógica de auto-actualización aquí
    }, 10000);
});

// ===== INFORMACIÓN DEL NAVEGADOR =====
console.log('%c🚀 Predictor ML v1.0 Iniciado', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cDatos cargados:', 'color: #2ecc71; font-weight: bold;', {
    totalLines: dataManager.lines.length,
    totalDeviations: dataManager.getDeviations().length
});