// --- DOM Element Selection ---
// This section gets all the HTML elements we need to interact with.
const rollButton = document.getElementById('roll-button');
const backButton = document.getElementById('back-button');
const resetButton = document.getElementById('reset-button');

const diceOutput = document.getElementById('dice-output');
const resultText = document.getElementById('result-text');
const totalCountEl = document.getElementById('total-count');

const bankerSummaryEl = document.getElementById('banker-summary');
const playerSummaryEl = document.getElementById('player-summary');
const tieSummaryEl = document.getElementById('tie-summary');

// --- State Management ---
// These variables hold the current state of the game, just like React's state.
let state = {
    dice: [],
    result: '',
    count: 0,
    bankerCount: 0,
    playerCount: 0,
    tieCount: 0,
    consecutiveBanker: 0,
    consecutivePlayer: 0,
    consecutiveTie: 0,
    lastResult: null,
    bankerBeforeTie: 0,
    playerBeforeTie: 0,
};

// This array will store the history of states for the "undo" functionality.
let history = [];

// --- Helper Functions ---
// Helper to check if a number is odd.
const isOdd = (num) => num % 2 === 1;
// Helper to check if a number is even.
const isEven = (num) => num % 2 === 0;


// --- Core UI Update Function ---
/**
 * Renders the current state to the DOM.
 * This function is called whenever the state changes to update the user interface.
 */
const updateUI = () => {
    // Update dice display
    diceOutput.textContent = state.dice.length ? state.dice.join(', ') : '아직 예언되지 않음';

    // Update result text
    resultText.textContent = state.result;

    // Update total count
    totalCountEl.textContent = state.count;

    // Update summary texts
    bankerSummaryEl.textContent = `BANKER: ${state.bankerCount} (${state.consecutiveBanker} 연속)`;
    playerSummaryEl.textContent = `PLAYER: ${state.playerCount} (${state.consecutivePlayer} 연속)`;
    tieSummaryEl.textContent = `TIE: ${state.tieCount} (${state.consecutiveTie} 연속)`;
    
    // Enable or disable the "back" button based on history
    backButton.disabled = history.length === 0;
};

// --- Game Logic Functions ---

/**
 * Saves the current state to the history array.
 * Creates a deep copy to prevent issues with object references.
 */
const saveStateToHistory = () => {
    history.push(JSON.parse(JSON.stringify(state)));
};

/**
 * Rolls the dice, determines the outcome, and updates the state.
 */
const rollDice = () => {
    // 1. Save the current state before making changes
    saveStateToHistory();
    
    // 2. Generate new dice and determine the result
    const newDice = Array.from({ length: 30 }, () => Math.floor(Math.random() * 6) + 1);
    const oddCount = newDice.filter(isOdd).length;
    const evenCount = newDice.filter(isEven).length;

    let currentResult = '';
    if (oddCount > evenCount) {
        currentResult = 'BANKER';
    } else if (evenCount > oddCount) {
        currentResult = 'PLAYER';
    } else {
        currentResult = 'TIE';
    }

    // 3. Update the state object with the new values
    state.dice = newDice;
    state.result = currentResult;
    state.count++;

    if (currentResult === 'BANKER') {
        state.bankerCount++;
    } else if (currentResult === 'PLAYER') {
        state.playerCount++;
    } else {
        state.tieCount++;
    }

    // --- Logic for consecutive counts ---
    if (currentResult === 'TIE') {
        state.consecutiveTie++;
        // If the last result was NOT a TIE, store the current non-TIE consecutive counts
        if (state.lastResult !== 'TIE') {
            state.bankerBeforeTie = state.consecutiveBanker;
            state.playerBeforeTie = state.consecutivePlayer;
        }
    } else if (currentResult === 'BANKER') {
        state.consecutiveTie = 0;
        state.consecutivePlayer = 0;

        if (state.lastResult === 'BANKER') {
            state.consecutiveBanker++;
        } else if (state.lastResult === 'TIE') {
            // Resume the streak from before the TIEs
            state.consecutiveBanker = state.bankerBeforeTie + 1;
        } else {
            state.consecutiveBanker = 1;
        }
        state.bankerBeforeTie = 0;
        state.playerBeforeTie = 0;
    } else { // currentResult === 'PLAYER'
        state.consecutiveTie = 0;
        state.consecutiveBanker = 0;

        if (state.lastResult === 'PLAYER') {
            state.consecutivePlayer++;
        } else if (state.lastResult === 'TIE') {
            // Resume the streak from before the TIEs
            state.consecutivePlayer = state.playerBeforeTie + 1;
        } else {
            state.consecutivePlayer = 1;
        }
        state.bankerBeforeTie = 0;
        state.playerBeforeTie = 0;
    }

    state.lastResult = currentResult;

    // 4. Update the UI to reflect the new state
    updateUI();
};

/**
 * Reverts the game to the previous state from history.
 */
const goBack = () => {
    if (history.length > 0) {
        // Pop the last state from history and make it the current state
        state = history.pop();
        // Update the UI
        updateUI();
    }
};

/**
 * Resets the game to its initial state.
 */
const resetGame = () => {
    // Reset the state object to its default values
    state = {
        dice: [],
        result: '',
        count: 0,
        bankerCount: 0,
        playerCount: 0,
        tieCount: 0,
        consecutiveBanker: 0,
        consecutivePlayer: 0,
        consecutiveTie: 0,
        lastResult: null,
        bankerBeforeTie: 0,
        playerBeforeTie: 0,
    };
    // Clear the history array
    history = [];
    // Update the UI
    updateUI();
};


// --- Event Listeners ---
// This section connects the buttons to their respective functions.
rollButton.addEventListener('click', rollDice);
backButton.addEventListener('click', goBack);
resetButton.addEventListener('click', resetGame);


// --- Initial Render ---
// Call updateUI once on page load to set the initial view correctly.
updateUI();
