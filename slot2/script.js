// Функция для получения параметров из URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        username: params.get('username'),
        balance: params.get('balance'),
        telegram_id: params.get('telegram_id')
    };
}

// Функция для отображения информации о пользователе
function displayUserInfo(username, balance) {
    document.getElementById('username').innerText = `Никнейм: ${username}`;
    document.getElementById('balance').innerText = `Баланс: ${balance}`;
}

// Получаем параметры из URL и отображаем информацию о пользователе
const queryParams = getQueryParams();
let userBalance = parseInt(queryParams.balance) || 0;
displayUserInfo(queryParams.username, userBalance);

const ICONS = [
    'apple', 'apricot', 'banana', 'big_win', 'cherry', 'grapes', 'lemon', 'lucky_seven', 'orange', 'pear', 'strawberry', 'watermelon',
];

const WINNING_COMBINATIONS = {
    'apple': 2,
    'apricot': 3,
    'banana': 4,
    'cherry': 2,
    'grapes': 2,
    'lemon': 3,
    'orange': 2,
    'pear': 2,
    'strawberry': 5,
    'watermelon': 4,
    'lucky_seven': 7,
    'big_win': 10
};

/**
 * @type {number} The minimum spin time in seconds
 */
const BASE_SPINNING_DURATION = 2.7;

/**
 * @type {number} The additional duration to the base duration for each row (in seconds).
 * It makes the typical effect that the first reel ends, then the second, and so on...
 */
const COLUMN_SPINNING_DURATION = 0.3;

var cols;

window.addEventListener('DOMContentLoaded', function(event) {
    cols = document.querySelectorAll('.col');
    setInitialItems();
    fetchUserData(); // Fetch initial user data from the server

    // Реализация кнопки выхода
    document.getElementById("exitButton").addEventListener("click", () => {
        window.location.href = "../index.html"; // Возврат на главную страницу
    });

    // Обновление текста бегущей строки
    updateMarqueeText();
    setInterval(updateMarqueeText, 10000); // Обновляем текст каждые 10 секунд
});

function setInitialItems() {
    let baseItemAmount = 40;

    for (let i = 0; i < cols.length; ++i) {
        let col = cols[i];
        let amountOfItems = baseItemAmount + (i * 3); // Increment the amount for each column
        let elms = '';
        let firstThreeElms = '';

        for (let x = 0; x < amountOfItems; x++) {
            let icon = getRandomIcon();
            let item = '<div class="icon" data-item="' + icon + '"><img src="items/' + icon + '.png"></div>';
            elms += item;

            if (x < 3) firstThreeElms += item; // Backup the first three items because the last three must be the same
        }
        col.innerHTML = elms + firstThreeElms;
    }
}

/**
 * Called when the start-button is pressed.
 *
 * @param elem The button itself
 */
function spin(elem) {
    const betAmount = parseInt(document.getElementById('bet-amount').value) || 0;

    if (betAmount <= 0) {
        alert('Сумма ставки должна быть больше нуля.');
        return;
    }

    if (betAmount > userBalance) {
        alert('Недостаточно средств на балансе.');
        return;
    }

    let duration = BASE_SPINNING_DURATION + randomDuration();

    for (let col of cols) { // set the animation duration for each column
        duration += COLUMN_SPINNING_DURATION + randomDuration();
        col.style.animationDuration = duration + "s";
    }

    // disable the start-button
    elem.setAttribute('disabled', true);

    // set the spinning class so the css animation starts to play
    document.getElementById('container').classList.add('spinning');

    // Remove winning icon animations
    removeWinningIconAnimations();

    // set the result delayed
    window.setTimeout(() => setResult(betAmount), BASE_SPINNING_DURATION * 1000 / 2);

    window.setTimeout(function () {
        // after the spinning is done, remove the class and enable the button again
        document.getElementById('container').classList.remove('spinning');
        elem.removeAttribute('disabled');

        // deduct the bet amount from the balance
        userBalance -= betAmount;
        updateBalanceOnServer(betAmount, false);
    }.bind(elem), duration * 1000);
}

/**
 * Sets the result items at the beginning and the end of the columns
 */
function setResult(betAmount) {
    let results = [];
    for (let col of cols) {
        // generate 3 random items
        let result = [
            getRandomIcon(),
            getRandomIcon(),
            getRandomIcon()
        ];
        results.push(result);

        let icons = col.querySelectorAll('.icon img');
        // replace the first and last three items of each column with the generated items
        for (let x = 0; x < 3; x++) {
            icons[x].setAttribute('src', 'items/' + result[x] + '.png');
            icons[(icons.length - 3) + x].setAttribute('src', 'items/' + result[x] + '.png');
        }
    }

    // Check for winning combinations
    checkWinningCombinations(results, betAmount);
}

