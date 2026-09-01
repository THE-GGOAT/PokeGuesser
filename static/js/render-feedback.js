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

    if (!generatedPokemon || !guessedPokemon) {
    console.error("Missing Pokémon data:", generatedPokemon, guessedPokemon);
    return;
}
    // Instead of replacing the existing box list,
    // we create a NEW mini-window for each guess.
    const historyContainer = document.getElementById('guessHistory');

    // Create a wrapper window for this guess
    const wrapper = document.createElement('div');
    wrapper.className = 'guess-window';

    // Sprite + name
    const spriteImg = document.createElement('img');
    spriteImg.className = 'guess-sprite';
    spriteImg.src =
        guessedPokemon.sprites?.front_default ||
        '';
    spriteImg.alt = guessedPokemon.name
        ? `Sprite of ${guessedPokemon.name}`
        : 'Pokémon sprite';

    const spriteLabel = document.createElement('div');
    spriteLabel.className = 'sprite-label';
    spriteLabel.textContent = `Sprite of ${guessedPokemon.name}`;

    wrapper.appendChild(spriteLabel);
    wrapper.appendChild(spriteImg);

    // Box container for this guess
    const boxes = document.createElement('div');
    boxes.className = 'infoBoxes';
    wrapper.appendChild(boxes);

    // --- Generation ---
    const genA = generatedPokemon.generation_int;
    const genB = guessedPokemon.generation_int;

    let genMatch = false;
    let genContent = genB ? `Gen ${genB}` : 'Unknown';

    if (genA && genB) {
        genMatch = genA === genB;

        if (!genMatch) {
            const arrow = genA > genB ? '→' : '←';
            genContent = `${genContent} <span class="gen-arrow">${arrow}</span>`;
        }
    }

    boxes.appendChild(makeBox('Generation', genContent, { match: genMatch }));

    // --- Types ---
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

    // --- Ability ---
    const guessAbility = guessedPokemon.abilities?.[0]?.name || '—';
    boxes.appendChild(makeBox('Ability', guessAbility));


    // --- Height + Weight ---
    const heightMeters = guessedPokemon.height != null ? guessedPokemon.height / 10 : null;
    const height = heightMeters ?? '—';

    const weightKilograms = guessedPokemon.weight != null ? guessedPokemon.weight / 10 : null;
    const weight = weightKilograms ?? '—';

    boxes.appendChild(makeBox('Height', String(height)));
    boxes.appendChild(makeBox('Weight', String(weight)));

    // Add this guess window to the scrollable history
    historyContainer.appendChild(wrapper);

    // Scroll to bottom automatically
    historyContainer.scrollTop = historyContainer.scrollHeight;
}