const ICONS = [
    'apple', 'apricot', 'banana', 'big_win', 'cherry', 'grapes', 'lemon', 'lucky_seven', 'orange', 'pear', 'strawberry', 'watermelon',
];

// Определяем наборы и их множители
const WINNING_COMBINATIONS = {
    set1: { icons: ['apple', 'apricot', 'banana'], multiplier: 1.94 },
    set2: { icons: ['big_win', 'cherry', 'grapes'], multiplier: 2.92 },
    set3: { icons: ['lemon', 'orange', 'pear'], multiplier: 2.5 },
    set4: { icons: ['lucky_seven', 'strawberry', 'watermelon'], multiplier: 2.8 }
};

/**
 * @type {number} The minimum spin time in seconds
 */
const BASE_SPINNING_DURATION = 2.7;

/**
 * @type {number} The additional duration to the base duration for each row (in seconds).
 */
const COLUMN_SPINNING_DURATION = 0.3;

let cols;
let balance = 10000; // Начальный баланс
let bet = 1; // Начальная ставка по умолчанию
const MIN_BET = 1; // Минимальная ставка
const MAX_BET = 450; // Максимальная ставка

window.addEventListener('DOMContentLoaded', function(event) {
    cols = document.querySelectorAll('.col');
    setInitialItems();
    updateBalanceDisplay();
    setupBetControls();
    startStatsUpdates();
});

function setInitialItems() {
    let baseItemAmount = 40;

    for (let i = 0; i < cols.length; ++i) {
        let col = cols[i];
        let amountOfItems = baseItemAmount + (i * 3);
        updateColumn(col, amountOfItems);
    }
}

/**
 * Обновляем содержимое колонки новыми случайными иконками
 */
function updateColumn(col, amountOfItems) {
    let elms = '';
    let firstThreeElms = '';

    for (let x = 0; x < amountOfItems; x++) {
        let icon = getRandomIcon();
        let item = '<div class="icon" data-item="' + icon + '"><img src="items/' + icon + '.png"></div>';
        elms += item;

        if (x < 3) firstThreeElms += item;
    }
    col.innerHTML = elms + firstThreeElms;
}

/**
 * Настраиваем управление ставкой
 */
function setupBetControls() {
    const betValue = document.querySelector('.bet-value');
    betValue.textContent = bet; // Устанавливаем начальную ставку

    document.querySelector('.minus').addEventListener('click', () => {
        if (bet > MIN_BET) bet -= 1;
        betValue.textContent = bet;
    });

    document.querySelector('.plus').addEventListener('click', () => {
        if (bet < MAX_BET) bet += 1;
        betValue.textContent = bet;
    });

    document.querySelector('.min').addEventListener('click', () => {
        bet = MIN_BET;
        betValue.textContent = bet;
    });

    document.querySelector('.max').addEventListener('click', () => {
        bet = MAX_BET;
        betValue.textContent = bet;
    });
}

/**
 * Обновляем отображение баланса
 */
function updateBalanceDisplay() {
    document.querySelector('.balance-value').textContent = balance.toFixed(2);
}

/**
 * Показываем всплывающее уведомление о выигрыше
 */
function showWinMessage(amount) {
    const winMessage = document.querySelector('.win-message');
    winMessage.textContent = `Вы выиграли: ${amount.toFixed(2)}!`;
    winMessage.style.display = 'block';
    winMessage.classList.add('show');
    setTimeout(() => {
        winMessage.classList.remove('show');
        setTimeout(() => {
            winMessage.style.display = 'none';
        }, 500); // Даём время для завершения анимации исчезновения
    }, 3000); // Уведомление отображается 3 секунды
}

/**
 * Показываем выигрышные линии и подсвечиваем иконки
 */
