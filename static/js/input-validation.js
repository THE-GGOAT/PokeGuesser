// input-validation.js

// --- SHARED STATE (exported so main.js can read/write it) ---
export const state = {
    pokemonExists: false,
    checking: false,
    debounceTimer: null
};

// --- CONSTANTS ---
const DEBOUNCE_MS = 300;

// --- EXPORT: show spinner ---
export function showSpinner(show) {
    const nameSpinner = document.getElementById('nameSpinner');
    nameSpinner.style.display = show ? '' : 'none';
}

// --- EXPORT: update submit button state ---
export function updateSubmitState() {
    const submitBtn = document.getElementById('submitBtn');
    const nameInput = document.getElementById('name');

    if (state.checking) {
        submitBtn.disabled = true;
        return;
    }

    if (!nameInput.value.trim()) {
        submitBtn.disabled = true;
        return;
    }

    

    submitBtn.disabled = false;
}

// --- INTERNAL: check Pokémon existence ---
async function checkPokemon(name) {
    const normalized = name.trim().toLowerCase();
    const nameInput = document.getElementById('name');

    if (!normalized) {
        state.pokemonExists = false;
        state.checking = false;
        showSpinner(false);
        updateSubmitState();
        return;
    }

    state.checking = true;
    state.pokemonExists = false;
    showSpinner(true);
    updateSubmitState();

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(normalized)}`);

        if (res.ok) {
            const data = await res.json();
            const types = (data.types || [])
                .slice()
                .sort((a, b) => a.slot - b.slot)
                .map(t => t.type?.name || '');

            state.pokemonExists = true;
        } else {
            state.pokemonExists = false;
        }
    } catch (err) {
        state.pokemonExists = false;
    }

    state.checking = false;
    showSpinner(false);
    updateSubmitState();
}

// --- EXPORT: schedule the existence check (debounced) ---
export function scheduleCheck() {
    const nameInput = document.getElementById('name');

    if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
    }

    if (!nameInput.value.trim()) {
        state.pokemonExists = false;
        state.checking = false;
        showSpinner(false);
        updateSubmitState();
        return;
    }

    state.checking = true;
    showSpinner(true);
    updateSubmitState();

    state.debounceTimer = setTimeout(() => {
        checkPokemon(nameInput.value);
        state.debounceTimer = null;
    }, DEBOUNCE_MS);
}