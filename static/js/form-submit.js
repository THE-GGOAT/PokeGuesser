// form-submit.js

import { fetchPokemonById, postGuess } from './api.js';
import { renderGuessFeedback } from './render-feedback.js';
import { updateSubmitState } from './input-validation.js';

// Small helper for messages (taken from your original code)
function setMessage(text, kind = 'danger') {
    const messages = document.getElementById('formMessages');

    if (!text) {
        messages.innerHTML = '';
        return;
    }

    // escape HTML to avoid injection
    const safe = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    messages.innerHTML = `
        <div class="alert alert-${kind} py-2">${safe}</div>
    `;
}

// --- EXPORT: attach form submit handler ---
export function attachFormSubmitHandler() {
    const form = document.getElementById('itemForm');
    const nameInput = document.getElementById('name');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // extra safety: block submit if disabled
        if (submitBtn.disabled) {
            return;
        }

        const name = nameInput.value.trim();
        if (!name) return;

        try {
            // POST guess to server
            const json = await postGuess(name);

            if (!json.ok) {
                setMessage('Server error. Try again.', 'danger');
                return;
            }

            if (!json.exists) {
                setMessage('Pokémon not found.', 'warning');
                return;
            }

            // fetch full Pokémon data for both actual + guessed
            const [generatedPokemon, guessedPokemon] = await Promise.all([
                fetchPokemonById(json.actual_id),
                fetchPokemonById(json.guessed_id)
            ]);

            // render feedback boxes
            await renderGuessFeedback(generatedPokemon, guessedPokemon);

            // show match message
            if (json.match) {
                setMessage('Correct! You guessed the Pokémon.', 'success');
            } else {
                setMessage('Incorrect guess. Try again.', 'danger');
            }

        } catch (err) {
            setMessage('Network error. Please try again.', 'danger');
        }

        // update button state after submit
        updateSubmitState();
    });
}