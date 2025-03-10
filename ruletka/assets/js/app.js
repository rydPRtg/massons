let bankValue = 1000;
let currentBet = 0;
let wager = 5;
let lastWager = 0;
let bet = [];
let numbersBet = [];
let previousNumbers = [];

let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

let container = document.createElement('div');
container.setAttribute('id', 'container');
document.body.append(container);

startGame();

let wheel, ballTrack;

function resetGame() {
    bankValue = 1000;
    currentBet = 0;
    wager = 5;
    bet = [];
    numbersBet = [];
    previousNumbers = [];
    document.getElementById('betting_board').remove();
    if (document.getElementById('notification')) document.getElementById('notification').remove();
    buildBettingBoard();
}

function startGame() {
    buildWheel(); // Создаем рулетку, но она скрыта
    buildBettingBoard();
}

function gameOver() {
    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    let nSpan = document.createElement('span');
    nSpan.setAttribute('class', 'nSpan');
    nSpan.innerText = 'Bankrupt';
    notification.append(nSpan);

    let nBtn = document.createElement('div');
    nBtn.setAttribute('class', 'nBtn');
    nBtn.innerText = 'Play again';
    nBtn.onclick = function () {
        resetGame();
    };
    notification.append(nBtn);
    container.prepend(notification);
}

function buildWheel() {
    wheel = document.createElement('div');
    wheel.setAttribute('class', 'wheel');

    let outerRim = document.createElement('div');
    outerRim.setAttribute('class', 'outerRim');
    wheel.append(outerRim);

    let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    for (let i = 0; i < numbers.length; i++) {
        let a = i + 1;
        let spanClass = (numbers[i] < 10) ? 'single' : 'double';
        let sect = document.createElement('div');
        sect.setAttribute('id', 'sect' + a);
        sect.setAttribute('class', 'sect');
        let span = document.createElement('span');
        span.setAttribute('class', spanClass);
        span.innerText = numbers[i];
        sect.append(span);
        let block = document.createElement('div');
        block.setAttribute('class', 'block');
        sect.append(block);
        wheel.append(sect);
    }

    let pocketsRim = document.createElement('div');
    pocketsRim.setAttribute('class', 'pocketsRim');
    wheel.append(pocketsRim);

    ballTrack = document.createElement('div');
    ballTrack.setAttribute('class', 'ballTrack');
    let ball = document.createElement('div');
    ball.setAttribute('class', 'ball');
    ballTrack.append(ball);
    wheel.append(ballTrack);

    let pockets = document.createElement('div');
    pockets.setAttribute('class', 'pockets');
    wheel.append(pockets);

    let cone = document.createElement('div');
    cone.setAttribute('class', 'cone');
    wheel.append(cone);

    let turret = document.createElement('div');
    turret.setAttribute('class', 'turret');
    wheel.append(turret);

    let turretHandle = document.createElement('div');
    turretHandle.setAttribute('class', 'turretHandle');
    let thendOne = document.createElement('div');
    thendOne.setAttribute('class', 'thendOne');
    turretHandle.append(thendOne);
    let thendTwo = document.createElement('div');
    thendTwo.setAttribute('class', 'thendTwo');
    turretHandle.append(thendTwo);
    wheel.append(turretHandle);

    container.append(wheel); // Рулетка добавлена, но скрыта
}

