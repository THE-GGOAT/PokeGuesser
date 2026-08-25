import requests, random, io, json
import matplotlib.pyplot as plt
from flask import Flask, render_template, send_file, jsonify, request, session
import matplotlib.colors as mcolors
import matplotlib.patches as patches
import numpy as np
import os
import secrets



API = "https://pokeapi.co/api/v2"
app = Flask(__name__)

def generate_id():
    if "poke_id" not in session:
        session["poke_id"] = random.randint(1, 1010) # adjust upper bound as needed
    return session["poke_id"]
app.jinja_env.globals["poke_id"] = generate_id

def fetch_pokemon(poke_id):
    p = requests.get(f"{API}/pokemon/{poke_id}").json()
    s = requests.get(f"{API}/pokemon-species/{poke_id}").json()
    # stats: list of {stat: {name}, base_stat}
    stats = {item['stat']['name']: item['base_stat'] for item in p['stats']}
    types = [t['type']['name'] for t in p['types']]
    abilities = [{
        'name': a['ability']['name'],
        'is_hidden': a['is_hidden']
    } for a in p['abilities']]
    # species contains generation info
    generation = s.get('generation', {}).get('name')
    data = {
        'id': p['id'],
        'name': p['name'],
        'generation': generation,
        'types': types,
        'height': p['height'],
        'weight': p['weight'],
        'abilities': abilities,
        'stats': stats
    }
    return data

CANONICAL_ORDER = ['hp','attack','defense','special-attack','special-defense', 'speed',]  
def stats_bar_png(
    stats_dict,
    order=CANONICAL_ORDER,
    # Fractions of the 0..255 width used for layout (tweak to taste)
    name_col_frac=0.18,        # width reserved for the stat name column
    value_col_frac=0.08,       # width reserved for the stat value column
    name_value_gap_frac=0.02,  # extra gap between name and value columns
    value_bar_gap_frac=0.02,   # gap between value column and where bars start
    figsize=(6, 3),
    dpi=100
):
    """
    Draw horizontal stat bars on a fixed 0..255 scale.
    - Each stat has a filled faint rectangle (color) that extends to 255.
    - Left columns: Name (with semicolon) and Value (both black).
    - Bars start after the value column + a small gap.
    - Abbreviates special-attack/defense to Sp. Atk / Sp. Def.
    """

    # --- Prepare names and values (ordered) ---
    names = [n for n in order if n in stats_dict] or list(stats_dict.keys())
    vals = [int(stats_dict.get(n, 0)) for n in names]
    vals = [max(0, min(255, v)) for v in vals]  # clamp to 0..255

    # --- Colors per stat ---
    colors = {
        'hp': '#FF5959',
        'attack': '#F5AC78',
        'defense': '#FAE078',
        'special-attack': '#9DB7F5',
        'special-defense': '#A7DB8D',
        'speed': '#FA92B2'
    }

    # --- Fixed chart maximum (data units) ---
    rect_width = 255.0

    # --- Compute column widths in data units ---
    name_col_w = rect_width * float(name_col_frac)
    value_col_w = rect_width * float(value_col_frac)
    # gap between name and value columns (data units)
    name_value_gap = rect_width * float(name_value_gap_frac)
    # gap between value column and bar start (data units)
    value_bar_gap = rect_width * float(value_bar_gap_frac)

    # Where bars start (data units)
    bar_left = name_col_w + name_value_gap + value_col_w + value_bar_gap
    available_bar_width = rect_width - bar_left
    if available_bar_width <= 0:
        # fallback to ensure positive width
        bar_left = rect_width * 0.35
        available_bar_width = rect_width - bar_left

    n = len(names)
    y_pos = np.arange(n)[::-1]
    bar_height = 0.6

    # --- Create figure and axes ---
    fig, ax = plt.subplots(figsize=figsize, dpi=dpi)

    # Draw filled full-width rectangles first (so bars sit on top)
    for i, raw_name in enumerate(names):
        key = raw_name.lower()

        # Abbreviate special stats
        if key == 'special-attack':
            disp_name = 'Sp. Atk'
        elif key == 'special-defense':
            disp_name = 'Sp. Def'
        else:
            # remove hyphens and title-case other names
            disp_name = raw_name.replace('-', ' ').title()

        base_color = colors.get(key, '#888888')

        # faint fill color for the full-width rectangle (alpha controls faintness)
        rect_face = mcolors.to_rgba(base_color, alpha=0.12)
        rect_edge = mcolors.to_rgba(base_color, alpha=0.22)

        # Rectangle spans from x=0 to rect_width and centered on the y position
        rect = patches.Rectangle(
            (0, y_pos[i] - bar_height/2),
            rect_width,
            bar_height,
            linewidth=1.2,
            edgecolor=rect_edge,
            facecolor=rect_face,   # **filled** with faint color
            zorder=1,
            joinstyle='round'
        )
        ax.add_patch(rect)

        # Compute bar length proportional to 0..255 scale
        # (value maps directly to data units on the 0..255 scale)
        bar_len = (vals[i] / 255.0) * available_bar_width

        # Draw the filled bar on top, starting at bar_left
        ax.barh(y_pos[i], bar_len, left=bar_left, color=base_color,
                height=bar_height * 0.9, zorder=2)

        # Compose label pieces
        # Semicolon after the name as requested
        name_text = f"{disp_name}:"
        value_text = f"{vals[i]}"

        # Place name in the name column (left-aligned), black text
        name_x = name_col_w * 0.02  # small inset inside name column (data units)
        ax.text(
            name_x,
            y_pos[i],
            name_text,
            ha='left',
            va='center',
            fontsize=10,
            color='black',   # **black text**
            zorder=3,
            weight='semibold'
        )

        # Place value in the value column (right-aligned), black text
        value_x = name_col_w + name_value_gap + value_col_w * 0.98
        ax.text(
            value_x,
            y_pos[i],
            value_text,
            ha='right',
            va='center',
            fontsize=10,
            color='black',   # **black text**
            zorder=3,
            weight='semibold'
        )

    # --- Remove ticks, ticklines and spines so no stray dashes appear on the left ---
    ax.set_yticks(y_pos)
    ax.set_yticklabels([])            # hide default y labels (we draw our own)
    ax.xaxis.set_visible(False)
    ax.tick_params(axis='y', which='both', length=0)  # remove tick marks
    for spine in ('top', 'right', 'bottom', 'left'):
        ax.spines[spine].set_visible(False)

    
    

    # Set limits so rectangles and bars are fully visible
    ax.set_xlim(0, rect_width)
    ax.set_ylim(-0.5, n - 0.5)

    # Adjust margins so left columns aren't clipped
    plt.subplots_adjust(left=0.06, right=0.98, top=0.98, bottom=0.02)

    # Save to PNG buffer
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=dpi)
    buf.seek(0)
    plt.close(fig)
    return buf

