// Минимальный работающий график
function createMinimalChart() {
    const container = document.getElementById('chartContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="height: 100%; padding: 20px;">
            <div style="height: 80%; position: relative; border: 1px solid #2d3748; border-radius: 5px; background: #1a1f2e;">
                <div id="priceLine" style="position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #0d6efd, transparent);"></div>
                <div style="position: absolute; top: 10px; left: 10px; color: #d1d4dc;">
                    <div style="font-size: 1.5rem;">📈</div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">Симуляция графика</div>
                </div>
                <div id="priceDisplay" style="position: absolute; bottom: 10px; right: 10px; color: #0d6efd; font-weight: bold; font-size: 1.2rem;">
                    $45,000.00
                </div>
            </div>
            <div style="height: 20%; display: flex; justify-content: space-around; align-items: center; padding: 10px;">
                <div style="text-align: center;">
                    <div style="color: #26a69a;">▲ HIGH</div>
                    <div>$45,500</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #ef5350;">▼ LOW</div>
                    <div>$44,500</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #d1d4dc;">VOLUME</div>
                    <div>1.2M</div>
                </div>
            </div>
        </div>
    `;
    
    // Анимация цены
    let price = 45000;
    const priceElement = document.getElementById('priceDisplay');
    const lineElement = document.getElementById('priceLine');
    
    function updatePrice() {
        const change = (Math.random() - 0.5) * 0.01;
        price = price * (1 + change);
        
        priceElement.textContent = '$' + price.toFixed(2);
        
        // Двигаем линию
        const position = 50 + (change * 100);
        lineElement.style.top = Math.min(Math.max(position, 10), 90) + '%';
        
        // Меняем цвет
        lineElement.style.background = change >= 0 
            ? 'linear-gradient(90deg, transparent, #26a69a, transparent)'
            : 'linear-gradient(90deg, transparent, #ef5350, transparent)';
    }
    
    setInterval(updatePrice, 2000);
}

// Запускаем при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createMinimalChart);
} else {
    createMinimalChart();
}

// Экспортируем функцию
window.createMinimalChart = createMinimalChart;
