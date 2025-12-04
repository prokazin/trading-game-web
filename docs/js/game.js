// Trading Game JavaScript

let currentGame = {
    balance: 2000,
    positions: [],
    totalPnl: 0,
    currentCoin: 'BTC/USDT',
    tradeType: 'long',
    leverage: 2,
    timeframe: '1h'
};

// Обновление цен
function updatePrices() {
    const prices = {
        'BTC/USDT': 45000 + Math.random() * 2000 - 1000,
        'ETH/USDT': 2400 + Math.random() * 200 - 100,
        'BNB/USDT': 300 + Math.random() * 30 - 15
    };
    
    // Обновление отображения
    document.getElementById('btcPrice').textContent = `$${prices['BTC/USDT'].toFixed(2)}`;
    document.getElementById('ethPrice').textContent = `$${prices['ETH/USDT'].toFixed(2)}`;
    document.getElementById('bnbPrice').textContent = `$${prices['BNB/USDT'].toFixed(2)}`;
    
    // Обновление цены входа для текущей монеты
    const currentPrice = prices[currentGame.currentCoin];
    document.getElementById('entryPrice').value = currentPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Обновление позиций
    updatePositions();
    
    // Обновление графика
    updateChart();
}

// Выбор монеты
function selectCoin(coin) {
    currentGame.currentCoin = coin;
    
    // Обновление активной карточки
    document.querySelectorAll('.coin-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Обновление графика
   // Обновление графика
function updateChart() {
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = ''; // Очищаем контейнер
    
    const symbol = currentGame.currentCoin.split('/')[0];
    
    // Создаем контейнер для графика
    const chartDiv = document.createElement('div');
    chartDiv.id = 'tvChart';
    chartDiv.style.width = '100%';
    chartDiv.style.height = '100%';
    chartContainer.appendChild(chartDiv);
    
    // Создаем график
    const chart = LightweightCharts.createChart(chartDiv, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
            backgroundColor: '#1e293b',
            textColor: '#d1d4dc',
        },
        grid: {
            vertLines: {
                color: '#2B2B43',
            },
            horzLines: {
                color: '#2B2B43',
            },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#485c7b',
        },
        timeScale: {
            borderColor: '#485c7b',
            timeVisible: true,
        },
    });
    
    // Создаем свечной ряд
    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
    });
    
    // Генерируем тестовые данные
    const data = generateCandleData(100);
    candleSeries.setData(data);
    
    // Добавляем объемы
    const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });
    
    const volumeData = data.map(candle => ({
        time: candle.time,
        value: candle.volume || Math.random() * 1000 + 500,
        color: candle.close >= candle.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    }));
    
    volumeSeries.setData(volumeData);
    
    // Обновляем заголовок
    document.getElementById('chartTitle').textContent = currentGame.currentCoin;
    
    // Обработка ресайза
    const resizeObserver = new ResizeObserver(() => {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight,
        });
    });
    
    resizeObserver.observe(chartContainer);
}

// Генерация тестовых свечных данных
function generateCandleData(count) {
    const data = [];
    let time = Date.now() / 1000 - count * 3600; // Начальное время
    
    let price = 45000; // Начальная цена для BTC
    
    for (let i = 0; i < count; i++) {
        time += 3600; // Каждый час
        
        // Генерируем случайное движение цены
        const change = (Math.random() - 0.5) * 0.02; // ±1%
        const newPrice = price * (1 + change);
        
        const open = price;
        const close = newPrice;
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.random() * 1000 + 500;
        
        data.push({
            time: time,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: volume,
        });
        
        price = newPrice;
    }
    
    return data;
}
}

// Выбор типа сделки
function selectTradeType(type) {
    currentGame.tradeType = type;
    
    // Обновление кнопок
    document.querySelector('.btn-trade-long').classList.remove('active');
    document.querySelector('.btn-trade-short').classList.remove('active');
    
    if (type === 'long') {
        document.querySelector('.btn-trade-long').classList.add('active');
    } else {
        document.querySelector('.btn-trade-short').classList.add('active');
    }
}

