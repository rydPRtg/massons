const headsButton = document.getElementById('heads');
const tailsButton = document.getElementById('tails');
const spinButton = document.getElementById('spin');
const coin = document.getElementById('coin');
const outcomeDisplay = document.getElementById('outcome');

let userChoice = null;

// Обработчики выбора "Heads" или "Tails"
headsButton.addEventListener('click', () => handleChoice('heads'));
tailsButton.addEventListener('click', () => handleChoice('tails'));

// Обработка выбора игрока
function handleChoice(choice) {
    userChoice = choice;
    outcomeDisplay.textContent = `You chose ${choice.toUpperCase()}. Press Spin!`;
    spinButton.disabled = false;
}

// Обработка вращения монеты
spinButton.addEventListener('click', () => {
    spinButton.disabled = true;

    // Запустить анимацию вращения монеты
    coin.style.animation = 'spin 3s ease-in-out'; // Время анимации увеличено до 3 секунд

    // После завершения анимации показать результат
    setTimeout(() => {
        coin.style.animation = 'none';

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        coin.style.backgroundImage = result === 'heads'
            ? "url('heads.png')"
            : "url('tails.png')";

        // Вывод результата
        outcomeDisplay.textContent =
            userChoice === result
                ? `You WON! It was ${result.toUpperCase()}.`
                : `You LOST! It was ${result.toUpperCase()}.`;

        // Включить кнопку "Spin" для новой попытки
        spinButton.disabled = false;
    }, 3000); // Ожидание завершения анимации (3 секунды)
});

