const puzzleContainer = document.getElementById("puzzle-container");
const shuffleBtn = document.getElementById("shuffle-btn");
const resetBtn = document.getElementById("reset-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const winMessage = document.getElementById("win-message");
const movesDisplay = document.getElementById("moves");
const winMovesDisplay = document.getElementById("win-moves");
const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");

const size = 3;
const pieceSize = 100;
let pieces = [];
let emptyPos = { row: size - 1, col: size - 1 };
let moves = 0;
let isGameOver = false;

function initPuzzle() {
    puzzleContainer.innerHTML = '';
    puzzleContainer.appendChild(winMessage);
    winMessage.classList.remove("show");
    pieces = [];
    emptyPos = { row: size - 1, col: size - 1 };
    moves = 0;
    isGameOver = false;
    movesDisplay.textContent = moves;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const number = row * size + col + 1;
            if (row === size - 1 && col === size - 1) continue;

            const piece = document.createElement("div");
            piece.className = `puzzle-piece piece-${number}`;
            piece.textContent = number;
            piece.dataset.row = row;
            piece.dataset.col = col;
            piece.dataset.number = number;
            piece.setAttribute("aria-label", `Tile ${number}`);
            piece.tabIndex = 0;

            piece.style.left = `${col * pieceSize}px`;
            piece.style.top = `${row * pieceSize}px`;
            piece.addEventListener("click", () => movePiece(piece));

            puzzleContainer.appendChild(piece);
            pieces.push({ element: piece, row, col, number });
        }
    }
}

function movePiece(piece) {
    if (isGameOver) return;

    const row = parseInt(piece.dataset.row);
    const col = parseInt(piece.dataset.col);
    const isAdjacent =
        (Math.abs(row - emptyPos.row) === 1 && col === emptyPos.col) ||
        (Math.abs(col - emptyPos.col) === 1 && row === emptyPos.row);

    if (isAdjacent) {
        const tempRow = emptyPos.row;
        const tempCol = emptyPos.col;
        emptyPos = { row, col };

        piece.dataset.row = tempRow;
        piece.dataset.col = tempCol;
        piece.style.left = `${tempCol * pieceSize}px`;
        piece.style.top = `${tempRow * pieceSize}px`;

        moveSound.play();
        moves++;
        movesDisplay.textContent = moves;

        checkWin();
    }
}

function checkWin() {
    let isSolved = true;
    for (const piece of pieces) {
        const currentRow = parseInt(piece.element.dataset.row);
        const currentCol = parseInt(piece.element.dataset.col);
        const correctRow = Math.floor((piece.number - 1) / size);
        const correctCol = (piece.number - 1) % size;

        if (currentRow !== correctRow || currentCol !== correctCol) {
            isSolved = false;
            break;
        }
    }

    if (isSolved && emptyPos.row === size - 1 && emptyPos.col === size - 1) {
        isGameOver = true;
        winSound.play();
        winMovesDisplay.textContent = moves;
        winMessage.classList.add("show");
    }
}

function shufflePuzzle() {
    if (isGameOver) initPuzzle();
    let shuffleCount = 150;

    function doShuffleMove() {
        if (shuffleCount <= 0) {
            moves = 0;
            movesDisplay.textContent = moves;
            return;
        }

        const adj = pieces.filter(piece => {
            const r = parseInt(piece.element.dataset.row);
            const c = parseInt(piece.element.dataset.col);
            return (
                (Math.abs(r - emptyPos.row) === 1 && c === emptyPos.col) ||
                (Math.abs(c - emptyPos.col) === 1 && r === emptyPos.row)
            );
        });

        if (adj.length > 0) {
            const rand = adj[Math.floor(Math.random() * adj.length)];
            movePiece(rand.element);
        }

        shuffleCount--;
        setTimeout(doShuffleMove, 20);
    }

    doShuffleMove();
}

// Arrow key movement
document.addEventListener("keydown", (e) => {
    if (isGameOver) return;

    const directions = {
        ArrowUp: { dr: 1, dc: 0 },
        ArrowDown: { dr: -1, dc: 0 },
        ArrowLeft: { dr: 0, dc: 1 },
        ArrowRight: { dr: 0, dc: -1 }
    };

    if (!directions[e.key]) return;

    const { dr, dc } = directions[e.key];
    const targetRow = emptyPos.row + dr;
    const targetCol = emptyPos.col + dc;

    const targetPiece = pieces.find(p =>
        parseInt(p.element.dataset.row) === targetRow &&
        parseInt(p.element.dataset.col) === targetCol
    );

    if (targetPiece) movePiece(targetPiece.element);
});

shuffleBtn.addEventListener("click", shufflePuzzle);
resetBtn.addEventListener("click", initPuzzle);
playAgainBtn.addEventListener("click", () => {
    initPuzzle();
    shufflePuzzle();
});

initPuzzle();
shufflePuzzle();