app.secret_key = os.environ.get("FLASK_SECRET") or secrets.token_urlsafe(32)

def resolve_name_to_id(name):
    if not name:
        return None
    normalized = name.strip().lower()
    try:
        res = requests.get(f"{API}/pokemon/{requests.utils.requote_uri(normalized)}", timeout=5)
        if res.status_code == 404:
            return None
        res.raise_for_status()
        return int(res.json().get("id"))
    except requests.RequestException:
        return None
    
@app.before_request
def ensure_poke_id():
    if "poke_id" not in session:
        session["poke_id"] = random.randint(1, 1010)

@app.route("/random")
def random_pokemon():
    poke_id = session.get("poke_id")
    data = fetch_pokemon(poke_id)
    return jsonify(data)

@app.route("/random/chart")
def random_chart():
    poke_id = session.get("poke_id")
    data = fetch_pokemon(poke_id)
    img = stats_bar_png(data['stats'])
    return send_file(img, mimetype='image/png')

@app.route("/pokemon/<int:poke_id>")
def pokemon_proxy(poke_id):
    # return the raw PokeAPI pokemon object or a curated subset
    try:
        res = requests.get(f"{API}/pokemon/{poke_id}", timeout=5)
        res.raise_for_status()
        return jsonify(res.json())
    except requests.RequestException:
        return jsonify({"error":"failed"}), 502
    
@app.route("/", methods=['GET', 'POST'])
def index():
    poke_id = session.get("poke_id")
    if request.method == 'GET':
        return render_template("index.html", poke_id=poke_id)
    
    #POST: authoritative check
    name = request.form.get("name", "").strip()
    guessed_id = resolve_name_to_id(name)
    if guessed_id is None:
        payload = {"ok": True, "exists": False}
    else:
        payload = {
            "ok": True,
            "exists": True,
            "guessed_id": guessed_id,
            "actual_id": poke_id,
            "match": guessed_id == poke_id
        }

    # If client expects JSON (AJAX), return JSON; otherwise render template
    if request.headers.get("Accept") == "application/json" or request.is_json:
        return jsonify(payload)

    # fallback for non-AJAX form submit (optional)
    return render_template("index.html", poke_id=poke_id, **payload)



if __name__ == "__main__":
    app.run(debug=True)

#randomly genrete a pokemon a pull data from the api https://pokeapi.co/api/v2/
#use the stat values of the randomly generated pokemon from the api and display them as a horizontal bar chart
#store the values of generation, type1, type2 (if it exists), heaight, weight, ability1, Ability2 (if it exists), Hidden_ability


#what needs to be done
# the user inputted pokemon will have to be converted back into an id most likely in order for it to work with the api