// Выбор плеча
function selectLeverage(leverage) {
    currentGame.leverage = leverage;
    
    // Обновление кнопок
    document.querySelectorAll('.leverage-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === `${leverage}x`) {
            btn.classList.add('active');
        }
    });
}

// Открытие позиции
function openPosition() {
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    const entryPrice = parseFloat(document.getElementById('entryPrice').value.replace(/,/g, ''));
    
    if (amount < 10) {
        showAlert('Минимальная сумма сделки $10', 'error');
        return;
    }
    
    // Расчет маржи
    const margin = (amount * currentGame.leverage) / 10;
    
    if (margin > currentGame.balance) {
        showAlert('Недостаточно средств на балансе', 'error');
        return;
    }
    
    if (currentGame.positions.length >= 5) {
        showAlert('Максимум 5 открытых позиций', 'error');
        return;
    }
    
    // Расчет ликвидации
    let liquidationPrice;
    if (currentGame.tradeType === 'long') {
        liquidationPrice = entryPrice * (1 - (1 / currentGame.leverage) + 0.005);
    } else {
        liquidationPrice = entryPrice * (1 + (1 / currentGame.leverage) - 0.005);
    }
    
    // Показ модального окна
    const modalBody = `
        <div class="text-center mb-4">
            <i class="fas fa-chart-line fs-1 ${currentGame.tradeType === 'long' ? 'text-success' : 'text-danger'}"></i>
            <h4 class="mt-2">${currentGame.tradeType.toUpperCase()} ${currentGame.currentCoin}</h4>
        </div>
        
        <div class="mb-3">
            <table class="table table-dark table-sm">
                <tr>
                    <td><i class="fas fa-coins"></i> Сумма:</td>
                    <td class="text-end">$${amount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><i class="fas fa-money-bill-wave"></i> Маржа:</td>
                    <td class="text-end">$${margin.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><i class="fas fa-sign-in-alt"></i> Цена входа:</td>
                    <td class="text-end">$${entryPrice.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><i class="fas fa-bolt"></i> Плечо:</td>
                    <td class="text-end">${currentGame.leverage}x</td>
                </tr>
                <tr>
                    <td><i class="fas fa-exclamation-triangle"></i> Ликвидация:</td>
                    <td class="text-end">$${liquidationPrice.toFixed(2)}</td>
                </tr>
            </table>
        </div>
        
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-circle"></i>
            Риск ликвидации при убытке более 100%
        </div>
    `;
    
    document.getElementById('tradeModalBody').innerHTML = modalBody;
    
    // Сохранение данных сделки
    currentGame.currentTrade = {
        coin: currentGame.currentCoin,
        type: currentGame.tradeType,
        leverage: currentGame.leverage,
        amount: amount,
        entryPrice: entryPrice,
        margin: margin,
        liquidationPrice: liquidationPrice
    };
    
    // Показать модальное окно
    new bootstrap.Modal(document.getElementById('tradeModal')).show();
}

// Подтверждение сделки
function confirmTrade() {
    const trade = currentGame.currentTrade;
    
    // Создание позиции
    const position = {
        id: Date.now(),
        symbol: trade.coin,
        type: trade.type,
        leverage: trade.leverage,
        entryPrice: trade.entryPrice,
        currentPrice: trade.entryPrice,
        amount: trade.amount,
        margin: trade.margin,
        liquidationPrice: trade.liquidationPrice,
        pnl: 0,
        pnlPercent: 0,
        openedAt: new Date().toLocaleTimeString()
    };
    
    // Добавление позиции
    currentGame.positions.push(position);
    
    // Обновление баланса
    currentGame.balance -= trade.margin;
    updateBalance();
    
    // Обновление интерфейса
    updatePositions();
    
    // Закрытие модального окна
    bootstrap.Modal.getInstance(document.getElementById('tradeModal')).hide();
    
    showAlert(`Позиция ${trade.type.toUpperCase()} открыта успешно!`, 'success');
}