function buildBettingBoard() {
    let bettingBoard = document.createElement('div');
    bettingBoard.setAttribute('id', 'betting_board');

    let wl = document.createElement('div');
    wl.setAttribute('class', 'winning_lines');

    for (let c = 1; c <= 4; c++) {
        let wlttb = document.createElement('div');
        wlttb.setAttribute('id', 'wlttb_' + (c === 1 ? 'top' : c - 1));
        wlttb.setAttribute('class', 'wlttb');
        for (let i = 0; i < 11; i++) {
            let ttbbetblock = document.createElement('div');
            ttbbetblock.setAttribute('class', 'ttbbetblock');
            let j = i;
            let numA = (1 + (3 * j));
            let numB = (2 + (3 * j));
            let numC = (3 + (3 * j));
            let numD = (c === 4 ? numA : (4 + (3 * j)));
            let numE = (c === 4 ? numB : (5 + (3 * j)));
            let numF = (c === 4 ? numC : (6 + (3 * j)));
            let num = c === 4 ? `${numA}, ${numB}, ${numC}` : `${numA}, ${numB}, ${numC}, ${numD}, ${numE}, ${numF}`;
            let objType = c === 4 ? 'street' : 'double_street';
            let odds = c === 4 ? 11 : 5;
            ttbbetblock.onclick = function () {
                setBet(this, num, objType, odds);
            };
            ttbbetblock.oncontextmenu = function (e) {
                e.preventDefault();
                removeBet(this, num, objType, odds);
            };
            wlttb.append(ttbbetblock);
        }
        wl.append(wlttb);
    }

    for (let c = 1; c < 12; c++) {
        let wlrtl = document.createElement('div');
        wlrtl.setAttribute('id', 'wlrtl_' + c);
        wlrtl.setAttribute('class', 'wlrtl');
        for (let i = 1; i < 4; i++) {
            let rtlbb = document.createElement('div');
            rtlbb.setAttribute('class', 'rtlbb' + i);
            let numA = (3 + (3 * (c - 1))) - (i - 1);
            let numB = (6 + (3 * (c - 1))) - (i - 1);
            let num = numA + ', ' + numB;
            rtlbb.onclick = function () {
                setBet(this, num, 'split', 17);
            };
            rtlbb.oncontextmenu = function (e) {
                e.preventDefault();
                removeBet(this, num, 'split', 17);
            };
            wlrtl.append(rtlbb);
        }
        wl.append(wlrtl);
    }

    for (let c = 1; c < 3; c++) {
        let wlcb = document.createElement('div');
        wlcb.setAttribute('id', 'wlcb_' + c);
        wlcb.setAttribute('class', 'wlcb');
        for (let i = 1; i < 12; i++) {
            let count = (c === 1) ? i : i + 11;
            let cbbb = document.createElement('div');
            cbbb.setAttribute('id', 'cbbb_' + count);
            cbbb.setAttribute('class', 'cbbb');
            let numA = '2';
            let numB = '3';
            let numC = '5';
            let numD = '6';
            let num = (count >= 1 && count < 12) ? `${parseInt(numA) + ((count - 1) * 3)}, ${parseInt(numB) + ((count - 1) * 3)}, ${parseInt(numC) + ((count - 1) * 3)}, ${parseInt(numD) + ((count - 1) * 3)}` : `${(parseInt(numA) - 1) + ((count - 12) * 3)}, ${(parseInt(numB) - 1) + ((count - 12) * 3)}, ${(parseInt(numC) - 1) + ((count - 12) * 3)}, ${(parseInt(numD) - 1) + ((count - 12) * 3)}`;
            cbbb.onclick = function () {
                setBet(this, num, 'corner_bet', 8);
            };
            cbbb.oncontextmenu = function (e) {
                e.preventDefault();
                removeBet(this, num, 'corner_bet', 8);
            };
            wlcb.append(cbbb);
        }
        wl.append(wlcb);
    }

    bettingBoard.append(wl);

    let bbtop = document.createElement('div');
    bbtop.setAttribute('class', 'bbtop');
    let bbtopBlocks = ['1 to 18', '19 to 36'];
    for (let i = 0; i < bbtopBlocks.length; i++) {
        let bbtoptwo = document.createElement('div');
        bbtoptwo.setAttribute('class', 'bbtoptwo');
        let num = (i === 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
        bbtoptwo.onclick = function () {
            setBet(this, num, i === 0 ? 'outside_low' : 'outside_high', 1);
        };
        bbtoptwo.oncontextmenu = function (e) {
            e.preventDefault();
            removeBet(this, num, i === 0 ? 'outside_low' : 'outside_high', 1);
        };
        bbtoptwo.innerText = bbtopBlocks[i];
        bbtop.append(bbtoptwo);
    }
    bettingBoard.append(bbtop);

    let numberBoard = document.createElement('div');
    numberBoard.setAttribute('class', 'number_board');

    let zero = document.createElement('div');
    zero.setAttribute('class', 'number_0');
    zero.onclick = function () {
        setBet(this, '0', 'zero', 35);
    };
    zero.oncontextmenu = function (e) {
        e.preventDefault();
        removeBet(this, '0', 'zero', 35);
    };
    let nbnz = document.createElement('div');
    nbnz.setAttribute('class', 'nbn');
    nbnz.innerText = '0';
    zero.append(nbnz);
    numberBoard.append(zero);

    let numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
    for (let i = 0; i < numberBlocks.length; i++) {
        let numberBlock = document.createElement('div');
        let colourClass = numRed.includes(numberBlocks[i]) ? ' redNum' : ' blackNum';
        numberBlock.setAttribute('class', 'number_block' + colourClass);
        numberBlock.onclick = function () {
            setBet(this, '' + numberBlocks[i], 'inside_whole', 35);
        };
        numberBlock.oncontextmenu = function (e) {
            e.preventDefault();
            removeBet(this, '' + numberBlocks[i], 'inside_whole', 35);
        };
        let nbn = document.createElement('div');
        nbn.setAttribute('class', 'nbn');
        nbn.innerText = numberBlocks[i];
        numberBlock.append(nbn);
        numberBoard.append(numberBlock);
    }
    bettingBoard.append(numberBoard);

    let bo3Board = document.createElement('div');
    bo3Board.setAttribute('class', 'bo3_board');
    let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
    for (let i = 0; i < bo3Blocks.length; i++) {
        let bo3Block = document.createElement('div');
        bo3Block.setAttribute('class', 'bo3_block');
        bo3Block.onclick = function () {
            let num = (i === 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : (i === 1 ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
            setBet(this, num, 'outside_dozen', 2);
        };
        bo3Block.oncontextmenu = function (e) {
            e.preventDefault();
            let num = (i === 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : (i === 1 ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
            removeBet(this, num, 'outside_dozen', 2);
        };
        bo3Block.innerText = bo3Blocks[i];
        bo3Board.append(bo3Block);
    }
    bettingBoard.append(bo3Board);

    let otoBoard = document.createElement('div');
    otoBoard.setAttribute('class', 'oto_board');
    let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
    for (let i = 0; i < otoBlocks.length; i++) {
        let colourClass = (otoBlocks[i] === 'RED') ? ' redNum' : (otoBlocks[i] === 'BLACK' ? ' blackNum' : '');
        let otoBlock = document.createElement('div');
        otoBlock.setAttribute('class', 'oto_block' + colourClass);
        otoBlock.onclick = function () {
            let num = (i === 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' :
                      (i === 1 ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' :
                      (i === 2 ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' :
                      '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
            setBet(this, num, 'outside_oerb', 1);
        };
        otoBlock.oncontextmenu = function (e) {
            e.preventDefault();
            let num = (i === 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' :
                      (i === 1 ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' :
                      (i === 2 ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' :
                      '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
            removeBet(this, num, 'outside_oerb', 1);
        };
        otoBlock.innerText = otoBlocks[i];
        otoBoard.append(otoBlock);
    }
    bettingBoard.append(otoBoard);

    let chipDeck = document.createElement('div');
    chipDeck.setAttribute('class', 'chipDeck');
    let chipValues = [1, 5, 10, 100, 'clear'];
    for (let i = 0; i < chipValues.length; i++) {
        let chipColour = (i === 0) ? 'red' : (i === 1 ? 'blue cdChipActive' : (i === 2 ? 'orange' : (i === 3 ? 'gold' : 'clearBet')));
        let chip = document.createElement('div');
        chip.setAttribute('class', 'cdChip ' + chipColour);
        chip.onclick = function () {
            if (i !== 4) {
                let cdChipActive = document.getElementsByClassName('cdChipActive');
                for (let j = 0; j < cdChipActive.length; j++) {
                    cdChipActive[j].classList.remove('cdChipActive');
                }
                this.classList.add('cdChipActive');
                wager = parseInt(chipValues[i]);
            } else {
                bankValue += currentBet;
                currentBet = 0;
                document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
                document.getElementById('betSpan').innerText = currentBet.toLocaleString("en-GB");
                clearBet();
                removeChips();
            }
        };
        let chipSpan = document.createElement('span');
        chipSpan.setAttribute('class', 'cdChipSpan');
        chipSpan.innerText = chipValues[i];
        chip.append(chipSpan);
        chipDeck.append(chip);
    }
    bettingBoard.append(chipDeck);

    let bankContainer = document.createElement('div');
    bankContainer.setAttribute('class', 'bankContainer');

    let bank = document.createElement('div');
    bank.setAttribute('class', 'bank');
    let bankSpan = document.createElement('span');
    bankSpan.setAttribute('id', 'bankSpan');
    bankSpan.innerText = bankValue.toLocaleString("en-GB");
    bank.append(bankSpan);
    bankContainer.append(bank);

    let bet = document.createElement('div');
    bet.setAttribute('class', 'bet');
    let betSpan = document.createElement('span');
    betSpan.setAttribute('id', 'betSpan');
    betSpan.innerText = currentBet.toLocaleString("en-GB");
    bet.append(betSpan);
    bankContainer.append(bet);
    bettingBoard.append(bankContainer);

    container.append(bettingBoard);
}

function clearBet() {
    bet = [];
    numbersBet = [];
}

function setBet(e, n, t, o) {
    lastWager = wager;
    wager = (bankValue < wager) ? bankValue : wager;
    if (wager > 0) {
        if (!container.querySelector('.spinBtn')) {
            let spinBtn = document.createElement('div');
            spinBtn.setAttribute('class', 'spinBtn');
            spinBtn.innerText = 'Spin';
            spinBtn.onclick = function () {
                this.remove();
                spin();
            };
            container.append(spinBtn);
        }
        bankValue -= wager;
        currentBet += wager;
        document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
        document.getElementById('betSpan').innerText = currentBet.toLocaleString("en-GB");
        for (let i = 0; i < bet.length; i++) {
            if (bet[i].numbers === n && bet[i].type === t) {
                bet[i].amt += wager;
                let chipColour = (bet[i].amt < 5) ? 'red' : (bet[i].amt < 10 ? 'blue' : (bet[i].amt < 100 ? 'orange' : 'gold'));
                let chip = e.querySelector('.chip');
                chip.setAttribute('class', 'chip ' + chipColour);
                chip.querySelector('.chipSpan').innerText = bet[i].amt;
                return;
            }
        }
        let obj = { amt: wager, type: t, odds: o, numbers: n };
        bet.push(obj);

        let numArray = n.split(',').map(Number);
        for (let i = 0; i < numArray.length; i++) {
            if (!numbersBet.includes(numArray[i])) {
                numbersBet.push(numArray[i]);
            }
        }

        if (!e.querySelector('.chip')) {
            let chipColour = (wager < 5) ? 'red' : (wager < 10 ? 'blue' : (wager < 100 ? 'orange' : 'gold'));
            let chip = document.createElement('div');
            chip.setAttribute('class', 'chip ' + chipColour);
            let chipSpan = document.createElement('span');
            chipSpan.setAttribute('class', 'chipSpan');
            chipSpan.innerText = wager;
            chip.append(chipSpan);
            e.append(chip);
        }
    }
}

function spin() {
    var winningSpin = Math.floor(Math.random() * 37);
    wheel.style.display = 'block'; // Показываем рулетку
    spinWheel(winningSpin);
    setTimeout(function () {
        if (numbersBet.includes(winningSpin)) {
            let winValue = 0;
            let betTotal = 0;
            for (let i = 0; i < bet.length; i++) {
                var numArray = bet[i].numbers.split(',').map(Number);
                if (numArray.includes(winningSpin)) {
                    bankValue += (bet[i].odds * bet[i].amt) + bet[i].amt;
                    winValue += (bet[i].odds * bet[i].amt);
                    betTotal += bet[i].amt;
                }
            }
            win(winningSpin, winValue, betTotal);
        }

        currentBet = 0;
        document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
        document.getElementById('betSpan').innerText = currentBet.toLocaleString("en-GB");

        bet = [];
        numbersBet = [];
        removeChips();
        wager = lastWager;
        if (bankValue === 0 && currentBet === 0) {
            gameOver();
        }

        setTimeout(function () {
            wheel.style.display = 'none'; // Скрываем рулетку через 4 секунды после остановки
        }, 4000);
    }, 10000);
}

function win(winningSpin, winValue, betTotal) {
    if (winValue > 0) {
        let notification = document.createElement('div');
        notification.setAttribute('id', 'notification');
        let nSpan = document.createElement('div');
        nSpan.setAttribute('class', 'nSpan');
        let nsnumber = document.createElement('span');
        nsnumber.style.cssText = numRed.includes(winningSpin) ? 'color:red' : 'color:black';
        nsnumber.innerText = winningSpin;
        nSpan.append(nsnumber);
        nSpan.append(' Win');
        let nsWin = document.createElement('div');
        nsWin.setAttribute('class', 'nsWin');
        nsWin.innerHTML = `<div class="nsWinBlock">Bet: ${betTotal}</div><div class="nsWinBlock">Win: ${winValue}</div><div class="nsWinBlock">Payout: ${winValue + betTotal}</div>`;
        nSpan.append(nsWin);
        notification.append(nSpan);
        container.prepend(notification);
        setTimeout(function () {
            notification.style.opacity = '0';
        }, 3000);
        setTimeout(function () {
            notification.remove();
        }, 4000);
    }
}

function removeBet(e, n, t, o) {
    wager = (wager === 0) ? 100 : wager;
    for (let i = 0; i < bet.length; i++) {
        if (bet[i].numbers === n && bet[i].type === t) {
            if (bet[i].amt !== 0) {
                wager = (bet[i].amt > wager) ? wager : bet[i].amt;
                bet[i].amt -= wager;
                bankValue += wager;
                currentBet -= wager;
                document.getElementById('bankSpan').innerText = bankValue.toLocaleString("en-GB");
                document.getElementById('betSpan').innerText = currentBet.toLocaleString("en-GB");
                if (bet[i].amt === 0) {
                    e.querySelector('.chip').remove();
                } else {
                    let chipColour = (bet[i].amt < 5) ? 'red' : (bet[i].amt < 10 ? 'blue' : (bet[i].amt < 100 ? 'orange' : 'gold'));
                    let chip = e.querySelector('.chip');
                    chip.setAttribute('class', 'chip ' + chipColour);
                    chip.querySelector('.chipSpan').innerText = bet[i].amt;
                }
            }
        }
    }
    if (currentBet === 0 && container.querySelector('.spinBtn')) {
        document.querySelector('.spinBtn').remove();
    }
}

function spinWheel(winningSpin) {
    for (let i = 0; i < wheelnumbersAC.length; i++) {
        if (wheelnumbersAC[i] === winningSpin) {
            var degree = (i * 9.73) + 362;
        }
    }
    wheel.style.cssText = 'display: block; animation: wheelRotate 5s linear infinite;';
    ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

    setTimeout(function () {
        ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerText = `@keyframes ballStop {from {transform: rotate(0deg);} to {transform: rotate(-${degree}deg);}}`;
        document.head.appendChild(style);
    }, 2000);
    setTimeout(function () {
        ballTrack.style.cssText = 'animation: ballStop 3s linear;';
    }, 6000);
    setTimeout(function () {
        ballTrack.style.cssText = `transform: rotate(-${degree}deg);`;
    }, 9000);
    setTimeout(function () {
        wheel.style.cssText = 'display: block;';
        document.querySelector('style').remove();
    }, 10000);
}

function removeChips() {
    let chips = document.getElementsByClassName('chip');
    while (chips.length > 0) {
        chips[0].remove();
    }
}