let board = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let ai = "O";
let scores = { user: 0, draw: 0, ai: 0 };

const cells = document.querySelectorAll('.cell');

function initGame(symbol) {
    player = symbol;
    ai = symbol === 'X' ? 'O' : 'X';
    document.getElementById('player-display').innerText = player;
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    resetBoard();
}

function resetBoard() {
    board = ["", "", "", "", "", "", "", "", ""];
    cells.forEach(cell => { cell.innerText = ""; cell.className = "cell"; });
    updateTurnUI(true);
    if (ai === "X") setTimeout(aiMove, 500);
}

function updateTurnUI(isPlayer) {
    const icon = document.getElementById('turn-icon');
    const text = document.getElementById('turn-text');
    const active = isPlayer ? player : ai;
    icon.innerText = active;
    icon.className = active === 'X' ? 'x-text' : 'o-text';
    text.innerText = isPlayer ? "Your turn" : "AI thinking...";
}

cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (board[index] === "" && !checkWinner(board)) {
            makeMove(index, player);
            if (!checkWinner(board) && board.includes("")) {
                updateTurnUI(false);
                setTimeout(aiMove, 600);
            }
        }
    });
});

function makeMove(index, symbol) {
    board[index] = symbol;
    cells[index].innerText = symbol;
    cells[index].classList.add(symbol === 'X' ? 'x-text' : 'o-text');
    
    let result = checkWinner(board);
    if (result) endGame(result);
}

function aiMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = ai;
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    makeMove(move, ai);
    updateTurnUI(true);
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinner(board);
    if (result === ai) return 10;
    if (result === player) return -10;
    if (result === "draw") return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = ai;
                bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
                board[i] = "";
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = player;
                bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
                board[i] = "";
            }
        }
        return bestScore;
    }
}

function checkWinner(b) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let combo of wins) {
        if (b[combo[0]] && b[combo[0]] === b[combo[1]] && b[combo[0]] === b[combo[2]]) 
            return b[combo[0]];
    }
    return b.includes("") ? null : "draw";
}

function endGame(result) {
    if (result === "draw") scores.draw++;
    else if (result === player) scores.user++;
    else scores.ai++;
    
    document.getElementById('user-score').innerText = scores.user;
    document.getElementById('draw-score').innerText = scores.draw;
    document.getElementById('ai-score').innerText = scores.ai;
    
    setTimeout(resetBoard, 1500);
}

function resetToMenu() {
    location.reload();
}
