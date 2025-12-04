// Простой свечной график на Canvas - работает везде
class CanvasChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = [];
        this.padding = { top: 20, right: 20, bottom: 40, left: 60 };
        
        this.init();
    }
    
    init() {
        // Генерируем данные
        this.generateData(50);
        
        // Устанавливаем размеры
        this.resize();
        
        // Отрисовываем
        this.draw();
        
        // Обработчик ресайза
        window.addEventListener('resize', () => this.resize());
    }
    
    generateData(count) {
        this.data = [];
        let price = 45000;
        
        for (let i = 0; i < count; i++) {
            const change = (Math.random() - 0.5) * 0.02;
            const newPrice = price * (1 + change);
            
            this.data.push({
                time: i,
                open: price,
                high: Math.max(price, newPrice) * (1 + Math.random() * 0.01),
                low: Math.min(price, newPrice) * (1 - Math.random() * 0.01),
                close: newPrice,
                volume: Math.random() * 1000 + 500
            });
            
            price = newPrice;
        }
    }
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw();
    }
    
    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;
        
        // Очищаем canvas
        ctx.fillStyle = '#1a1f2e';
        ctx.fillRect(0, 0, width, height);
        
        if (this.data.length === 0) return;
        
        // Вычисляем границы
        const chartWidth = width - this.padding.left - this.padding.right;
        const chartHeight = height - this.padding.top - this.padding.bottom;
        
        // Находим min/max цены
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        
        this.data.forEach(candle => {
            minPrice = Math.min(minPrice, candle.low);
            maxPrice = Math.max(maxPrice, candle.high);
        });
        
        const priceRange = maxPrice - minPrice;
        
        // Рисуем сетку
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        
        // Вертикальные линии
        for (let i = 0; i <= 10; i++) {
            const x = this.padding.left + (chartWidth / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, this.padding.top);
            ctx.lineTo(x, height - this.padding.bottom);
            ctx.stroke();
        }
        
        // Горизонтальные линии
        for (let i = 0; i <= 5; i++) {
            const y = this.padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(this.padding.left, y);
            ctx.lineTo(width - this.padding.right, y);
            ctx.stroke();
        }
        
        // Подписи цен
        ctx.fillStyle = '#d1d4dc';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        
        for (let i = 0; i <= 5; i++) {
            const price = minPrice + (priceRange * (5 - i) / 5);
            const y = this.padding.top + (chartHeight / 5) * i;
            ctx.fillText('$' + Math.round(price).toLocaleString(), this.padding.left - 10, y + 4);
        }
        
        // Подписи времени
        ctx.textAlign = 'center';
        ctx.fillStyle = '#8a94a6';
        
        for (let i = 0; i <= 5; i++) {
            const x = this.padding.left + (chartWidth / 5) * i;
            const timeLabel = `${i * 10}`;
            ctx.fillText(timeLabel, x, height - this.padding.bottom + 20);
        }
        
        // Рисуем свечи
        const candleWidth = chartWidth / this.data.length * 0.7;
        
        this.data.forEach((candle, index) => {
            const x = this.padding.left + (chartWidth / this.data.length) * (index + 0.15);
            
            // Вычисляем Y координаты
            const highY = this.padding.top + chartHeight * (1 - (candle.high - minPrice) / priceRange);
            const lowY = this.padding.top + chartHeight * (1 - (candle.low - minPrice) / priceRange);
            const openY = this.padding.top + chartHeight * (1 - (candle.open - minPrice) / priceRange);
            const closeY = this.padding.top + chartHeight * (1 - (candle.close - minPrice) / priceRange);
            
            // Определяем цвет
            const isBullish = candle.close >= candle.open;
            ctx.fillStyle = isBullish ? '#26a69a' : '#ef5350';
            ctx.strokeStyle = isBullish ? '#26a69a' : '#ef5350';
            ctx.lineWidth = 1;
            
            // Тень (wick)
            ctx.beginPath();
            ctx.moveTo(x + candleWidth/2, highY);
            ctx.lineTo(x + candleWidth/2, lowY);
            ctx.stroke();
            
            // Тело свечи
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY);
            
            if (bodyHeight > 0) {
                ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
                ctx.strokeRect(x, bodyTop, candleWidth, bodyHeight);
            } else {
                // Додж (doji)
                ctx.beginPath();
                ctx.moveTo(x, openY);
                ctx.lineTo(x + candleWidth, openY);
                ctx.stroke();
            }
        });
        
        // Заголовок
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('BTC/USDT', this.padding.left, this.padding.top - 5);
        
        // Легенда
        ctx.font = '12px Arial';
        ctx.fillStyle = '#26a69a';
        ctx.fillText('▲ LONG', width - 150, this.padding.top - 5);
        ctx.fillStyle = '#ef5350';
        ctx.fillText('▼ SHORT', width - 80, this.padding.top - 5);
    }
    
    updateData(newData) {
        this.data = newData;
        this.draw();
    }
    
    setCoin(coinName) {
        // Обновляем данные для новой монеты
        this.generateData(50);
        this.draw();
    }
}

// Создаем глобальный экземпляр
let canvasChart = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('priceChart');
    if (canvas) {
        canvasChart = new CanvasChart('priceChart');
    }
});

// Экспортируем для использования
window.CanvasChart = CanvasChart;
window.canvasChart = canvasChart;
