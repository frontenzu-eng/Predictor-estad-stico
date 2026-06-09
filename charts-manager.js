/* ===== CHARTS MANAGER ===== */
/* Gestiona gráficas y visualizaciones */

class ChartsManager {
    constructor() {
        this.charts = {};
    }

    // Gráfica de desvíos acumulados
    drawDeviationsChart() {
        const ctx = document.getElementById('deviationsCanvas');
        if (!ctx) return;

        const deviations = dataManager.getDeviations();
        const labels = deviations.map((_, i) => `L${i + 1}`);

        // Calcular acumulado
        let accumulated = 0;
        const accumulatedData = deviations.map(dev => {
            accumulated += dev;
            return (accumulated / (dataManager.lines.length || 1)).toFixed(0);
        });

        if (this.charts.deviations) {
            this.charts.deviations.destroy();
        }

        this.charts.deviations = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Desvío Acumulado %',
                        data: accumulatedData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Desvío Línea %',
                        data: deviations,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 3,
                        pointBackgroundColor: '#e74c3c'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Desvíos Acumulados vs Por Línea'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Gráfica de precisión histórica
    drawAccuracyChart() {
        const ctx = document.getElementById('accuracyCanvas');
        if (!ctx) return;

        const lines = dataManager.getAllLines();
        const correctPredictions = lines.filter(l => l.correct).length;
        const totalPredictions = lines.filter(l => l.prediction && l.real).length;
        const accuracy = totalPredictions > 0 ? 
            (correctPredictions / totalPredictions * 100).toFixed(1) : 0;

        const accuracyPerLine = [];
        let correctAccum = 0;

        lines.forEach((line, i) => {
            if (line.correct) correctAccum++;
            const totalToDate = i + 1;
            accuracyPerLine.push((correctAccum / totalToDate * 100).toFixed(1));
        });

        const labels = lines.map((_, i) => `L${i + 1}`);

        if (this.charts.accuracy) {
            this.charts.accuracy.destroy();
        }

        this.charts.accuracy = new Chart(ctx, {
            type: 'area',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Precisión Acumulada %',
                        data: accuracyPerLine,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#2ecc71'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `Precisión Histórica (${accuracy}% General)`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Gráfica de frecuencia por posición
    drawFrequencyChart() {
        const ctx = document.getElementById('frequencyCanvas');
        if (!ctx) return;

        const stats = dataManager.getPositionStats();
        const positions = [];
        const freq1 = [];
        const freq2 = [];
        const freqX = [];

        for (let i = 0; i < 14; i++) {
            positions.push(`Pos ${i + 1}`);
            freq1.push(stats[i]['1_pct'] || 0);
            freq2.push(stats[i]['2_pct'] || 0);
            freqX.push(stats[i]['X_pct'] || 0);
        }

        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }

        this.charts.frequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: positions,
                datasets: [
                    {
                        label: 'Frecuencia 1 %',
                        data: freq1,
                        backgroundColor: '#3498db'
                    },
                    {
                        label: 'Frecuencia 2 %',
                        data: freq2,
                        backgroundColor: '#e74c3c'
                    },
                    {
                        label: 'Frecuencia X %',
                        data: freqX,
                        backgroundColor: '#f39c12'
                    }
                ]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Frecuencia de Caracteres por Posición'
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Gráfica de predicción actual
    drawPredictionChart(prediction) {
        const container = document.querySelector('.prediction-section');
        if (!container) return;

        const canvas = document.getElementById('predictionCanvas');
        const chartContainer = document.querySelector('[id="predictionChart"]');

        if (!canvas) return;

        if (this.charts.prediction) {
            this.charts.prediction.destroy();
        }

        const positions = [];
        const confidences = [];

        prediction.confidences.forEach((conf, i) => {
            positions.push(`P${i + 1}`);
            confidences.push(conf);
        });

        chartContainer.style.display = 'block';

        this.charts.prediction = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: positions,
                datasets: [
                    {
                        label: 'Confianza %',
                        data: confidences,
                        backgroundColor: confidences.map(c => {
                            if (c >= 70) return '#2ecc71';
                            if (c >= 50) return '#f39c12';
                            return '#e74c3c';
                        }),
                        borderRadius: 5
                    }
                ]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Confianza por Posición (Promedio: ${prediction.averageConfidence}%)`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Actualizar todas las gráficas
    updateAllCharts() {
        this.drawDeviationsChart();
        this.drawAccuracyChart();
        this.drawFrequencyChart();

        const prediction = mlEngine.generatePrediction();
        if (prediction) {
            this.drawPredictionChart(prediction);
        }
    }

    // Destruir gráficas
    destroyAllCharts() {
        for (let key in this.charts) {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        }
        this.charts = {};
    }
}

// Instancia global
const chartsManager = new ChartsManager();