function getRandomIcon() {
    return ICONS[Math.floor(Math.random() * ICONS.length)];
}

/**
 * @returns {number} 0.00 to 0.09 inclusive
 */
function randomDuration() {
    return Math.floor(Math.random() * 10) / 100;
}

// Функция для быстрого ввода суммы ставки
function quickBet(amount) {
    const betAmountInput = document.getElementById('bet-amount');
    const currentValue = parseInt(betAmountInput.value) || 0;
    const newValue = currentValue + amount;

    if (newValue < 0) {
        alert('Сумма ставки не может быть отрицательной.');
        return;
    }

    if (newValue > userBalance) {
        alert('Недостаточно средств на балансе.');
        return;
    }

    betAmountInput.value = newValue;
}

// Функция для обновления баланса на сервере
function updateBalanceOnServer(betAmount, isWin = false) {
    const telegramId = queryParams.telegram_id; // Use the actual Telegram ID of the user
    console.log(`Sending request to update balance for user ${telegramId} with bet amount ${betAmount}`);
    fetch(`/api/update_balance/${telegramId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ betAmount: isWin ? betAmount : -betAmount })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from server:', data);
        if (data.success) {
            userBalance = data.newBalance;
            displayUserInfo(queryParams.username, userBalance);
        } else {
            alert('Ошибка при обновлении баланса.');
        }
    })
    .catch(error => {
        console.error('Error updating balance:', error);
    });
}

// Функция для получения данных пользователя с сервера
function fetchUserData() {
    const telegramId = queryParams.telegram_id; // Use the actual Telegram ID of the user
    fetch(`/api/user/${telegramId}`)
        .then(response => response.json())
        .then(data => {
            if (data.nickname && data.balance) {
                userBalance = data.balance;
                displayUserInfo(data.nickname, userBalance);
            } else {
                console.error('Invalid data format:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

// Функция для проверки выигрышных комбинаций
function checkWinningCombinations(results, betAmount) {
    let totalWinAmount = 0;

    // Check middle row
    if (results[0][1] === results[1][1] && results[1][1] === results[2][1]) {
        totalWinAmount += betAmount * WINNING_COMBINATIONS[results[0][1]];
        animateWinningIcons(results[0][1]);
    }

    // Check diagonals
    if (results[0][0] === results[1][1] && results[1][1] === results[2][2]) {
        totalWinAmount += betAmount * WINNING_COMBINATIONS[results[0][0]];
        animateWinningIcons(results[0][0]);
    }
    if (results[0][2] === results[1][1] && results[1][1] === results[2][0]) {
        totalWinAmount += betAmount * WINNING_COMBINATIONS[results[0][2]];
        animateWinningIcons(results[0][2]);
    }

    // Check for any icon appearing 3 or more times
    let iconCount = {};
    results.flat().forEach(icon => {
        iconCount[icon] = (iconCount[icon] || 0) + 1;
    });

    for (let icon in iconCount) {
        if (iconCount[icon] >= 3) {
            totalWinAmount += betAmount * 1.5; // x1.5 for any 3 or more matches
            animateWinningIcons(icon);
        }
    }

    if (totalWinAmount > 0) {
        showWinningNotification(totalWinAmount);
    }
}

// Функция для отображения уведомления о выигрыше
function showWinningNotification(winAmount) {
    userBalance += winAmount;
    displayUserInfo(queryParams.username, userBalance);

    const notification = document.createElement('div');
    notification.className = 'winning-notification';
    notification.innerText = `Вы выиграли ${winAmount}!`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2000);

    updateBalanceOnServer(winAmount, true);
}

// Функция для обновления текста бегущей строки
function updateMarqueeText() {
    const playerId = Math.floor(10000 + Math.random() * 90000);
    const winAmount = Math.floor(3 + Math.random() * 96);
    document.getElementById('marquee-text').innerText = `Player ${playerId} win ${winAmount}$`;
}

// Функция для анимации выигрышных иконок
function animateWinningIcons(icon) {
    const icons = document.querySelectorAll('.icon img');
    icons.forEach(img => {
        if (img.src.includes(icon)) {
            img.parentElement.classList.add('winning-icon');
        }
    });
}

// Функция для удаления анимации выигрышных иконок
function removeWinningIconAnimations() {
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => {
        icon.classList.remove('winning-icon');
    });
}