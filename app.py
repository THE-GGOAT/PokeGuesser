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

def stats_bar_png(stats_dict):
    names = list(stats_dict.keys())
    vals = [stats_dict[n] for n in names]
    fig, ax = plt.subplots(figsize=(6,3))
    ax.barh(names, vals, color='tab:blue')
    ax.set_xlim(0, max(vals)+10)
    ax.set_xlabel('Base stat')
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
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
#randomly genrete a pokemon a pull data from the api https://pokeapi.co/api/v2/
#use the stat values of the randomly generated pokemon from the api and display them as a horizontal bar chart
#store the values of generation, type1, type2 (if it exists), heaight, weight, ability1, Ability2 (if it exists), Hidden_ability