const MINE = '💣';
const FLAG = '🚩';
const EMPTY = '';
const SMILEY_WIN = '😎';
const SMILEY_NORMAL = '🌝';
const SMILEY_LOSE = '☹️';
const HINT = '💡';
const SAFE = '🛡️';

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gMines = [];
var gGame;
var gTimerInterval;
var gIsHint = false;
var gManually;

function init() {
    resetTimer();
    chooseLevel();
    checkIfManually();
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
    setGameSettings();
    renderElement('#restart-btn', SMILEY_NORMAL, 'value');
    renderElement('.lives', ' Lives Left : ' + gGame.lives, 'innerText');
    renderElement('.marks', 'Marks Left : ' + (gLevel.MINES - gGame.markedCount), 'innerText');
    renderElement('.timer', 'Time Elapsed : 00:00', 'innerText');
    renderElement('#safe-btn', `${gGame.safeClickCounter} Safe Clicks ${SAFE}`, 'value');
    renderElement('#hint-btn', `${gGame.hints} Hint Clicks ${HINT}`, 'value');
    gIsHint = false;
}

function resetTimer() {
    clearInterval(gTimerInterval);
    gTimerInterval = null;
}

function setGameSettings() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        safeClickCounter: 3,
        lives: 3,
        hints: 3
    }
}

function checkIfManually() {
    var elCheckbox = document.querySelector('.radio-btn [type=checkbox]');
    if (elCheckbox.checked) gManually = true;
    else gManually = false;
}

function chooseLevel() {
    var elRadios = document.querySelectorAll('.radio-btn [type=radio]');
    for (var x = 0; x < elRadios.length; x++) {
        if (elRadios[x].checked) gLevel.SIZE = +elRadios[x].value;
        renderScore(+elRadios[x].value);
    }
    if (gLevel.SIZE === 4) gLevel.MINES = 2;
    else if (gLevel.SIZE === 8) gLevel.MINES = 12;
    else gLevel.MINES = 30;
}

function createObj() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
    }
}

function buildBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        var row = [];
        for (var j = 0; j < size; j++) {
            row.push(createObj());
        }
        board.push(row);
    }
    return board;
}

function cellClicked(pos) {
    var i = pos.i;
    var j = pos.j;
    var currCell = gBoard[i][j];
    if (currCell.isShown && !currCell.isMine) return;

    if (gManually && gMines.length < gLevel.MINES) {
        if (gBoard[i][j].isMine) {
            highlightCell(pos, 'bc-red');
            return;
        }
        gBoard[i][j].isMine = true;
        gBoard[i][j].isShown = true;
        gMines.push(pos);
        if (gMines.length === gLevel.MINES) {
            for (var x = 0; x < gMines.length; x++) {
                var idxI = gMines[x].i;
                var idxJ = gMines[x].j;
                gBoard[idxI][idxJ].isShown = false;
                getElCellFromIndex(idxI, idxJ).innerText = EMPTY;
            }
        }
        return;
    }

    if (currCell.isMine && !gIsHint) {
        gGame.lives--;
        if (!gGame.lives) {
            getElCellFromIndex(i, j).classList.add('bc-red');
            gameOver('LOSE');
            return;
        }
        renderElement('.lives', ' Lives Left : ' + gGame.lives, 'innerText');
        highlightCell({ i, j }, 'bc-red');
        return;
    }

    if (!gGame.shownCount) { // First click
        if (!gManually) setMines(gBoard, pos);
        gManually = false;
        timerStart();
        setMinesNegsCount(gBoard);
    }

    if (gIsHint) {
        revealHint(gBoard, pos);
        gGame.hints--;
        renderElement('#hint-btn', `${gGame.hints} Hint Clicks ${HINT}`, 'value');
    }
    else reveal(gBoard, { i, j })

    if (checkVictory(gBoard)) {
        gameOver('WIN');
    }
}

function onClickEvent(elCell) {
    if (!gGame.isOn) return;
    switch (event.which) {
        case 3:
            cellMarked(elCell);
            break;
        case 1:
            var className = elCell.classList[1];
            var pos = getIndexFromClass(className);
            cellClicked(pos);
            break;
        default:
    }
}

function cellMarked(elCell) {
    if (gGame.markedCount === gLevel.MINES && elCell.innerText !== FLAG) return;
    var cellIdx = getIndexFromClass(elCell.classList[1]);
    var currCell = gBoard[cellIdx.i][cellIdx.j];
    if (currCell.isShown && !currCell.isMine) return;

    if (currCell.isMarked) {
        elCell.innerText = EMPTY;
        currCell.isMarked = false;
        gGame.markedCount--;
    }
    else {
        elCell.innerText = FLAG;
        currCell.isMarked = true;
        gGame.markedCount++;
    }
    renderElement('.marks', 'Marks Left : ' + (gLevel.MINES - gGame.markedCount), 'innerText');
}

function checkVictory(board) {
    return (gGame.shownCount === board.length ** 2 - gLevel.MINES);
}

