let dictionary = [];
let totalScore = 0;

// Scrabble tile scores mapping
const tileScores = {
    A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1,
    M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
    Y: 4, Z: 10
};

// Load the dictionary file (dictionary.txt)
fetch('dictionary.txt')
    .then(response => response.text())
    .then(text => {
        dictionary = text.split(/\r?\n/).map(word => word.trim().toUpperCase());
    })
    .catch(error => console.error('Error loading dictionary:', error));

const gameBoard = document.getElementById('game-board');
const inputs = document.querySelectorAll('.letter-input');
const foundWordDisplay = document.getElementById('found-word-display'); // New display for found word
const totalScoreDisplay = document.getElementById('total-score-display'); // Display for total score

// Create a 10x20 grid of divs (200 blocks)
const columns = Array.from({ length: 10 }, () => []);
for (let i = 0; i < 200; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    gameBoard.appendChild(cell);

    // Store the cells in columns
    const columnIndex = i % 10;
    columns[columnIndex].push(cell);
}

let currentInputIndex = 0;
inputs[currentInputIndex].focus(); // Focus the first input on load

// Add event listeners to inputs
inputs.forEach((input, index) => {
    input.addEventListener('input', function () {
        const letter = this.value.toUpperCase();
        if (letter.match(/[A-Z]/)) {
            const columnIndex = parseInt(this.getAttribute('data-column'));
            placeLetterInColumn(letter, columnIndex);

            checkForWords(); // Check for valid words after placing a letter

            this.disabled = true; // Disable the current input
            this.style.backgroundColor = 'darkgray'; // Color the disabled input dark gray
            currentInputIndex = (currentInputIndex + 1) % inputs.length; // Move to the next input
            inputs[currentInputIndex].disabled = false; // Enable the next input
            inputs[currentInputIndex].style.backgroundColor = ''; // Reset background for active input
            inputs[currentInputIndex].focus(); // Focus the next input
        }
        this.value = ''; // Clear input field
    });
});

// Function to place a letter in the bottom-most empty cell in a column
function placeLetterInColumn(letter, columnIndex) {
    const column = columns[columnIndex];

    for (let i = column.length - 1; i >= 0; i--) {
        if (!column[i].textContent) {
            column[i].textContent = letter;
            column[i].style.backgroundColor = '#ffd700'; // Color the block
            break;
        }
    }
}

// Function to check for newly formed words in rows and columns
function checkForWords() {
    // Check rows for 4-letter words
    for (let row = 0; row < 20; row++) {
        for (let colStart = 0; colStart <= 6; colStart++) { // Check sets of 4 consecutive columns
            let rowWord = '';
            let rowCells = [];
            for (let offset = 0; offset < 4; offset++) {
                const cell = columns[colStart + offset][row];
                rowWord += cell.textContent || ''; // Gather letters in the row
                rowCells.push(cell);
            }
            if (rowWord.length === 4 && dictionary.includes(rowWord)) {
                console.log('Valid 4-letter word found in row:', rowWord);
                displayFoundWord(rowWord);
                clearCells(rowCells); // Delete the row if it's a valid 4-letter word
            }
        }
    }

    // Check columns for 4-letter words
    for (let col = 0; col < 10; col++) {
        for (let rowStart = 0; rowStart <= 16; rowStart++) { // Check sets of 4 consecutive rows
            let colWord = '';
            let colCells = [];
            for (let offset = 0; offset < 4; offset++) {
                const cell = columns[col][rowStart + offset];
                colWord += cell.textContent || ''; // Gather letters in the column
                colCells.push(cell);
            }
            if (colWord.length === 4 && dictionary.includes(colWord)) {
                console.log('Valid 4-letter word found in column:', colWord);
                displayFoundWord(colWord);
                clearCells(colCells); // Delete the column if it's a valid 4-letter word
            }
        }
    }

    applyGravity(); // Apply gravity after checking for words
}

// Function to clear the cells (delete the letters)
function clearCells(cells) {
    cells.forEach(cell => {
        cell.textContent = ''; // Clear the cell content
        cell.style.backgroundColor = '#ccc'; // Reset the background color
    });
}

// Function to apply gravity (make tiles fall)
function applyGravity() {
    for (let col = 0; col < 10; col++) {
        for (let row = 19; row >= 0; row--) {
            if (!columns[col][row].textContent) { // If the current cell is empty
                for (let aboveRow = row - 1; aboveRow >= 0; aboveRow--) {
                    if (columns[col][aboveRow].textContent) { // Find the nearest filled cell above
                        columns[col][row].textContent = columns[col][aboveRow].textContent; // Move it down
                        columns[col][row].style.backgroundColor = columns[col][aboveRow].style.backgroundColor; // Keep the color
                        columns[col][aboveRow].textContent = ''; // Clear the moved cell
                        columns[col][aboveRow].style.backgroundColor = '#ccc'; // Reset color
                        break; // Exit the loop after moving one cell down
                    }
                }
            }
        }
    }
}

// Function to calculate the score of a word
function calculateWordScore(word) {
    return word.split('').reduce((score, letter) => score + (tileScores[letter] || 0), 0);
}

// Function to display the found word and score
function displayFoundWord(word) {
    const score = calculateWordScore(word);
    totalScore += score;

    // Display the found word and score
    foundWordDisplay.textContent = `You found this word: ${word} (Score: ${score})`;
    totalScoreDisplay.textContent = `Total Score: ${totalScore}`;
}

// Disable all inputs except the first one on page load
inputs.forEach((input, index) => {
    if (index !== 0) {
        input.disabled = true;
        input.style.backgroundColor = 'darkgray'; // Initial dark gray background for disabled inputs
    }
});
