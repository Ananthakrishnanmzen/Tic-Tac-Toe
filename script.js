let board = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let ai = "O";
let isAiThinking = false;
let scores = { user: 0, draw: 0, ai: 0 };

const cells = document.querySelectorAll('.cell');
const boardEl = document.getElementById('board');
const line = document.getElementById('strike-line');

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
    isAiThinking = false;
    line.style.display = 'none';
    boardEl.classList.remove('locked');
    cells.forEach(cell => { 
        cell.innerText = ""; 
        cell.className = "cell"; 
    });
    
    updateTurnUI(true);
    if (ai === "X") {
        isAiThinking = true;
        boardEl.classList.add('locked');
        // Reduced delay for the first move
        setTimeout(aiMove, 100); 
    }
}

function updateTurnUI(isPlayerTurn) {
    const icon = document.getElementById('turn-icon');
    const text = document.getElementById('turn-text');
    const symbol = isPlayerTurn ? player : ai;
    icon.innerText = symbol;
    icon.className = symbol === 'X' ? 'x-text' : 'o-text';
    text.innerText = isPlayerTurn ? "Your turn" : "AI thinking...";
}

cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (board[index] === "" && !isAiThinking) {
            makeMove(index, player);
            
            let result = checkWinner(board);
            if (!result && board.includes("")) {
                isAiThinking = true; 
                boardEl.classList.add('locked');
                updateTurnUI(false);
                // SPEED FIX: Reduced from 600ms to 50ms for instant feel
                setTimeout(aiMove, 50); 
            }
        }
    });
});

function makeMove(index, symbol) {
    board[index] = symbol;
    cells[index].innerText = symbol;
    cells[index].classList.add(symbol === 'X' ? 'x-text' : 'o-text');
    
    let result = checkWinner(board);
    if (result) {
        if (result.winner !== "draw") {
            drawWinningLine(result.combo);
        }
        endGame(result.winner);
    }
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
    if (!checkWinner(board)) {
        isAiThinking = false;
        boardEl.classList.remove('locked');
        updateTurnUI(true);
    }
}

// OPTIMIZED MINIMAX
function minimax(board, depth, isMaximizing) {
    let result = checkWinner(board);
    if (result) {
        if (result.winner === ai) return 10 - depth; // Favor faster wins
        if (result.winner === player) return depth - 10; // Favor longer losses
        return 0;
    }

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
        if (b[combo[0]] && b[combo[0]] === b[combo[1]] && b[combo[0]] === b[combo[2]]) {
            return { winner: b[combo[0]], combo: combo };
        }
    }
    return b.includes("") ? null : { winner: "draw" };
}

function drawWinningLine(combo) {
    const boardRect = boardEl.getBoundingClientRect();
    const startCell = cells[combo[0]].getBoundingClientRect();
    const endCell = cells[combo[2]].getBoundingClientRect();

    const x1 = startCell.left + startCell.width / 2 - boardRect.left;
    const y1 = startCell.top + startCell.height / 2 - boardRect.top;
    const x2 = endCell.left + endCell.width / 2 - boardRect.left;
    const y2 = endCell.top + endCell.height / 2 - boardRect.top;

    const dist = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    line.style.width = `${dist}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.display = 'block';
}

function endGame(winnerSymbol) {
    isAiThinking = true;
    boardEl.classList.add('locked');
    
    if (winnerSymbol === "draw") scores.draw++;
    else if (winnerSymbol === player) scores.user++;
    else scores.ai++;
    
    document.getElementById('user-score').innerText = scores.user;
    document.getElementById('draw-score').innerText = scores.draw;
    document.getElementById('ai-score').innerText = scores.ai;
    
    setTimeout(resetBoard, 1500);
}

function resetToMenu() {
    location.reload();
}