function showWinEffects(winningLines) {
    const svg = document.querySelector('.win-lines');
    svg.innerHTML = ''; // Очищаем предыдущие линии

    // Добавляем градиент для линии
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'winGradient');
    gradient.innerHTML = `
        <stop offset="0%" style="stop-color:#ffeb3b;" />
        <stop offset="100%" style="stop-color:#ff5722;" />
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);

    const lineCoords = {
        '0-1-2': { x1: 10, y1: 16.67, x2: 90, y2: 16.67 },
        '3-4-5': { x1: 10, y1: 50, x2: 90, y2: 50 },
        '6-7-8': { x1: 10, y1: 83.33, x2: 90, y2: 83.33 },
        '0-4-8': { x1: 10, y1: 10, x2: 90, y2: 90 },
        '6-4-2': { x1: 10, y1: 90, x2: 90, y2: 10 },
        '0-3-6': { x1: 20, y1: 10, x2: 20, y2: 90 },
        '1-4-7': { x1: 50, y1: 10, x2: 50, y2: 90 },
        '2-5-8': { x1: 80, y1: 10, x2: 80, y2: 90 }
    };

    winningLines.forEach(line => {
        line.forEach(index => {
            const colIndex = Math.floor(index / 3);
            const rowIndex = index % 3;
            const icon = cols[colIndex].querySelectorAll('.icon')[rowIndex];
            icon.classList.add('winning');
        });

        const coords = lineCoords[`${line[0]}-${line[1]}-${line[2]}`];
        if (coords) {
            const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineElement.setAttribute('x1', `${coords.x1}%`);
            lineElement.setAttribute('y1', `${coords.y1}%`);
            lineElement.setAttribute('x2', `${coords.x2}%`);
            lineElement.setAttribute('y2', `${coords.y2}%`);
            lineElement.classList.add('show');
            svg.appendChild(lineElement);
        }
    });

    setTimeout(() => {
        svg.querySelectorAll('line').forEach(line => line.classList.remove('show'));
        document.querySelectorAll('.icon.winning').forEach(icon => icon.classList.remove('winning'));
    }, 3000);
}

/**
 * Called when the start-button is pressed.
 * @param elem The button itself
 */
function spin(elem) {
    if (balance < bet) {
        alert('Недостаточно баланса!');
        elem.removeAttribute('disabled');
        return;
    }

    let baseItemAmount = 40;
    for (let i = 0; i < cols.length; ++i) {
        let col = cols[i];
        let amountOfItems = baseItemAmount + (i * 3);
        updateColumn(col, amountOfItems);
    }

    let duration = BASE_SPINNING_DURATION + randomDuration();

    for (let col of cols) {
        duration += COLUMN_SPINNING_DURATION + randomDuration();
        col.style.animationDuration = duration + "s";
    }

    elem.setAttribute('disabled', true);
    document.getElementById('container').classList.add('spinning');

    balance -= bet;
    updateBalanceDisplay();

    window.setTimeout(setResult, BASE_SPINNING_DURATION * 1000 / 2);
    window.setTimeout(function () {
        document.getElementById('container').classList.remove('spinning');
        elem.removeAttribute('disabled');
    }.bind(elem), duration * 1000);
}

/**
 * Sets the result items and checks for winning combinations
 */
function setResult() {
    const colsArray = Array.from(cols);
    const results = colsArray.map(col => {
        const icons = col.querySelectorAll('.icon img');
        return [
            icons[0].getAttribute('src').replace('items/', '').replace('.png', ''),
            icons[1].getAttribute('src').replace('items/', '').replace('.png', ''),
            icons[2].getAttribute('src').replace('items/', '').replace('.png', '')
        ];
    });

    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 4, 8], [6, 4, 2],
        [0, 3, 6], [1, 4, 7], [2, 5, 8]
    ];

    let totalWinAmount = 0;
    const winningLines = [];

    for (let line of lines) {
        const lineIcons = [
            results[0][line[0] % 3],
            results[1][line[1] % 3],
            results[2][line[2] % 3]
        ];

        for (let set in WINNING_COMBINATIONS) {
            const { icons, multiplier } = WINNING_COMBINATIONS[set];
            const isWinning = lineIcons.every(icon => icons.includes(icon));

            const isVertical = line[0] === 0 && line[1] === 3 && line[2] === 6 ||
                              line[0] === 1 && line[1] === 4 && line[2] === 7 ||
                              line[0] === 2 && line[1] === 5 && line[2] === 8;

            if (isWinning) {
                const winMultiplier = isVertical ? 1.98 : multiplier;
                const winAmount = bet * winMultiplier;
                totalWinAmount += winAmount;
                winningLines.push(line);
                break;
            }
        }
    }

    if (totalWinAmount > 0) {
        balance += totalWinAmount;
        updateBalanceDisplay();
        showWinMessage(totalWinAmount);
        showWinEffects(winningLines);
    }
}

function getRandomIcon() {
    return ICONS[Math.floor(Math.random() * ICONS.length)];
}

function randomDuration() {
    return Math.floor(Math.random() * 10) / 100;
}

/**
 * Запускает обновление статистики
 */
function startStatsUpdates() {
    const onlinePlayers = document.querySelector('.online-players');
    const lastWin = document.querySelector('.last-win');

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function updateOnlinePlayers() {
        const newValue = getRandomNumber(89, 140);
        onlinePlayers.style.opacity = '0'; // Начинаем с невидимости для плавности
        setTimeout(() => {
            onlinePlayers.textContent = newValue;
            onlinePlayers.style.opacity = '1'; // Появляемся с анимацией
        }, 300); // Задержка для синхронизации с анимацией
    }

    function updateLastWin() {
        const newValue = getRandomNumber(15, 180);
        lastWin.style.opacity = '0';
        setTimeout(() => {
            lastWin.textContent = newValue;
            lastWin.style.opacity = '1';
        }, 300);
    }

    updateOnlinePlayers();
    updateLastWin();
    setInterval(updateOnlinePlayers, 60 * 1000); // Каждые 60 секунд
    setInterval(updateLastWin, 20 * 1000); // Каждые 20 секунд
}