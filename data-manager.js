/* ===== DATA MANAGER ===== */
/* Gestiona almacenamiento y manipulación de datos */

class DataManager {
    constructor() {
        this.lines = [];
        this.predictions = [];
        this.deviations = [];
        this.loadData();
    }

    // Agregar nueva línea al histórico
    addLine(line) {
        if (!this.isValidLine(line)) {
            alert('❌ Línea inválida. Debe contener 14 caracteres (1, 2, X)');
            return false;
        }

        this.lines.push({
            id: this.lines.length + 1,
            line: line.toUpperCase(),
            timestamp: new Date().toLocaleString(),
            prediction: null,
            real: null,
            deviation: null,
            correct: null
        });

        this.saveData();
        return true;
    }

    // Registrar predicción para la línea anterior
    setPrediction(lineIndex, prediction) {
        if (lineIndex < 0 || lineIndex >= this.lines.length) return false;

        this.lines[lineIndex].prediction = {
            line: prediction,
            probabilities: mlEngine.calculateProbabilities(lineIndex)
        };

        this.saveData();
        return true;
    }

    // Registrar línea real después de predicción
    setReal(lineIndex, realLine) {
        if (!this.isValidLine(realLine)) {
            alert('❌ Línea inválida. Debe contener 14 caracteres (1, 2, X)');
            return false;
        }

        if (lineIndex < 0 || lineIndex >= this.lines.length) return false;

        realLine = realLine.toUpperCase();
        this.lines[lineIndex].real = realLine;

        // Calcular desvío
        if (this.lines[lineIndex].prediction) {
            const deviation = this.calculateDeviation(
                this.lines[lineIndex].prediction.line,
                realLine
            );
            this.lines[lineIndex].deviation = deviation;
            this.lines[lineIndex].correct = deviation === 0;
            this.deviations.push(deviation);
        }

        this.saveData();
        return true;
    }

    // Validar formato de línea
    isValidLine(line) {
        if (!line || line.length !== 14) return false;
        const validPattern = /^[1|2|X]{14}$/i;
        return validPattern.test(line);
    }

    // Calcular desvío entre predicción y realidad
    calculateDeviation(predicted, real) {
        let matches = 0;
        for (let i = 0; i < predicted.length; i++) {
            if (predicted[i] === real[i]) matches++;
        }
        return Math.round((matches / 14) * 100);
    }

    // Obtener estadísticas por posición
    getPositionStats() {
        const stats = {};

        for (let pos = 0; pos < 14; pos++) {
            stats[pos] = {
                position: pos + 1,
                '1': 0,
                '2': 0,
                'X': 0,
                total: 0
            };

            this.lines.forEach(item => {
                if (item.real) {
                    const char = item.real[pos];
                    stats[pos][char]++;
                    stats[pos].total++;
                } else if (item.line) {
                    // Si no hay real, usar línea ingresada
                    const char = item.line[pos];
                    stats[pos][char]++;
                    stats[pos].total++;
                }
            });

            // Calcular probabilidades
            if (stats[pos].total > 0) {
                stats[pos]['1_pct'] = ((stats[pos]['1'] / stats[pos].total) * 100).toFixed(1);
                stats[pos]['2_pct'] = ((stats[pos]['2'] / stats[pos].total) * 100).toFixed(1);
                stats[pos]['X_pct'] = ((stats[pos]['X'] / stats[pos].total) * 100).toFixed(1);
            }
        }

        return stats;
    }

    // Obtener precisión histórica
    getAccuracy() {
        if (this.deviations.length === 0) return 0;
        const average = this.deviations.reduce((a, b) => a + b, 0) / this.deviations.length;
        return Math.round(average);
    }

