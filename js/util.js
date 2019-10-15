function getRandomInteger(min, max) {
    var maxFloor = Math.floor(max);
    var result = parseInt(Math.random() * (maxFloor - min) + min);
    return result;
}

function getRandPos(board) {
    return { i: getRandomInteger(0, board.length), j: getRandomInteger(0, board.length) };
}

function getPosNotMineOrShown(board) {
    var pos = getRandPos(board);
    while (board[pos.i][pos.j].isMine || board[pos.i][pos.j].isShown) {
        pos = getRandPos(board);
    }
    return pos;
}

function getRandPosExceptPos(board, exceptPos) {
    var pos = getRandPos(board);
    while (+exceptPos.i === pos.i && +exceptPos.j === pos.j) {
        pos = getRandPos(board);
    }
    return pos;
}

function getIndexFromClass(className) {
    var parts = className.split('-');
    var i = parts[1];
    var j = parts[2];
    return { i, j };
}

function getElCellFromIndex(i, j) {
    return document.querySelector(`.cell-${i}-${j}`);
}

function renderElement(query, value, att) {
    var el = document.querySelector(query);
    el[att] = value;
}

function renderBoard(board) {
    var strHTML = '<tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            strHTML += `<td onmouseleave="onMouseLeaveEvent(this)" onmouseover="onMouseOverEvent(this)" onmousedown="onClickEvent(this)" class="cell cell-${i}-${j}"></td>`
        }
        strHTML += '</tr>'
    }
    var elTable = document.querySelector('.game-board');
    elTable.innerHTML = strHTML + '</tbody>';
}

function highlightCell(pos, classColor) {
    var elSafeCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    for (var i = 0; i < 3; i++) {
        setTimeout(() => {
            elSafeCell.classList.add(classColor)
        }, i * 1000);
        setTimeout(() => {
            elSafeCell.classList.remove(classColor)
        }, i * 1000 + 500);
    }
}

function timerStart() {
    if(gTimerInterval) return;
    gTimerInterval = setInterval(() => {
        gGame.secsPassed += 1;
        var secs = (gGame.secsPassed % 60).toString().padStart(2, '0'); // Getting secs by modulu 60, when 0-9 add '0' at the beggining
        var mins = (parseInt(gGame.secsPassed / 60)).toString().padStart(2, '0'); // Getting mins by division 60, when 0-9 add '0' at the beggining
        renderElement('.timer', 'Time Elapsed : ' + mins + ':' + secs, 'innerText');
    }, 1000);
}

function compareScore(level, score) {
    var bestScore = localStorage.getItem(level); // Getting best score from localStorage
    if (bestScore) { // Checking if bestScore has a value
        var parts = bestScore.split(':'); // Splitting best score e.g '00' '15'
        bestScore = +parts[0] * 60 + +parts[1]; // Calculating mins * 60 + secs => string template to secs
        if (score >= bestScore) return // if score is bigger or equal to bestScore, return
    }
    // if bestScore is empty, it's the first time, update the score
    var secs = (score % 60).toString().padStart(2, '0'); // Getting secs by modulu 60, when 0-9 add '0' at the beggining
    var mins = (parseInt(score / 60)).toString().padStart(2, '0'); // Getting mins by division 60, when 0-9 add '0' at the beggining
    var timeTemplate = mins + ':' + secs; // Creating correct time string template e.g '02:54'
    localStorage.setItem(level, timeTemplate);
    renderScore(level);
}

function renderScore(level) {
    var prefix;
    if (level === 4) prefix = 'Easy : ';
    else if (level === 8) prefix = 'Medium : ';
    else prefix = 'Hard : ';

    var bestScore = localStorage.getItem(level);
    if (!bestScore) bestScore = 'No Score!'; // Display 'No Score!' if the level doesnt have a score yet

    var elScore = document.querySelector(`.scores-list li[data-level="${level}"]`);
    elScore.innerText = prefix + bestScore;
}