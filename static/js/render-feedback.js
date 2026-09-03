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
    if (opts.match === 'wrong') div.classList.add('match-wrong');

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
    
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexDirection = 'row';
    row.style.alignItems = 'center';
    row.style.gap = '12px';

    // Box container for this guess
    const boxes = document.createElement('div');
    boxes.className = 'infoBoxes';
    wrapper.appendChild(boxes);

    row.appendChild(spriteImg);
    row.appendChild(boxes);
    wrapper.appendChild(row);
    // --- Generation ---
    const genA = generatedPokemon.generation_int;
    const genB = guessedPokemon.generation_int;

    let genMatch = false;
    let genContent = genB ? `Gen ${genB}` : 'Unknown';

    if (genA && genB) {
        genMatch = genA === genB;

        if (!genMatch) {
            const arrow = genA > genB ? '↑' : '↓';
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

    let type1Match = false;
    let type2Match = false;
    let type1WrongSlot = false;
    let type2WrongSlot = false;

    // Correct-slot matches
    if (guessType1 && genType1 &&
        guessType1.toLowerCase() === genType1.toLowerCase()) {
        type1Match = true;
    }

    if (guessType2 && genType2 &&
        guessType2.toLowerCase() === genType2.toLowerCase()) {
        type2Match = true;
    }

    // Wrong-slot matches (ORANGE)
    if (!type1Match && guessType1 && genType2 &&
        guessType1.toLowerCase() === genType2.toLowerCase()) {
        type1WrongSlot = true;
    }

    if (!type2Match && guessType2 && genType1 &&
        guessType2.toLowerCase() === genType1.toLowerCase()) {
        type2WrongSlot = true;
    }

    // Append boxes
    boxes.appendChild(makeBox(
        'Type 1',
        guessType1 || '—',
        {
            match: type1Match ? true : (type1WrongSlot ? 'wrong' : false)
        }
    ));

    boxes.appendChild(makeBox(
        'Type 2',
        guessType2 || '—',
        {
            match: type2Match ? true : (type2WrongSlot ? 'wrong' : false)
        }
    ));

  
    // --- Ability ---
    const genAbility = generatedPokemon.abilities?.[0]?.name || '—';
    const guessAbility = guessedPokemon.abilities?.[0]?.name || '—';

    const abilityMatch =
        genAbility !== '—' &&
        guessAbility !== '—' &&
        genAbility.toLowerCase() === guessAbility.toLowerCase();

    boxes.appendChild(makeBox(
        'Ability',
        guessAbility,
        { match: abilityMatch ? true : null }   // <-- no red
    ));


    // --- Height + Weight ---
    const genHeight = generatedPokemon.height != null ? generatedPokemon.height / 10 : null;
    const guessHeight = guessedPokemon.height != null ? guessedPokemon.height / 10 : null;

    let heightDisplay = guessHeight != null ? `${guessHeight}m` : '—';

    if (genHeight != null && guessHeight != null) {
        if (genHeight > guessHeight) {
            heightDisplay += ' <span class="gen-arrow">↑</span>';
        } else if (genHeight < guessHeight) {
            heightDisplay += ' <span class="gen-arrow">↓</span>';
        }
    }

    const genWeight = generatedPokemon.weight != null ? generatedPokemon.weight / 10 : null;
    const guessWeight = guessedPokemon.weight != null ? guessedPokemon.weight / 10 : null;

    let weightDisplay = guessWeight != null ? `${guessWeight}kg` : '—';

    if (genWeight != null && guessWeight != null) {
        if (genWeight > guessWeight) {
            weightDisplay += ' <span class="gen-arrow">↑</span>';
        } else if (genWeight < guessWeight) {
            weightDisplay += ' <span class="gen-arrow">↓</span>';
        }
    }

        boxes.appendChild(makeBox('Height', heightDisplay));
        boxes.appendChild(makeBox('Weight', weightDisplay));
        historyContainer.appendChild(wrapper);
    historyContainer.scrollTop = historyContainer.scrollHeight;
    
}