const grid = document.getElementById('grid');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const exitButton = document.getElementById('exit');
const multiplierDisplay = document.getElementById('multiplier');
const minesCountDisplay = document.getElementById('mines-count');
const minesButtons = document.querySelectorAll('.mines-button');
const betAmountInput = document.getElementById('bet-amount');
const notification = document.getElementById('notification');

const gridSize = 5; // Размер сетки (5x5)
let mines = [];
let score = 0;
let multiplier = 1.0; // Начальный множитель
let mineChance = 0.2; // Шанс на мину (20%)
let gameStarted = false;
let userBalance = 0;
let betAmount = 0;
let gameInitialized = false; // Флаг для проверки, была ли инициализирована игра

// Функция для получения параметров из URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        telegram_id: params.get('telegram_id')
    };
}

// Функция для отображения информации о пользователе
function displayUserInfo(username, balance) {
    document.getElementById('username').innerText = `Никнейм: ${username}`;
    document.getElementById('balance').innerText = `Баланс: ${balance}`;
    userBalance = balance;
}

// Получаем параметры из URL
const queryParams = getQueryParams();
const telegramId = queryParams.telegram_id;

// Временные данные пользователя для тестирования
const tempUserData = {
    username: 'TestUser',
    balance: 1000
};

// Функция для получения данных пользователя с сервера
async function fetchUserData() {
    try {
        const response = await fetch(`/api/user/${telegramId}`);
        const data = await response.json();
        console.log('User data:', data); // Добавьте эту строку для проверки
        if (data.username && data.balance) {
            displayUserInfo(data.username, data.balance);
        } else {
            console.error('Invalid data format:', data);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Используем временные данные, если API недоступно
        displayUserInfo(tempUserData.username, tempUserData.balance);
    }
}

// Инициализация игры
function initGame() {
    grid.innerHTML = '';
    mines = [];
    score = 0;
    multiplier = 1.0;
    updateUI();
    generateGrid();
    gameStarted = true;
    gameInitialized = true; // Устанавливаем флаг, что игра инициализирована
}

// Обновление интерфейса
function updateUI() {
    multiplierDisplay.textContent = `Multiplier: ${multiplier.toFixed(2)}`;
}

// Генерация сетки с минами
function generateGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;

        // Случайное размещение мин
        if (Math.random() < mineChance) {
            mines.push(i);
        }

        cell.addEventListener('click', () => handleClick(cell));
        grid.appendChild(cell);
    }
}

// Обработка кликов по ячейкам
function handleClick(cell) {
    if (!gameStarted) {
        if (!gameInitialized) {
            showNotification('Сделайте ставку и нажмите Start');
        } else {
            showNotification('Нажмите Start, чтобы начать игру');
        }
        return;
    }

    const index = parseInt(cell.dataset.index);

    // Если ячейка уже открыта, ничего не делаем
    if (cell.classList.contains('revealed')) return;

    // Если попали на мину
    if (mines.includes(index)) {
        cell.classList.add('mine');
        showNotification('Вы проиграли! Попробуйте еще раз.');
        gameStarted = false;
    } else {
        // Если ячейка безопасная
        cell.classList.add('revealed');
        score++;
        updateMultiplier();
        updateUI();
    }
}

// Обновление множителя
function updateMultiplier() {
    const totalCells = gridSize * gridSize;
    const remainingSafeCells = totalCells - score - mines.length;
    multiplier = remainingSafeCells > 0 ? totalCells / remainingSafeCells : multiplier;
}

// Обработка выбора уровня сложности
minesButtons.forEach(button => {
    button.addEventListener('click', () => {
        const minesCount = parseInt(button.dataset.mines);
        minesCountDisplay.textContent = minesCount;
        mineChance = minesCount / 10;
    });
});

// Функция для быстрого ввода суммы ставки
function quickBet(amount) {
    const currentValue = parseInt(betAmountInput.value) || 0;
    const newValue = currentValue + amount;

    betAmountInput.value = newValue;
    betAmount = newValue;
}

// Обработка клика по кнопке "Start"
startButton.addEventListener('click', () => {
    betAmount = parseInt(betAmountInput.value) || 0;

    if (betAmount <= 0) {
        showNotification('Укажите сумму вашей ставки.');
        return;
    }

    if (betAmount > userBalance) {
        alert('Недостаточно средств на балансе.');
        return;
    }

    userBalance -= betAmount;
    displayUserInfo(queryParams.username, userBalance);

    if (gameStarted) {
        initGame();
    } else {
        initGame();
    }
});

// Обработка клика по кнопке "Stop"
stopButton.addEventListener('click', () => {
    if (!gameStarted) return;

    const winAmount = Math.floor(betAmount * multiplier);
    userBalance += winAmount;
    displayUserInfo(queryParams.username, userBalance);
    showNotification(`Вы выиграли ${winAmount}!`);
    gameStarted = false;
});

// Обработка клика по кнопке "Exit"
exitButton.addEventListener('click', () => {
    window.location.href = "../index.html"; // Возврат на главную страницу
});

// Функция для отображения уведомления
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Запуск игры
fetchUserData().then(() => {
    // Инициализация игры без возможности кликать по полю
    grid.innerHTML = '';
    mines = [];
    score = 0;
    multiplier = 1.0;
    updateUI();
    generateGrid();
    gameStarted = false;
    gameInitialized = false; // Устанавливаем флаг, что игра не инициализирована
});
