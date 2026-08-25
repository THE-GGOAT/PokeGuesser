// render-feedback.js

// Generation name → number mapping
const generationMap = {
    'generation-i': 1,
    'generation-ii': 2,
    'generation-iii': 3,
    'generation-iv': 4,
    'generation-v': 5,
    'generation-vi': 6,
    'generation-vii': 7,
    'generation-viii': 8,
    'generation-ix': 9
};

// Helper: create a single info box
function makeBox(label, value, opts = {}) {
    const div = document.createElement('div');
    div.className = 'info-box outlined';

    if (opts.first) {
        div.classList.remove('outlined');
        div.classList.add('first');
    }
    if (opts.match === true) div.classList.add('match-true');
    if (opts.match === false) div.classList.add('match-false');

    const lab = document.createElement('div');
    lab.className = 'label';
    lab.textContent = label;

    const val = document.createElement('div');
    val.className = 'value';
    val.innerHTML = value;

    div.appendChild(lab);
    div.appendChild(val);
    return div;
}

// --- EXPORT: main render function ---
export async function renderGuessFeedback(generatedPokemon, guessedPokemon) {
    const result = document.getElementById('guessResult');
    const spriteImg = document.getElementById('pokeSprite');
    const boxes = document.getElementById('infoBoxes');

    // show container
    result.style.display = '';

    // sprite: official artwork → front_default → empty
    const spriteUrl =
        guessedPokemon.sprites?.other?.['official-artwork']?.front_default ||
        guessedPokemon.sprites?.front_default ||
        '';

    spriteImg.src = spriteUrl;
    spriteImg.alt = guessedPokemon.name
        ? `Sprite of ${guessedPokemon.name}`
        : 'Pokémon sprite';

    // clear previous boxes
    boxes.innerHTML = '';

    // 1) Sprite label box (first, no outline)
    const firstBox = makeBox('Sprite', '', { first: true });
    boxes.appendChild(firstBox);

    // 2) Generation box
    const genA = generatedPokemon.generation;
    const genB = guessedPokemon.generation;

    const genANum = generationMap[genA] || null;
    const genBNum = generationMap[genB] || null;

    let genMatch = false;
    let genContent = genB
        ? `Gen ${genBNum || genB.replace('generation-', '')}`
        : 'Unknown';

    if (genANum && genBNum) {
        genMatch = genANum === genBNum;

        if (!genMatch) {
            const arrow = genANum > genBNum ? '→' : '←';
            genContent = `${genContent} <span class="gen-arrow">${arrow}</span>`;
        }
    }

    boxes.appendChild(makeBox('Generation', genContent, { match: genMatch }));

    // 3) Type 1 + Type 2 boxes
    const genTypes = generatedPokemon.types || [];
    const guessTypes = guessedPokemon.types || [];

    const genType1 = genTypes[0] || '';
    const genType2 = genTypes[1] || '';
    const guessType1 = guessTypes[0] || '';
    const guessType2 = guessTypes[1] || '';

    const type1Match =
        guessType1 &&
        genType1 &&
        guessType1.toLowerCase() === genType1.toLowerCase();

    boxes.appendChild(makeBox('Type 1', guessType1 || '—', { match: !!type1Match }));

    let type2Match = null;
    if (guessType2) {
        type2Match =
            genType2 &&
            guessType2.toLowerCase() === genType2.toLowerCase();
    }

    boxes.appendChild(makeBox('Type 2', guessType2 || '—', { match: type2Match }));

    // 4) Ability
    const guessAbility =
        guessedPokemon.abilities?.[0]?.name || '—';

    boxes.appendChild(makeBox('Ability', guessAbility));

    // 5) Height + Weight
    const height = guessedPokemon.height ?? '—';
    const weight = guessedPokemon.weight ?? '—';

    boxes.appendChild(makeBox('Height', String(height)));
    boxes.appendChild(makeBox('Weight', String(weight)));

    // Accessibility: allow screen readers to focus the box list
    boxes.setAttribute('tabindex', '-1');
    boxes.focus();
}