// suggestions.js

// --- STATE ---
let cachedNames = null;
let loadingNames = false;

export { cachedNames };

// --- DOM ELEMENT ---
const suggestionsBox = document.createElement('div');
suggestionsBox.id = 'nameSuggestions';
suggestionsBox.style.position = 'absolute';
suggestionsBox.style.zIndex = '1000';
suggestionsBox.style.background = '#fff';
suggestionsBox.style.border = '1px solid rgba(0,0,0,0.15)';
suggestionsBox.style.borderTop = '0';
suggestionsBox.style.borderRadius = '0 0 4px 4px';
suggestionsBox.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06)';
suggestionsBox.style.maxHeight = '240px';
suggestionsBox.style.overflow = 'auto';
suggestionsBox.style.display = 'none';
suggestionsBox.style.boxSizing = 'border-box';
suggestionsBox.setAttribute('role', 'listbox');
suggestionsBox.setAttribute('aria-label', 'Pokémon suggestions');

document.body.appendChild(suggestionsBox);

// --- EXPORT: load all names ---
export async function loadAllPokemonNames() {
    if (cachedNames || loadingNames) return;
    loadingNames = true;

    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
        if (!res.ok) {
            loadingNames = false;
            return;
        }
        const json = await res.json();
        cachedNames = (json.results || []).map(r => String(r.name).toLowerCase());
    } catch (e) {
        cachedNames = null;
    } finally {
        loadingNames = false;
    }
}

// --- EXPORT: hide suggestions ---
export function hideSuggestions() {
    suggestionsBox.style.display = 'none';
    suggestionsBox.innerHTML = '';
}

// --- EXPORT: show suggestions ---
export function showSuggestionsFor(value, nameInput) {
    const q = String(value || '').trim().toLowerCase();

    if (!q || !cachedNames || cachedNames.length === 0) {
        hideSuggestions();
        return;
    }

    const matches = [];
    for (let i = 0; i < cachedNames.length && matches.length < 8; i++) {
        const n = cachedNames[i];
        if (n.startsWith(q)) matches.push(n);
    }

    if (matches.length === 0) {
        hideSuggestions();
        return;
    }

    suggestionsBox.innerHTML = '';

    matches.forEach((name) => {
        const item = document.createElement('div');
        item.textContent = name;
        item.setAttribute('role', 'option');
        item.style.padding = '6px 10px';
        item.style.cursor = 'pointer';
        item.style.whiteSpace = 'nowrap';

        item.addEventListener('mousedown', (ev) => {
            ev.preventDefault();
            nameInput.value = name;
            hideSuggestions();
        });

        item.addEventListener('mouseover', () => {
            item.style.background = '#f5f5f5';
        });
        item.addEventListener('mouseout', () => {
            item.style.background = '';
        });

        suggestionsBox.appendChild(item);
    });

    const rect = nameInput.getBoundingClientRect();
    suggestionsBox.style.minWidth = rect.width + 'px';
    suggestionsBox.style.left = rect.left + window.scrollX + 'px';
    suggestionsBox.style.top = rect.bottom + window.scrollY + 'px';
    suggestionsBox.style.display = '';
}