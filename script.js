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
displayUserInfo(queryParams.username, queryParams.balance);

// Логика для рекламного слайдера
let currentSlide = 0;
const slides = document.querySelectorAll('.ad-image');
const dots = document.querySelectorAll('.ad-dot');
const slider = document.querySelector('.ad-slider');
const totalSlides = slides.length;

// Функция для переключения слайда
function showSlide(index) {
    if (index < 0) {
        index = totalSlides - 1;
    } else if (index >= totalSlides) {
        index = 0;
    }
    slider.style.transform = `translateX(-${index * 100}%)`;
    currentSlide = index;
    updateDots();
}

// Функция для обновления точек навигации
function updateDots() {
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

// Автоматическая прокрутка каждые 4 секунды
let autoSlideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
}, 4000);

// Обработчики для точек навигации
dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
        clearInterval(autoSlideInterval);
        showSlide(i);
        autoSlideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 4000);
    });
});

// Обработчики для кнопок выхода и модального окна
document.getElementById("exitButton1Container").addEventListener("click", () => {
    window.location.href = `slot2/index.html?username=${queryParams.username}&balance=${queryParams.balance}&telegram_id=${queryParams.telegram_id}`;
});

document.getElementById("exitButton2Container").addEventListener("click", () => {
    window.location.href = `mines/index.html?username=${queryParams.username}&balance=${queryParams.balance}&telegram_id=${queryParams.telegram_id}`;
});

document.getElementById("exitButton3Container").addEventListener("click", () => {
    window.location.href = `aviator/index.html?username=${queryParams.username}&balance=${queryParams.balance}&telegram_id=${queryParams.telegram_id}`;
});

document.getElementById("exitButton4Container").addEventListener("click", () => {
    window.location.href = `ochko/index.html?username=${queryParams.username}&balance=${queryParams.balance}&telegram_id=${queryParams.telegram_id}`;
});

document.getElementById("exitButton5Container").addEventListener("click", () => {
    window.location.href = `ruletka/index.html?username=${queryParams.username}&balance=${queryParams.balance}&telegram_id=${queryParams.telegram_id}`;
});

document.getElementById("exitButton6Container").addEventListener("click", () => {
    window.location.href = `plinco/index.html?username=${queryParams.username}&balance=${queryParams.balance}&telegram_id=${queryParams.telegram_id}`;
});

document.getElementById("profileButton").addEventListener("click", () => {
    document.getElementById("modal").style.display = "block";
});

document.getElementsByClassName("close-button")[0].addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target == document.getElementById("modal")) {
        document.getElementById("modal").style.display = "none";
    }
});