// Обновление позиций
function updatePositions() {
    const positionsList = document.getElementById('positionsList');
    
    if (currentGame.positions.length === 0) {
        positionsList.innerHTML = `
            <div class="list-group-item bg-transparent text-center py-4">
                <i class="fas fa-inbox fs-1 text-muted"></i>
                <p class="text-muted mb-0">Нет открытых позиций</p>
            </div>
        `;
        document.getElementById('positionsCount').textContent = '0';
        document.getElementById('openPositions').textContent = '0';
        return;
    }
    
    // Обновление цен и PnL
    let totalUnrealizedPnl = 0;
    let winCount = 0;
    
    currentGame.positions.forEach(position => {
        // Симуляция изменения цены
        const change = (Math.random() - 0.5) * 0.03; // ±1.5%
        position.currentPrice = position.entryPrice * (1 + change);
        
        // Расчет PnL
        if (position.type === 'long') {
            position.pnl = (position.currentPrice - position.entryPrice) * position.amount * position.leverage;
        } else {
            position.pnl = (position.entryPrice - position.currentPrice) * position.amount * position.leverage;
        }
        
        position.pnlPercent = (position.pnl / position.margin) * 100;
        
        if (position.pnl > 0) winCount++;
        totalUnrealizedPnl += position.pnl;
        
        // Проверка ликвидации
        if ((position.type === 'long' && position.currentPrice <= position.liquidationPrice) ||
            (position.type === 'short' && position.currentPrice >= position.liquidationPrice)) {
            liquidatePosition(position.id);
        }
    });
    
    // Обновление отображения
    positionsList.innerHTML = currentGame.positions.map(position => `
        <div class="list-group-item bg-transparent position-card ${position.type === 'long' ? 'position-long' : 'position-short'}">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h6 class="mb-1">${position.symbol}</h6>
                    <div>
                        <span class="badge ${position.type === 'long' ? 'bg-success' : 'bg-danger'} me-1">
                            ${position.type.toUpperCase()}
                        </span>
                        <span class="badge badge-leverage">
                            ${position.leverage}x
                        </span>
                    </div>
                </div>
                <div class="text-end">
                    <div class="${position.pnl >= 0 ? 'profit' : 'loss'} fw-bold">
                        ${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}
                    </div>
                    <small class="${position.pnl >= 0 ? 'profit' : 'loss'}">
                        ${position.pnl >= 0 ? '+' : ''}${position.pnlPercent.toFixed(2)}%
                    </small>
                </div>
            </div>
            <div class="row small text-muted">
                <div class="col-6">
                    <div>Вход: $${position.entryPrice.toFixed(2)}</div>
                    <div>Текущая: $${position.currentPrice.toFixed(2)}</div>
                </div>
                <div class="col-6 text-end">
                    <div>Маржа: $${position.margin.toFixed(2)}</div>
                    <div>${position.openedAt}</div>
                </div>
            </div>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-danger w-100" onclick="closePosition(${position.id})">
                    <i class="fas fa-times-circle"></i> Закрыть позицию
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('positionsCount').textContent = currentGame.positions.length;
    document.getElementById('openPositions').textContent = currentGame.positions.length;
    
    // Обновление винрейта
    const winRate = currentGame.positions.length > 0 ? 
        (winCount / currentGame.positions.length * 100).toFixed(1) : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
    
    // Обновление общего PnL
    const totalPnl = currentGame.totalPnl + totalUnrealizedPnl;
    const totalPnlElement = document.getElementById('totalPnl');
    totalPnlElement.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    totalPnlElement.className = totalPnl >= 0 ? 'profit' : 'loss';
}

// Закрытие позиции
function closePosition(positionId) {
    const index = currentGame.positions.findIndex(p => p.id === positionId);
    if (index === -1) return;
    
    const position = currentGame.positions[index];
    
    // Расчет финального PnL
    currentGame.totalPnl += position.pnl;
    
    // Возврат маржи + PnL
    currentGame.balance += position.margin + position.pnl;
    updateBalance();
    
    // Удаление позиции
    currentGame.positions.splice(index, 1);
    
    // Обновление интерфейса
    updatePositions();
    
    showAlert(`Позиция закрыта. PnL: $${position.pnl.toFixed(2)}`, 'info');
}

// Ликвидация позиции
function liquidatePosition(positionId) {
    const index = currentGame.positions.findIndex(p => p.id === positionId);
    if (index === -1) return;
    
    const position = currentGame.positions[index];
    
    // При ликвидации теряется вся маржа
    currentGame.totalPnl -= position.margin;
    
    // Удаление позиции
    currentGame.positions.splice(index, 1);
    
    // Обновление интерфейса
    updatePositions();
    updateBalance();
    
    showAlert(`⚠️ Позиция ликвидирована! Потеряно: $${position.margin.toFixed(2)}`, 'warning');
}

// Обновление баланса
function updateBalance() {
    document.getElementById('userBalance').textContent = `$${currentGame.balance.toFixed(2)}`;
    document.getElementById('portfolioBalance').textContent = `$${currentGame.balance.toFixed(2)}`;
}

// Обновление графика
function updateChart() {
    const symbol = currentGame.currentCoin.split('/')[0];
    
    if (typeof TradingView !== 'undefined') {
        new TradingView.widget({
            "container_id": "chartContainer",
            "width": "100%",
            "height": "100%",
            "symbol": `BINANCE:${symbol}USDT`,
            "interval": currentGame.timeframe,
            "timezone": "Europe/Moscow",
            "theme": "dark",
            "style": "1",
            "locale": "ru",
            "toolbar_bg": "#1e293b",
            "enable_publishing": false,
            "hide_side_toolbar": false,
            "allow_symbol_change": false,
            "details": true,
            "studies": ["Volume@tv-basicstudies"],
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650"
        });
    }
    
    document.getElementById('chartTitle').textContent = currentGame.currentCoin;
}

// Смена таймфрейма
function changeTimeframe(tf) {
    currentGame.timeframe = tf;
    
    // Обновление кнопок
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === tf.toUpperCase()) {
            btn.classList.add('active');
        }
    });
    
    updateChart();
}

// Загрузка рейтинга
function loadLeaderboard() {
    const leaderboardData = [
        { name: 'Трейдер_1', profit: 5240, trades: 42, avatar: '👑' },
        { name: 'Трейдер_2', profit: 3890, trades: 31, avatar: '🥈' },
        { name: 'Трейдер_3', profit: 2670, trades: 28, avatar: '🥉' },
        { name: 'Трейдер_4', profit: 1890, trades: 23, avatar: '⭐' },
        { name: 'Трейдер_5', profit: 1250, trades: 19, avatar: '🔥' }
    ];
    
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = leaderboardData.map((trader, index) => `
        <div class="list-group-item bg-transparent">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="fs-5 me-2">${trader.avatar}</span>
                    <div>
                        <div class="fw-bold">${trader.name}</div>
                        <small class="text-muted">${trader.trades} сделок</small>
                    </div>
                </div>
                <div class="text-end">
                    <div class="profit fw-bold fs-5">+$${trader.profit}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Показать детали портфеля
function showPortfolioDetails() {
    const totalUnrealizedPnl = currentGame.positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalPnl = currentGame.totalPnl + totalUnrealizedPnl;
    
    const details = `
        <strong>Детали портфеля:</strong><br>
        • Баланс: $${currentGame.balance.toFixed(2)}<br>
        • Реализованный PnL: $${currentGame.totalPnl.toFixed(2)}<br>
        • Нереализованный PnL: $${totalUnrealizedPnl.toFixed(2)}<br>
        • Общий PnL: $${totalPnl.toFixed(2)}<br>
        • Открытых позиций: ${currentGame.positions.length}<br>
        • Общая маржа: $${currentGame.positions.reduce((sum, pos) => sum + pos.margin, 0).toFixed(2)}
    `;
    
    showAlert(details, 'info');
}

// Показать уведомление
function showAlert(message, type = 'info') {
    const alertTypes = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    };
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertTypes[type]} alert-dismissible fade show alert-custom`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.getElementById('alertContainer').appendChild(alertDiv);
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Показать модальное окно депозита
function showDepositModal() {
    showAlert('В веб-версии баланс виртуальный. Для сброса к начальным $2000 обновите страницу.', 'info');
}
