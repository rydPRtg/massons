document.addEventListener("DOMContentLoaded", () => {
    const coin = document.getElementById("coin");
    const headsBtn = document.getElementById("headsBtn");
    const tailsBtn = document.getElementById("tailsBtn");
    const possibleWin = document.getElementById("possibleWin");
    const multiplier = document.getElementById("multiplier");
    const betAmount = document.querySelector(".bet-amount span");
    const decreaseBetBtn = document.getElementById("decreaseBet");
    const increaseBetBtn = document.getElementById("increaseBet");
    const halfBetBtn = document.getElementById("halfBet");
    const doubleBetBtn = document.getElementById("doubleBet");

    let bet = 0.2;
    const multiplierValue = 1.96;

    function updatePossibleWin() {
        const win = (bet * multiplierValue).toFixed(2);
        possibleWin.textContent = `${win} $`;
        betAmount.textContent = `${bet.toFixed(2)} $`;
    }

    multiplier.textContent = `x${multiplierValue}`;
    updatePossibleWin();

    increaseBetBtn.addEventListener("click", () => {
        bet += 0.1;
        updatePossibleWin();
    });

    decreaseBetBtn.addEventListener("click", () => {
        if (bet > 0.1) {
            bet -= 0.1;
            updatePossibleWin();
        }
    });

    halfBetBtn.addEventListener("click", () => {
        if (bet > 0.1) {
            bet /= 2;
            updatePossibleWin();
        }
    });

    doubleBetBtn.addEventListener("click", () => {
        bet *= 2;
        updatePossibleWin();
    });

    function flipCoin(userChoice) {
        headsBtn.disabled = true;
        tailsBtn.disabled = true;

        // Генерируем случайный результат
        const result = Math.floor(Math.random() * 2);
        const isHeads = result === 0;
        console.log(`Случайное число: ${Math.random().toFixed(2)}`);
        console.log(`Результат: ${isHeads ? "Орёл (coin-heads.png)" : "Решка (coin-tails.png)"}`);

        // Удаляем старые классы
        coin.classList.remove("animate", "animate-tails", "animating", "show-heads", "show-tails");

        // Устанавливаем начальное состояние (показываем орла перед анимацией)
        coin.classList.add("show-heads");

        // Добавляем класс для анимации
        coin.classList.add("animating");

        // Запускаем анимацию
        setTimeout(() => {
            coin.classList.add(isHeads ? "animate" : "animate-tails");
        }, 10);

        // После анимации показываем правильную сторону
        setTimeout(() => {
            coin.classList.remove("animate", "animate-tails", "animating");
            coin.classList.add(isHeads ? "show-heads" : "show-tails");
            headsBtn.disabled = false;
            tailsBtn.disabled = false;
        }, 2000);
    }

    headsBtn.addEventListener("click", () => flipCoin("heads"));
    tailsBtn.addEventListener("click", () => flipCoin("tails"));
});