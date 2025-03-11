const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
const { world } = engine;

const gameBoard = document.getElementById('game-board');
const startButton = document.getElementById('startButton');
const exitButton = document.getElementById('exitButton');
const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');
const balanceDisplay = document.getElementById('balance');
const betAmountInput = document.getElementById('betAmount');
const decreaseBetButton = document.getElementById('decreaseBet');
const increaseBetButton = document.getElementById('increaseBet');

// Адаптивные размеры
const width = gameBoard.offsetWidth;
const height = gameBoard.offsetHeight;

engine.world.gravity.y = 0.6;

const render = Render.create({
    element: gameBoard,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false,
        background: 'transparent',
    },
});

Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(width / 2, height, width, 10, { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(0, height / 2, 10, height, { isStatic: true, render: { fillStyle: 'transparent' } }),
    Bodies.rectangle(width, height / 2, 10, height, { isStatic: true, render: { fillStyle: 'transparent' } }),
];
World.add(world, walls);

let pins = [];
let balls = [];
let currentRows = 8;
let multipliers = [];
let balance = 1000;

const ballTimers = new WeakMap();

const multipliersByRows = {
    8: [8, 1.5, 0.9, 0.7, 0.6, 0.7, 0.9, 1.5, 8],
    9: [10, 2, 1, 0.7, 0.5, 0.5, 0.7, 1, 2, 10],
    10: [12, 2.5, 1.1, 0.8, 0.6, 0.4, 0.6, 0.8, 1.1, 2.5, 12],
    11: [15, 3, 1.2, 0.9, 0.6, 0.4, 0.4, 0.6, 0.9, 1.2, 3, 15],
    12: [18, 3.5, 1.3, 1, 0.7, 0.5, 0.3, 0.5, 0.7, 1, 1.3, 3.5, 18],
    13: [22, 4, 1.5, 1.1, 0.8, 0.6, 0.4, 0.4, 0.6, 0.8, 1.1, 1.5, 4, 22],
};

function createPins(rows) {
    pins.forEach(pin => World.remove(world, pin));
    pins = [];

    const initialPinsInRow = 3;
    const maxPinsInRow = initialPinsInRow + rows - 1;
    const pinSpacing = (width - 20) / (maxPinsInRow - 1);
    const pinRadius = Math.min(5, pinSpacing / 3);

    for (let row = 0; row < rows; row++) {
        const pinsInRow = initialPinsInRow + row;
        const startX = (width - (pinsInRow - 1) * pinSpacing) / 2;

        for (let col = 0; col < pinsInRow; col++) {
            const x = startX + col * pinSpacing;
            const y = 50 + row * pinSpacing;
            const pin = Bodies.circle(x, y, pinRadius, {
                isStatic: true,
                friction: 0.2,
                render: {
                    fillStyle: '#000000'
                }
            });
            pins.push(pin);
        }
    }
    World.add(world, pins);
}

function createMultipliers(rows) {
    multipliers.forEach(zone => World.remove(world, zone));
    multipliers = [];

    const zoneHeight = height * 0.06;
    const zoneWidth = (width - 20) / multipliersByRows[rows].length;
    const multipliersValues = multipliersByRows[rows];

    for (let i = 0; i < multipliersValues.length; i++) {
        const x = 10 + (i + 0.5) * zoneWidth;
        const y = height - height * 0.2;
        const zone = Bodies.rectangle(x, y, zoneWidth - 5, zoneHeight, {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: getZoneColor(i, multipliersValues.length),
            },
            label: `zone-${i}`,
            multiplier: multipliersValues[i],
        });
        multipliers.push(zone);
    }
    World.add(world, multipliers);
}

function getZoneColor(index, totalZones) {
    if (index === 0 || index === totalZones - 1) {
        return '#FF4444';
    } else if (index === 1 || index === totalZones - 2) {
        return '#FFA500';
    } else {
        return '#FFFF00';
    }
}

function createBall() {
    const ballSize = Math.max(5, 10 - (currentRows - 8));
    const randomOffset = gaussianRandom() * 12;
    const startX = width / 2 + randomOffset;

    const ball = Bodies.circle(startX, 30, ballSize, {
        restitution: 0.5,
        friction: 0.05,
        density: 0.05,
        render: {
            fillStyle: 'red'
        },
        collisionFilter: {
            group: -1
        }
    });

    Body.setAngularVelocity(ball, (Math.random() - 0.5) * 0.1);
    Body.setVelocity(ball, {
        x: (Math.random() - 0.5) * 0.5,
        y: 0
    });

    balls.push(ball);
    ballTimers.set(ball, { startTime: null, lastPosition: { x: ball.position.x, y: ball.position.y } });
    World.add(world, ball);
}

function gaussianRandom() {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0;
}

