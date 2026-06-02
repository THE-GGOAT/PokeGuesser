import requests, random, io, json
import matplotlib.pyplot as plt
from flask import Flask, send_file, jsonify

API = "https://pokeapi.co/api/v2"
app = Flask(__name__)

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

CANONICAL_ORDER = ['speed','special-defense', 'special-attack','defense','attack','hp']
def stats_bar_png(stats_dict, order=CANONICAL_ORDER, gap_frac=0.05, figsize=(6,3), dpi=100):
    # 1. Build ordered names and values
    names = [n for n in order if n in stats_dict] or list(stats_dict.keys())
    vals = [stats_dict[n] for n in names]

    # 2. Compute a gap (absolute value) to offset where bars start
    max_val = max(vals) if vals else 0
    gap = max_val * gap_frac if max_val > 0 else 1  # gap in same units as stats

    # 3. Create figure and axes
    fig, ax = plt.subplots(figsize=figsize, dpi=dpi)

    #    This makes a visible empty space between the left edge (labels/numbers) and the bar.
    ax.barh(names, vals, left=gap, color='tab:blue', height=0.6)

    # 5. Put the numeric value to the left of the bar (right-aligned)
    #    We place the text at x = gap * 0.9 (slightly left of the bar start).
    text_x = gap * 0.9 if gap > 0 else 0
    for y, v in zip(names, vals):
        ax.text(text_x, y, str(v), ha='right', va='center', fontsize=10, color='black')

    # 6. Remove x-axis ticks and labels and hide spines so the x-axis is invisible
    ax.xaxis.set_visible(False)
    for spine in ('top', 'right', 'bottom', 'left'):
        ax.spines[spine].set_visible(False)

    # 7. Optionally invert y so highest item appears at top (common for stat lists)
    ax.invert_yaxis()

    # 8. Adjust left margin so stat names and numbers have room
    #    Increase left margin if numbers or names are long.
    plt.subplots_adjust(left=0.30)

    # 9. Set x limits so bars are fully visible (bars start at gap and extend to gap + max_val)
    ax.set_xlim(0, gap + max_val * 1.05)

    # 10. Finalize and return PNG buffer
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    return buf

@app.route("/random")
def random_pokemon():
    poke_id = random.randint(1, 1010)  # adjust upper bound as needed
    data = fetch_pokemon(poke_id)
    return jsonify(data)

@app.route("/random/chart")
def random_chart():
    poke_id = random.randint(1, 1010)
    data = fetch_pokemon(poke_id)
    img = stats_bar_png(data['stats'])
    return send_file(img, mimetype='image/png')


if __name__ == "__main__":
    app.run(debug=True)

#randomly genrete a pokemon a pull data from the api https://pokeapi.co/api/v2/
#use the stat values of the randomly generated pokemon from the api and display them as a horizontal bar chart
#store the values of generation, type1, type2 (if it exists), heaight, weight, ability1, Ability2 (if it exists), Hidden_ability