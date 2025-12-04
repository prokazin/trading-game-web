// Trading Game Web Application
class TradingGame {
    constructor() {
        this.currentCoin = 'BTC/USDT';
        this.tradeType = 'long';
        this.leverage = 2;
        this.timeframe = '1h';
        this.positions = [];
        this.balance = 2000;
        this.totalPnl = 0;
        
        this.init();
    }
    
    init() {
        this.loadPrices();
        this.updateChart();
        this.updatePortfolio();
        this.loadLeaderboard();
        
        // Автообновление каждые 10 секунд
        setInterval(() => {
            this.loadPrices();
            this.updatePositions();
            this.updatePortfolio();
        }, 10000);
    }
    
    // Загрузка текущих цен
    loadPrices() {
        // Симуляция реальных цен
        const prices = {
            'BTC/USDT': 45000 + Math.random() * 1000 - 500,
            'ETH/USDT': 2400 + Math.random() * 100 - 50,
            'BNB/USDT': 300 + Math.random() * 20 - 10
        };
        
        // Обновление отображения
        const currentPrice = prices[this.currentCoin];
        document.getElementById('entryPrice').value = currentPrice.toFixed(2);
        
        // Обновление маржи и ликвидации
        this.calculateMargin();
    }
    
    // Обновление графика
    updateChart() {
        const symbol = this.currentCoin.split('/')[0];
        new TradingView.widget({
            "container_id": "chartContainer",
            "width": "100%",
            "height": "100%",
            "symbol": `BINANCE:${symbol}USDT`,
            "interval": this.timeframe,
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
        
        document.getElementById('chartTitle').textContent = this.currentCoin;
    }
    
    // Выбор монеты
    selectCoin(coin) {
        this.currentCoin = coin;
        
        // Обновление активных кнопок
        document.querySelectorAll('.coin-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.trim() === coin) {
                btn.classList.add('active');
            }
        });
        
        // Обновление графика
        this.updateChart();
        this.loadPrices();
    }
    
    // Выбор типа сделки
    selectTradeType(type) {
        this.tradeType = type;
        
        // Обновление кнопок
        document.querySelector('.btn-trade-long').classList.remove('active');
        document.querySelector('.btn-trade-short').classList.remove('active');
        
        if (type === 'long') {
            document.querySelector('.btn-trade-long').classList.add('active');
        } else {
            document.querySelector('.btn-trade-short').classList.add('active');
        }
        
        this.calculateMargin();
    }
    