    // Obtener datos para análisis de series
    getSeriesAnalysis() {
        if (this.lines.length < 5) return null;

        const lineCount = this.lines.length;
        const mid = Math.floor(lineCount / 2);

        const firstSeries = this.lines.slice(0, mid);
        const secondSeries = this.lines.slice(mid);

        return {
            firstSeries,
            secondSeries,
            comparison: this.compareSeries(firstSeries, secondSeries)
        };
    }

    // Comparar dos series de líneas
    compareSeries(series1, series2) {
        const stats1 = this.analyzeSeriesStats(series1);
        const stats2 = this.analyzeSeriesStats(series2);

        return {
            series1: stats1,
            series2: stats2,
            changes: this.calculateSeriesChanges(stats1, stats2)
        };
    }

    // Analizar estadísticas de una serie
    analyzeSeriesStats(series) {
        const stats = {};

        for (let pos = 0; pos < 14; pos++) {
            stats[pos] = { '1': 0, '2': 0, 'X': 0 };

            series.forEach(item => {
                const line = item.real || item.line;
                const char = line[pos];
                stats[pos][char]++;
            });
        }

        return stats;
    }

    // Calcular cambios entre series
    calculateSeriesChanges(stats1, stats2) {
        const changes = [];

        for (let pos = 0; pos < 14; pos++) {
            const total1 = stats1[pos]['1'] + stats1[pos]['2'] + stats1[pos]['X'];
            const total2 = stats2[pos]['1'] + stats2[pos]['2'] + stats2[pos]['X'];

            if (total1 > 0 && total2 > 0) {
                const change1 = ((stats2[pos]['1'] / total2) - (stats1[pos]['1'] / total1)) * 100;
                const change2 = ((stats2[pos]['2'] / total2) - (stats1[pos]['2'] / total1)) * 100;
                const changeX = ((stats2[pos]['X'] / total2) - (stats1[pos]['X'] / total1)) * 100;

                changes.push({
                    position: pos + 1,
                    change1: change1.toFixed(1),
                    change2: change2.toFixed(1),
                    changeX: changeX.toFixed(1)
                });
            }
        }

        return changes;
    }

    // Obtener predicción anterior para última línea
    getLastPrediction() {
        if (this.lines.length < 2) return null;
        return this.lines[this.lines.length - 2].prediction;
    }

    // Obtener todas las líneas
    getAllLines() {
        return this.lines;
    }

    // Limpiar todos los datos
    clearAll() {
        if (confirm('⚠️ ¿Estás seguro? Se eliminarán todos los datos.')) {
            this.lines = [];
            this.predictions = [];
            this.deviations = [];
            localStorage.removeItem('predictorData');
            return true;
        }
        return false;
    }

    // Guardar datos en localStorage
    saveData() {
        localStorage.setItem('predictorData', JSON.stringify({
            lines: this.lines,
            deviations: this.deviations
        }));
    }

    // Cargar datos de localStorage
    loadData() {
        const saved = localStorage.getItem('predictorData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.lines = data.lines || [];
                this.deviations = data.deviations || [];
            } catch (e) {
                console.error('Error cargando datos:', e);
            }
        }
    }

    // Exportar datos a JSON
    exportJSON() {
        const dataStr = JSON.stringify({
            lines: this.lines,
            deviations: this.deviations,
            stats: this.getPositionStats(),
            accuracy: this.getAccuracy(),
            exportDate: new Date().toLocaleString()
        }, null, 2);

        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `predictor-data-${Date.now()}.json`;
        link.click();
    }

    // Obtener desvíos históricos
    getDeviations() {
        return this.deviations;
    }

    // Obtener información formateada
    getFormattedInfo() {
        return {
            totalLines: this.lines.length,
            totalDeviations: this.deviations.length,
            averageDeviation: this.getAccuracy(),
            lastLine: this.lines.length > 0 ? this.lines[this.lines.length - 1].line : null,
            lastReal: this.lines.length > 0 ? this.lines[this.lines.length - 1].real : null
        };
    }
}

// Instancia global
const dataManager = new DataManager();