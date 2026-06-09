/* ===== ML ENGINE ===== */
/* Motor de Machine Learning para predicciones */

class MLEngine {
    constructor() {
        this.smoothingFactor = 0.7; // Factor de suavización para predicciones
    }

    // Generar predicción de siguiente línea
    generatePrediction() {
        if (dataManager.lines.length === 0) {
            return null;
        }

        const prediction = [];
        const confidences = [];

        for (let pos = 0; pos < 14; pos++) {
            const positionAnalysis = this.analyzePosition(pos);
            const bestChar = positionAnalysis.best;
            const confidence = positionAnalysis.confidence;

            prediction.push(bestChar);
            confidences.push(confidence);
        }

        return {
            line: prediction.join(''),
            confidences: confidences,
            averageConfidence: (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1)
        };
    }

    // Analizar una posición específica
    analyzePosition(position) {
        const stats = dataManager.getPositionStats();
        const posStats = stats[position];

        if (posStats.total === 0) {
            return {
                best: '1',
                confidence: 33,
                distribution: { '1': 33, '2': 33, 'X': 33 }
            };
        }

        // Calcular probabilidades
        const probs = {
            '1': (posStats['1'] / posStats.total) * 100,
            '2': (posStats['2'] / posStats.total) * 100,
            'X': (posStats['X'] / posStats.total) * 100
        };

        // Aplicar factor de suavización para evitar sobreajuste
        const smoothed = this.applySmoothingAndTrending(position, probs);

        // Obtener el mejor carácter
        const best = Object.keys(smoothed).reduce((a, b) => 
            smoothed[a] > smoothed[b] ? a : b
        );

        return {
            best: best,
            confidence: Math.round(smoothed[best]),
            distribution: smoothed
        };
    }

    // Aplicar suavización y análisis de tendencias
    applySmoothingAndTrending(position, probs) {
        // Suavización: evitar confianza 100%
        const smoothed = {};
        let total = 0;

        for (let char of ['1', '2', 'X']) {
            // Aplicar suavización Laplace
            const smoothValue = (probs[char] * this.smoothingFactor) + 
                               ((100 / 3) * (1 - this.smoothingFactor));
            smoothed[char] = smoothValue;
            total += smoothValue;
        }

        // Normalizar
        for (let char of ['1', '2', 'X']) {
            smoothed[char] = (smoothed[char] / total) * 100;
        }

        // Aplicar tendencia si hay datos suficientes
        if (dataManager.lines.length >= 5) {
            smoothed = this.applyTrendAnalysis(position, smoothed);
        }

        return smoothed;
    }

    // Análisis de tendencias (últimas 5-10 líneas)
    applyTrendAnalysis(position, currentProbs) {
        const lines = dataManager.lines;
        const recentCount = Math.min(10, lines.length);
        const recent = lines.slice(-recentCount);

        const recentCounts = { '1': 0, '2': 0, 'X': 0 };

        recent.forEach(item => {
            const line = item.real || item.line;
            const char = line[position];
            recentCounts[char]++;
        });

        // Combinar probabilidades históricas con tendencia reciente
        const trendWeight = 0.3;
        const updated = {};

        for (let char of ['1', '2', 'X']) {
            const recentProb = (recentCounts[char] / recentCount) * 100;
            updated[char] = (currentProbs[char] * (1 - trendWeight)) + 
                           (recentProb * trendWeight);
        }

        return updated;
    }

    // Calcular probabilidades para una posición
    calculateProbabilities(lineIndex) {
        const stats = dataManager.getPositionStats();
        const probabilities = {};

        for (let pos = 0; pos < 14; pos++) {
            const posStats = stats[pos];
            probabilities[pos] = {
                '1': posStats['1_pct'] || 0,
                '2': posStats['2_pct'] || 0,
                'X': posStats['X_pct'] || 0
            };
        }

        return probabilities;
    }

    // Calcular score de confianza general
    getConfidenceScore() {
        const accuracy = dataManager.getAccuracy();
        const consistency = this.calculateConsistency();
        
        return {
            overall: Math.round((accuracy + consistency) / 2),
            accuracy: accuracy,
            consistency: Math.round(consistency),
            dataPoints: dataManager.lines.length
        };
    }

    // Calcular consistencia (variación entre líneas)
    calculateConsistency() {
        if (dataManager.lines.length < 2) return 50;

        let totalVariation = 0;
        const lines = dataManager.lines;

        for (let i = 1; i < lines.length; i++) {
            const prev = lines[i - 1].real || lines[i - 1].line;
            const curr = lines[i].real || lines[i].line;

            let matches = 0;
            for (let j = 0; j < 14; j++) {
                if (prev[j] === curr[j]) matches++;
            }

            totalVariation += (14 - matches);
        }

        const avgVariation = totalVariation / (lines.length - 1);
        const consistency = 100 - (avgVariation / 14 * 100);

        return Math.max(0, Math.min(100, consistency));
    }

    // Análisis de desvío esperado vs real
    getDeviationAnalysis() {
        const deviations = dataManager.getDeviations();
        if (deviations.length === 0) return null;

        const sortedDev = [...deviations].sort((a, b) => a - b);
        const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
        const median = sortedDev[Math.floor(sortedDev.length / 2)];
        const max = Math.max(...deviations);
        const min = Math.min(...deviations);

        // Calcular desviación estándar
        const variance = deviations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / deviations.length;
        const stdDev = Math.sqrt(variance);

        return {
            mean: Math.round(mean),
            median: median,
            max: max,
            min: min,
            stdDev: Math.round(stdDev),
            count: deviations.length
        };
    }

    // Predicción de próximo desvío esperado
    predictNextDeviation() {
        const analysis = this.getDeviationAnalysis();
        if (!analysis) return 50;

        // Usar media y desviación estándar para predecir
        const expectedDeviation = analysis.mean;
        const confidence = Math.max(30, 100 - analysis.stdDev * 5);

        return {
            expected: expectedDeviation,
            confidence: Math.round(confidence)
        };
    }

    // Generar reporte detallado
    generateReport() {
        return {
            timestamp: new Date().toLocaleString(),
            totalLines: dataManager.lines.length,
            prediction: this.generatePrediction(),
            confidenceScore: this.getConfidenceScore(),
            deviationAnalysis: this.getDeviationAnalysis(),
            expectedDeviation: this.predictNextDeviation(),
            positionStats: dataManager.getPositionStats()
        };
    }

    // Recomendar próximas acciones
    getRecommendations() {
        const confidence = this.getConfidenceScore();
        const predictions = [];

        if (confidence.overall < 50) {
            predictions.push({
                level: 'warning',
                message: '⚠️ Baja confianza. Se recomienda agregar más datos.'
            });
        }

        if (confidence.accuracy < 60) {
            predictions.push({
                level: 'warning',
                message: '⚠️ Precisión baja. El modelo necesita refinamiento.'
            });
        }

        if (confidence.consistency > 80) {
            predictions.push({
                level: 'success',
                message: '✅ Datos muy consistentes. Modelo confiable.'
            });
        }

        if (dataManager.lines.length >= 50) {
            predictions.push({
                level: 'info',
                message: 'ℹ️ Considera hacer backup de datos.'
            });
        }

        return predictions;
    }
}

// Instancia global
const mlEngine = new MLEngine();