    // Выбор плеча
    selectLeverage(leverage) {
        this.leverage = leverage;
        
        // Обновление кнопок
        document.querySelectorAll('.leverage-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === `${leverage}x`) {
                btn.classList.add('active');
            }
        });
        
        this.calculateMargin();
    }
    
    // Расчет маржи и ликвидации
    calculateMargin() {
        const amount = parseFloat(document.getElementById('tradeAmount').value) || 100;
        const entryPrice = parseFloat(document.getElementById('entryPrice').value) || 45000;
        
        // Расчет маржи
        const margin = (amount * this.leverage) / 10;
        document.getElementById('marginAmount').textContent = `$${margin.toFixed(2)}`;
        
        // Расчет цены ликвидации
        let liquidationPrice;
        if (this.tradeType === 'long') {
            liquidationPrice = entryPrice * (1 - (1 / this.leverage) + 0.005);
        } else {
            liquidationPrice = entryPrice * (1 + (1 / this.leverage) - 0.005);
        }
        
        document.getElementById('liquidationPrice').textContent = `$${liquidationPrice.toFixed(2)}`;
        
        return { margin, liquidationPrice };
    }
    
    // Открытие позиции
    openPosition() {
        const amount = parseFloat(document.getElementById('tradeAmount').value);
        const entryPrice = parseFloat(document.getElementById('entryPrice').value);
        const stopLoss = document.getElementById('stopLoss').value;
        const takeProfit = document.getElementById('takeProfit').value;
        
        // Валидация
        if (amount < 10) {
            this.showAlert('Минимальная сумма сделки $10', 'error');
            return;
        }
        
        const { margin, liquidationPrice } = this.calculateMargin();
        
        if (margin > this.balance) {
            this.showAlert('Недостаточно средств на балансе', 'error');
            return;
        }
        
        if (this.positions.length >= 5) {
            this.showAlert('Максимум 5 открытых позиций', 'error');
            return;
        }
        
        // Показ модального окна подтверждения
        const modalBody = `
            <div class="mb-3">
                <h6>Детали сделки:</h6>
                <table class="table table-sm table-dark">
                    <tr>
                        <td>Монета:</td>
                        <td class="text-end">${this.currentCoin}</td>
                    </tr>
                    <tr>
                        <td>Направление:</td>
                        <td class="text-end">
                            <span class="${this.tradeType === 'long' ? 'profit' : 'loss'}">
                                ${this.tradeType.toUpperCase()}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Плечо:</td>
                        <td class="text-end">${this.leverage}x</td>
                    </tr>
                    <tr>
                        <td>Сумма:</td>
                        <td class="text-end">$${amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Цена входа:</td>
                        <td class="text-end">$${entryPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Маржа:</td>
                        <td class="text-end">$${margin.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Ликвидация:</td>
                        <td class="text-end">$${liquidationPrice.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i>
                Риск ликвидации при убытке >100%
            </div>
        `;
        
        document.getElementById('tradeModalBody').innerHTML = modalBody;
        new bootstrap.Modal(document.getElementById('tradeModal')).show();
        
        // Сохранение данных сделки
        this.currentTradeData = {
            coin: this.currentCoin,
            type: this.tradeType,
            leverage: this.leverage,
            amount: amount,
            entryPrice: entryPrice,
            margin: margin,
            liquidationPrice: liquidationPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit
        };
    }
    
    // Подтверждение сделки
    confirmTrade() {
        const trade = this.currentTradeData;
        
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
            stopLoss: trade.stopLoss,
            takeProfit: trade.takeProfit,
            pnl: 0,
            pnlPercent: 0,
            openedAt: new Date().toLocaleTimeString()
        };
        
        // Добавление позиции
        this.positions.push(position);
        
        // Обновление баланса
        this.balance -= trade.margin;
        
        // Обновление интерфейса
        this.updatePortfolio();
        this.updatePositions();
        
        // Закрытие модального окна
        bootstrap.Modal.getInstance(document.getElementById('tradeModal')).hide();
        
        this.showAlert(`Позиция ${trade.type.toUpperCase()} открыта успешно!`, 'success');
        
        // Очистка формы
        document.getElementById('tradeAmount').value = '100';
        document.getElementById('stopLoss').value = '';
        document.getElementById('takeProfit').value = '';
    }
    
    // Обновление списка позиций
    updatePositions() {
        const positionsList = document.getElementById('positionsList');
        
        if (this.positions.length === 0) {
            positionsList.innerHTML = `
                <div class="list-group-item bg-transparent text-center py-4">
                    <i class="bi bi-inbox fs-1 text-muted"></i>
                    <p class="text-muted mb-0">Нет открытых позиций</p>
                </div>
            `;
            document.getElementById('positionsCount').textContent = '0';
            return;
        }
        
        // Обновление цен и PnL
        this.positions.forEach(position => {
            // Симуляция изменения цены
            const change = (Math.random() - 0.5) * 0.02; // ±1%
            position.currentPrice = position.entryPrice * (1 + change);
            
            // Расчет PnL
            if (position.type === 'long') {
                position.pnl = (position.currentPrice - position.entryPrice) * position.amount * position.leverage;
            } else {
                position.pnl = (position.entryPrice - position.currentPrice) * position.amount * position.leverage;
            }
            
            position.pnlPercent = (position.pnl / position.margin) * 100;
            
            // Проверка ликвидации
            if ((position.type === 'long' && position.currentPrice <= position.liquidationPrice) ||
                (position.type === 'short' && position.currentPrice >= position.liquidationPrice)) {
                this.liquidatePosition(position.id);
            }
        });
        
        // Обновление отображения
        positionsList.innerHTML = this.positions.map(position => `
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
                        <div>Открыта: ${position.openedAt}</div>
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-danger w-100" onclick="game.closePosition(${position.id})">
                        <i class="bi bi-x-circle"></i> Закрыть
                    </button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('positionsCount').textContent = this.positions.length;
    }
    
    // Закрытие позиции
    closePosition(positionId) {
        const index = this.positions.findIndex(p => p.id === positionId);
        if (index === -1) return;
        
        const position = this.positions[index];
        
        // Расчет финального PnL
        this.totalPnl += position.pnl;
        
        // Возврат маржи + PnL
        this.balance += position.margin + position.pnl;
        
        // Удаление позиции
        this.positions.splice(index, 1);
        
        // Обновление интерфейса
        this.updatePortfolio();
        this.updatePositions();
        
        this.showAlert(`Позиция закрыта. PnL: $${position.pnl.toFixed(2)}`, 'info');
    }
    
    // Ликвидация позиции
    liquidatePosition(positionId) {
        const index = this.positions.findIndex(p => p.id === positionId);
        if (index === -1) return;
        
        const position = this.positions[index];
        
        // При ликвидации теряется вся маржа
        this.totalPnl -= position.margin;
        
        // Удаление позиции
        this.positions.splice(index, 1);
        
        // Обновление интерфейса
        this.updatePortfolio();
        this.updatePositions();
        
        this.showAlert(`⚠️ Позиция ликвидирована! Потеряно: $${position.margin.toFixed(2)}`, 'warning');
    }
    
    // Обновление портфеля
    updatePortfolio() {
        // Обновление баланса
        document.getElementById('userBalance').textContent = `$${this.balance.toFixed(2)}`;
        document.getElementById('portfolioBalance').textContent = `$${this.balance.toFixed(2)}`;
        
        // Расчет общего PnL
        const totalUnrealizedPnl = this.positions.reduce((sum, pos) => sum + pos.pnl, 0);
        const totalPnl = this.totalPnl + totalUnrealizedPnl;
        
        document.getElementById('totalPnl').textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
        document.getElementById('totalPnl').className = totalPnl >= 0 ? 'profit' : 'loss';
        
        document.getElementById('openPositions').textContent = this.positions.length;
        
        // Расчет винрейта (упрощенно)
        const winRate = this.positions.length > 0 ? 
            (this.positions.filter(p => p.pnl > 0).length / this.positions.length * 100).toFixed(1) : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
    }
    
    // Загрузка рейтинга
    loadLeaderboard() {
        const leaderboardData = [
            { name: 'Трейдер_1', profit: 5240, trades: 42 },
            { name: 'Трейдер_2', profit: 3890, trades: 31 },
            { name: 'Трейдер_3', profit: 2670, trades: 28 },
            { name: 'Трейдер_4', profit: 1890, trades: 23 },
            { name: 'Трейдер_5', profit: 1250, trades: 19 }
        ];
        
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = leaderboardData.map((trader, index) => `
            <div class="list-group-item bg-transparent">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="badge bg-secondary me-2">#${index + 1}</span>
                        <span>${trader.name}</span>
                    </div>
                    <div class="text-end">
                        <div class="profit fw-bold">+$${trader.profit}</div>
                        <small class="text-muted">${trader.trades} сделок</small>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Смена таймфрейма
    changeTimeframe(tf) {
        this.timeframe = tf;
        
        // Обновление кнопок
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === tf.toUpperCase()) {
                btn.classList.add('active');
            }
        });
        
        this.updateChart();
    }
    
    // Показать детали портфеля
    showPortfolioDetails() {
        alert(`Детали портфеля:\n\nБаланс: $${this.balance.toFixed(2)}\nОбщий PnL: $${this.totalPnl.toFixed(2)}\nОткрытых позиций: ${this.positions.length}`);
    }
    
    // Показать модальное окно депозита
    showDepositModal() {
        alert('В веб-версии баланс виртуальный. Для сброса к начальным $2000 обновите страницу.');
    }
    
    // Показать уведомление
    showAlert(message, type = 'info') {
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type];
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Автоудаление через 5 секунд
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Инициализация приложения
const game = new TradingGame();

// Экспорт для использования в HTML
window.selectCoin = (coin) => game.selectCoin(coin);
window.selectTradeType = (type) => game.selectTradeType(type);
window.selectLeverage = (leverage) => game.selectLeverage(leverage);
window.openPosition = () => game.openPosition();
window.confirmTrade = () => game.confirmTrade();
window.changeTimeframe = (tf) => game.changeTimeframe(tf);
window.showPortfolioDetails = () => game.showPortfolioDetails();
window.showDepositModal = () => game.showDepositModal();
window.game = game; // Для доступа к методам из консоли
