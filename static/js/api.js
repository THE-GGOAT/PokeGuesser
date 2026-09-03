
// --- EXPORT: fetch Pokémon by ID ---
export async function fetchPokemonById(id) {
    try {
        // Prefer your server endpoint
        const resp = await fetch(`/pokemon/${id}`);
        if (resp.ok) {
            return await resp.json();
        }
    } catch (e) {
        // If server fails, fall back to PokeAPI
    }

    // Fallback to PokeAPI
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) {
        throw new Error('Failed to fetch Pokémon');
    }
    return await res.json();
}

// --- EXPORT: POST guess to your server ---
export async function postGuess(name) {
    const fd = new FormData();
    fd.append('name', name);

    const resp = await fetch('/play', {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
    });

    if (!resp.ok) {
        throw new Error('Server error');
    }

    const json = await resp.json();
    return json;
}