function expandShown(board, elCell, i, j) {
    if (!board[i][j].minesAroundCount) elCell.innerText = '';
    else elCell.innerText = board[i][j].minesAroundCount;

    if (elCell.innerText === '1') elCell.style.color = 'blue';
    else if (elCell.innerText === '2') elCell.style.color = 'green';
    else if (elCell.innerText === '3') elCell.style.color = 'red';
    else if (elCell.innerText === '4') elCell.style.color = 'purple';
    else if (elCell.innerText === '5') elCell.style.color = 'brown';

    if (board[i][j].isMine) elCell.innerText = MINE;
    if (!elCell.classList.contains('bc-yellow')) elCell.classList.add('cell-clicked');
}

function contractShown(elCell) {
    elCell.innerText = EMPTY;
    elCell.classList.remove('bc-yellow');
}

function safeClick() {
    if (!gGame.safeClickCounter || !gGame.isOn || !gGame.shownCount) return;
    if (gGame.shownCount === gBoard.length ** 2 - gLevel.MINES) return;

    var safePos = getPosNotMineOrShown(gBoard);
    highlightCell(safePos, 'bc-green');
    gGame.safeClickCounter--;
    renderElement('#safe-btn', `${gGame.safeClickCounter} Safe Clicks ${SAFE}`, 'value');
}

function hintClick(elBtn) {
    if (!gGame.shownCount || !gGame.isOn || !gGame.hints) return;
    gIsHint = !gIsHint;
    if (gIsHint) elBtn.classList.add('bc-green');
    else elBtn.classList.remove('bc-green')
}

function onMouseOverEvent(elCell) {
    var cellIdx = getIndexFromClass(elCell.classList[1]);
    if (gBoard[cellIdx.i][cellIdx.j].isShown) return;
    if (gManually && gMines.length < gLevel.MINES) elCell.innerText = MINE;
    else if (gIsHint) elCell.innerText = HINT;

}

function onMouseLeaveEvent(elCell) {
    var cellIdx = getIndexFromClass(elCell.classList[1]);
    if (gBoard[cellIdx.i][cellIdx.j].isShown) return;
    if (gIsHint || gManually) elCell.innerText = EMPTY;
}

function gameOver(status) {
    gGame.isOn = false;
    resetTimer();
    var smiley;
    if (status === 'WIN') {
        smiley = SMILEY_WIN;
        compareScore(gLevel.SIZE, gGame.secsPassed);
        renderElement('.lives', 'You won!', 'innerText');
    } else if (status === 'LOSE') {
        smiley = SMILEY_LOSE;
        renderElement('.lives', 'Game Over!', 'innerText');
    }
    renderElement('#restart-btn', smiley, 'value');
    revealElMines(gMines);
    gMines = [];
}

function revealElMines(minesArr) {
    for (var i = 0; i < minesArr.length; i++) {
        var currMine = getElCellFromIndex(minesArr[i].i, minesArr[i].j);
        if (currMine.innerText === FLAG && !currMine.classList.contains('bc-red')) currMine.classList.add('bc-green');
        currMine.innerText = MINE;
    }
}

function setMines(board, exceptPos) {
    for (var idx = 0; idx < gLevel.MINES; idx++) {
        var minePos = getRandPosExceptPos(board, exceptPos); // exceptPos = first click position to avoid
        // var minePos = { i: 0, j: idx };
        board[minePos.i][minePos.j].isMine = true;
        gMines.push(minePos);
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!board[i][j].isMine) {
                board[i][j].minesAroundCount = getNegsCount(board, { i, j });
            }
        }
    }
}

function getNegsCount(board, pos) {
    var res = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isMine) res++;
        }
    }
    return res;
}

function revealHint(board, pos) {
    var elHintBtn = document.querySelector('#hint-btn');
    elHintBtn.classList.remove('bc-green');
    gIsHint = !gIsHint;
    var elCells = []
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            var x = +pos.i + i;
            var y = +pos.j + j;
            if (x < 0 || x > board.length - 1) continue;
            if (y < 0 || y > board[0].length - 1) continue;
            // if (i === 0 && j === 0) continue;
            var currElCell = getElCellFromIndex(x, y);
            if (!board[x][y].isShown) {
                currElCell.classList.add('bc-yellow');
                expandShown(board, currElCell, x, y);
                elCells.push(currElCell);
            }
        }
    }
    setTimeout(() => {
        for (i = 0; i < elCells.length; i++) contractShown(elCells[i])
    }, 1000);
}

function reveal(board, pos) {
    board[pos.i][pos.j].isShown = true;
    expandShown(board, getElCellFromIndex(pos.i, pos.j), pos.i, pos.j);
    var elCell = getElCellFromIndex(pos.i, pos.j);
    if (elCell.innerText === FLAG) {
        gGame.markedCount--;
        renderElement('.marks', 'Marks Left : ' + (gLevel.MINES - gGame.markedCount), 'innerText');
    }
    if (!board[pos.i][pos.j].minesAroundCount) {
        floodFill(board, pos);
    }
    gGame.shownCount++;
}

function floodFill(board, pos) {
    for (var i = +pos.i - 1; i <= +pos.i + 1; i++) {
        if (i < 0 || i > +board.length - 1) continue;
        for (var j = +pos.j - 1; j <= +pos.j + 1; j++) {
            if (j < 0 || j > +board[0].length - 1) continue;
            if (i === +pos.i && j === +pos.j) continue;
            if (!board[i][j].isMine && !board[i][j].isShown) {
                reveal(board, { i, j });
            }
        }
    }
}