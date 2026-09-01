// main.js
// This file connects ALL your separated modules together.

// --- IMPORTS ---
import { scheduleCheck, updateSubmitState, state } from './input-validation.js';
import { loadAllPokemonNames, showSuggestionsFor, hideSuggestions, cachedNames } from './suggestions.js';
import { attachFormSubmitHandler } from './form-submit.js';

// --- DOM ELEMENTS ---
const nameInput = document.getElementById('name');
const submitBtn = document.getElementById('submitBtn');

// --- EVENT: typing in the name box ---
nameInput.addEventListener('input', async () => {
    // reset existence state when typing
    state.pokemonExists = false;

    // load autocomplete names (non-blocking)
    if (!cachedNames) await loadAllPokemonNames();

    // schedule API existence check
    scheduleCheck();

    // show suggestions immediately (before debounce)
    showSuggestionsFor(nameInput.value, nameInput);
});

// --- EVENT: blur hides suggestions ---
nameInput.addEventListener('blur', () => {
    setTimeout(() => hideSuggestions(), 150);
});

// --- EVENT: window resize/scroll keeps suggestions aligned ---
window.addEventListener('resize', () => {
    showSuggestionsFor(nameInput.value, nameInput);
});

// --- FORM SUBMISSION HANDLER ---
attachFormSubmitHandler();

// --- INITIAL STATE UPDATE ---
updateSubmitState();