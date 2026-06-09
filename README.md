# 📊 Predictor Estadístico Inteligente - ML v1.0

Un **predictor visual e inteligente** para líneas de 14 posiciones (1, 2, X) con análisis estadístico avanzado, Machine Learning básico, gráficas dinámicas y corrección automática de desvíos.

## 🎯 Características Principales

### ✅ Análisis Estadístico
- **Cálculo de probabilidades** por posición basado en histórico
- **Frecuencia de caracteres** (1, 2, X) por cada posición
- **Análisis de tendencias** con últimas 5-10 líneas
- **Series temporales** - comparación entre bloques de líneas

### 🤖 Machine Learning
- **Predicción inteligente** de siguiente línea
- **Factor de suavización** para evitar sobreajuste
- **Análisis de consistencia** entre líneas
- **Confianza por posición** con porcentajes precisos
- **Predicción de desvíos esperados** vs reales

### 📊 Visualizaciones
- **Gráfica de desvíos acumulados** (tipo diente de sierra)
- **Precisión histórica** - evolución acumulada
- **Frecuencia de caracteres** por posición
- **Confianza por posición** en predicciones

### 💾 Gestión de Datos
- **Almacenamiento en localStorage** - persistencia automática
- **Exportar datos a JSON** para análisis externo
- **Histórico completo** de líneas con desviaciones
- **Estadísticas en tiempo real**

## 🚀 Uso Rápido

### 1. Agregar línea inicial
```
Nueva línea: 11122XX112X11
Botón: Agregar Línea
```

### 2. Sistema genera predicción
- Analiza histórico
- Calcula probabilidades
- Muestra predicción con confianza

### 3. Ingresar línea real
```
Línea real: 22X112X211X122
Botón: Registrar Real
```

### 4. Corrección automática
- Calcula desvío (% de coincidencias)
- Actualiza modelo ML
- Refina predicciones futuras

## 📁 Estructura de Archivos

```
/
├── index.html          # Estructura HTML modular
├── styles.css          # Estilos responsivos
├── data-manager.js     # Gestión de datos y localStorage
├── ml-engine.js        # Motor de predicciones ML
├── charts-manager.js   # Gráficas Chart.js
├── app.js              # Controlador principal
└── README.md           # Documentación
```

## 🔧 Módulos Principales

### DataManager
```javascript
dataManager.addLine(line)           // Agregar nueva línea
dataManager.setReal(idx, line)      // Registrar línea real
dataManager.getPositionStats()      // Estadísticas por posición
dataManager.getSeriesAnalysis()     // Análisis 5-10 líneas
dataManager.exportJSON()             // Descargar datos
```

### MLEngine
```javascript
mlEngine.generatePrediction()       // Generar predicción
mlEngine.getConfidenceScore()       // Score de confianza
mlEngine.getDeviationAnalysis()     // Análisis de desvíos
mlEngine.predictNextDeviation()     // Predecir próximo desvío
```

### ChartsManager
```javascript
chartsManager.drawDeviationsChart() // Gráfica desvíos
chartsManager.drawAccuracyChart()   // Gráfica precisión
chartsManager.drawFrequencyChart()  // Gráfica frecuencias
chartsManager.updateAllCharts()     // Actualizar todas
```

## 📊 Análisis Incluido

### Por Posición
- Contador de 1, 2, X
- Porcentaje de probabilidad
- Tendencia reciente

### Series (5-10 líneas)
- Comparación entre bloques
- Cambios detectados por posición
- Posición de mayor variación

### Desvíos
- Media, mediana, máx, mín
- Desviación estándar
- Precisión acumulada

## 🎓 Cómo Funciona el ML

1. **Entrada**: Histórico de líneas con resultados reales
2. **Análisis**: Calcula probabilidades por posición
3. **Tendencias**: Weighting reciente (30%) vs histórico (70%)
4. **Suavización**: Evita confianza 100% (Laplace smoothing)
5. **Predicción**: Selecciona carácter con mayor probabilidad
6. **Corrección**: Actualiza modelo con resultado real

### Fórmula Base
```
P(carácter|posición) = 
    (0.7 × probabilidad_histórica) + 
    (0.3 × probabilidad_reciente) + 
    (suavización_laplace)
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Predicción Básica
```
Línea 1: 11122XX112X11 ✓ Agregada
Predicción: 11X21XX112X11 (Confianza: 75%)
Línea real: 11X22XX112X11 (Desvío: 86%)
```

### Ejemplo 2: Análisis de Series
```
Bloque 1 (5 líneas): Tendencia favor 1
Bloque 2 (5 líneas): Cambio a favor 2
Posición 5: Mayor cambio (+15%)
```

## 🎨 Interfaz Modular para Acode

✅ Compatible con **Acode Android**
✅ Responde a **todas las pantallas**
✅ Módulos **separados y reutilizables**
✅ Sin dependencias externas (excepto Chart.js CDN)

### Para usar en Acode:
1. Descargar archivos
2. Crear carpeta proyecto
3. Abrir `index.html` en Acode
4. Editar módulos según necesites

## 📈 Interpretación de Gráficas

### Diente de Sierra (Desvíos)
- **Picos altos**: Predicciones exactas
- **Valles bajos**: Predicciones con error
- **Acumulado**: Tendencia general

### Precisión Histórica
- **Curva ascendente**: Modelo mejora
- **Meseta**: Stabilización
- **Caída**: Modelo necesita actualizar

### Frecuencias
- **Barras altas**: Carácter dominante
- **Barras bajas**: Carácter raro
- **Equilibrio**: Distribución uniforme

## ⚙️ Configuración

Editar en `ml-engine.js`:
```javascript
this.smoothingFactor = 0.7;  // Peso histórico vs reciente
```

Valores:
- `0.9`: Muy histórico (conservador)
- `0.7`: Balanceado (recomendado)
- `0.5`: Muy reactivo a cambios recientes

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Predicciones imprecisas | Agregar más líneas (50+ mínimo) |
| localStorage lleno | Exportar JSON y limpiar |
| Gráficas no aparecen | Verificar conexión Chart.js |
| Datos no se guardan | Activar localStorage navegador |

## 📦 Dependencias

- **Chart.js 3.9.1** - Gráficas (CDN)
- **Navegador moderno** - ES6 JavaScript
- **localStorage** - Almacenamiento

## 🎯 Mejoras Futuras

- [ ] Exportar a CSV
- [ ] Importar datos históricos
- [ ] Análisis de patrones recurrentes
- [ ] Redes neuronales básicas
- [ ] Sincronización en la nube
- [ ] Tema oscuro/claro

## 📝 Licencia

Libre para usar, modificar y distribuir.

---

**Creado para análisis estadístico avanzado** 🚀
Predictor ML v1.0 | 2026