function updateBalance(multiplier, zoneIndex, totalZones) {
    const bet = parseInt(betAmountInput.value);
    if (isNaN(bet)) {
        alert('Введите корректную ставку!');
        return;
    }

    if (bet > balance) {
        alert('Недостаточно монет для ставки!');
        return;
    }

    if (zoneIndex === 0 || zoneIndex === totalZones - 1) {
        balance += bet;
        balanceDisplay.textContent = Math.round(balance);
        showNotification(`Возврат, давай еще!`);
    } else {
        balance -= bet;
        const winnings = bet * multiplier;
        balance += winnings;
        balanceDisplay.textContent = Math.round(balance);
        showNotification(`Множитель: ${multiplier}`);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2000);
}

startButton.addEventListener('click', () => {
    const bet = parseInt(betAmountInput.value);
    if (isNaN(bet) || bet < 1 || bet > balance) {
        alert('Введите корректную ставку!');
        return;
    }

    createBall();
});

// Обработка клика по кнопке "Exit"
exitButton.addEventListener('click', () => {
    window.location.href = "../index.html"; // Возврат на главную страницу
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentRows = parseInt(button.getAttribute('data-rows'));
        createPins(currentRows);
        createMultipliers(currentRows);
        balls.forEach(ball => World.remove(world, ball));
        balls = [];
    });
});

decreaseBetButton.addEventListener('click', () => {
    let bet = parseInt(betAmountInput.value);
    if (bet > 1) {
        betAmountInput.value = bet - 1;
    }
});

increaseBetButton.addEventListener('click', () => {
    let bet = parseInt(betAmountInput.value);
    if (bet < 1000) {
        betAmountInput.value = bet + 1;
    }
});

Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;

    pairs.forEach((pair) => {
        const ball = pair.bodyA.collisionFilter.group === -1 ? pair.bodyA : pair.bodyB.collisionFilter.group === -1 ? pair.bodyB : null;
        const zone = pair.bodyA.label.startsWith('zone') ? pair.bodyA : pair.bodyB.label.startsWith('zone') ? pair.bodyB : null;
        const pin = pair.bodyA.isStatic && !pair.bodyA.label.startsWith('zone') ? pair.bodyA : pair.bodyB.isStatic && !pair.bodyB.label.startsWith('zone') ? pair.bodyB : null;

        if (ball && zone) {
            const multiplier = zone.multiplier;
            const zoneIndex = parseInt(zone.label.split('-')[1]);
            const totalZones = multipliersByRows[currentRows].length;
            updateBalance(multiplier, zoneIndex, totalZones);
            World.remove(world, ball);
            balls = balls.filter(b => b !== ball);
            ballTimers.delete(ball);
        } else if (ball && pin) {
            pin.render.fillStyle = '#FFFF00';
            setTimeout(() => {
                pin.render.fillStyle = '#000000';
            }, 1000);
        }
    });
});

Events.on(engine, 'collisionActive', (event) => {
    const pairs = event.pairs;

    pairs.forEach((pair) => {
        const ball = pair.bodyA.collisionFilter.group === -1 ? pair.bodyA : pair.bodyB.collisionFilter.group === -1 ? pair.bodyB : null;
        const pin = pair.bodyA.isStatic ? pair.bodyA : pair.bodyB.isStatic ? pair.bodyB : null;

        if (ball && pin) {
            const centerX = width / 2;
            const ballX = ball.position.x;
            const deltaX = centerX - ballX;

            if (Math.abs(deltaX) > 10) {
                const angleAdjustment = deltaX * 0.002;
                Body.setVelocity(ball, {
                    x: ball.velocity.x + angleAdjustment,
                    y: ball.velocity.y
                });
            }
        }
    });
});

Events.on(engine, 'beforeUpdate', () => {
    const currentTime = Date.now();
    balls.forEach((ball, index) => {
        const timerData = ballTimers.get(ball);
        if (!timerData) return;

        const { x: lastX, y: lastY } = timerData.lastPosition;
        const { x: currX, y: currY } = ball.position;

        const distanceMoved = Math.sqrt((currX - lastX) ** 2 + (currY - lastY) ** 2);

        if (distanceMoved < 0.5) {
            if (!timerData.startTime) {
                timerData.startTime = currentTime;
            } else {
                const elapsedTime = (currentTime - timerData.startTime) / 1000;
                if (elapsedTime >= 4) {
                    const bet = parseInt(betAmountInput.value);
                    balance += bet;
                    balanceDisplay.textContent = Math.round(balance);
                    showNotification(`Возврат, давай еще!`);
                    World.remove(world, ball);
                    balls.splice(index, 1);
                    ballTimers.delete(ball);
                }
            }
        } else {
            timerData.startTime = null;
            timerData.lastPosition = { x: currX, y: currY };
        }
    });
});

createPins(currentRows);
createMultipliers(currentRows);
difficultyButtons[0].classList.add('active');

Events.on(render, 'afterRender', () => {
    const context = render.context;
    context.font = `${Math.min(width * 0.04, 12)}px Arial`;
    context.fillStyle = '#000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    multipliers.forEach(zone => {
        const { x, y } = zone.position;
        const multiplier = zone.multiplier;
        context.fillText(multiplier.toString(), x, y);
    });
});