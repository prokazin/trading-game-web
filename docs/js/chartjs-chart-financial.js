// Упрощенный плагин для свечных графиков Chart.js
(function() {
    'use strict';
    
    // Регистрируем свечной тип графика
    if (typeof Chart !== 'undefined') {
        Chart.register({
            id: 'candlestick',
            beforeDraw: function(chart, args, options) {
                // Рисуем свечи
                const ctx = chart.ctx;
                const meta = chart.getDatasetMeta(0);
                
                if (!meta.data || meta.data.length === 0) return;
                
                meta.data.forEach((element, index) => {
                    const dataset = chart.data.datasets[0];
                    const dataPoint = dataset.data[index];
                    
                    if (!dataPoint) return;
                    
                    const { x, o, h, l, c } = dataPoint;
                    const isUp = c >= o;
                    
                    // Координаты
                    const xCenter = element.x;
                    const openY = chart.scales.y.getPixelForValue(o);
                    const closeY = chart.scales.y.getPixelForValue(c);
                    const highY = chart.scales.y.getPixelForValue(h);
                    const lowY = chart.scales.y.getPixelForValue(l);
                    
                    // Ширина свечи
                    const candleWidth = Math.max(5, element.width * 0.6);
                    
                    // Цвета
                    ctx.strokeStyle = isUp ? '#26a69a' : '#ef5350';
                    ctx.fillStyle = isUp ? '#26a69a' : '#ef5350';
                    ctx.lineWidth = 1;
                    
                    // Тень (high-low)
                    ctx.beginPath();
                    ctx.moveTo(xCenter, highY);
                    ctx.lineTo(xCenter, lowY);
                    ctx.stroke();
                    
                    // Тело свечи
                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.abs(closeY - openY);
                    
                    if (bodyHeight > 0) {
                        ctx.fillRect(xCenter - candleWidth/2, bodyTop, candleWidth, bodyHeight);
                        ctx.strokeRect(xCenter - candleWidth/2, bodyTop, candleWidth, bodyHeight);
                    } else {
                        // Додж (нулевое тело)
                        ctx.beginPath();
                        ctx.moveTo(xCenter - candleWidth/2, openY);
                        ctx.lineTo(xCenter + candleWidth/2, openY);
                        ctx.stroke();
                    }
                });
            }
        });
    }
})();
