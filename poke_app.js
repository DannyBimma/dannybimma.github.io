// Pokemon class
class Pokemon {
  constructor(name, id, types) {
    this.name = name;
    this.id = id;
    this.types = types;
  }
}

// PokedexAPI class
class PokedexAPI {
  constructor() {
    this.url = "https://pokeapi.co/api/v2";
    this.allPokemon = null;
  }

  // Hit up the PokéAPI
  async initialize() {
    try {
      const response = await fetch(`${this.url}/pokemon`);
      if (!response.ok) throw new Error("The API request failed at life 😔");
      const data = await response.json();
      this.allPokemon = data.count;
    } catch (error) {
      console.error("Pokécount came up short 😔:", error);
      this.allPokemon = 898; // Default to Gen if 8
    }
  }

  async getPokemon(pokemonId) {
    try {
      const response = await fetch(`${this.url}/pokemon/${pokemonId}`);
      if (!response.ok) throw new Error("Async Pokéball failed 😔");
      const data = await response.json();

      return new Pokemon(
        data.name.charAt(0).toUpperCase() + data.name.slice(1),
        data.id,
        data.types.map((t) => t.type.name)
      );
    } catch (error) {
      console.error(`Could not catch Pokemon data: ${error}`);
      return null;
    }
  }

  // Booster pack with DannyBimma cheat
  async loadBoosterPack(count, username) {
    const boosterPack = [];
    const includeMew = username === "DannyBimma";

    if (includeMew) {
      const mewPokemon = await this.getPokemon(151);
      if (mewPokemon) {
        boosterPack.push(mewPokemon);
      }
    }

    while (boosterPack.length < count) {
      const pokeId = Math.floor(Math.random() * this.allPokemon) + 1;
      const pokemon = await this.getPokemon(pokeId);
      if (pokemon && !boosterPack.some((p) => p.id === pokemon.id)) {
        boosterPack.push(pokemon);
      }
    }

    return boosterPack;
  }
}

// Display function
function displayPack(boosterPack) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<h2>🎊 Booster Pack Opened 🎊</h2><h3>You got:</h3>";

  boosterPack.forEach((pokemon) => {
    const typesStr = pokemon.types.join("/");
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.textContent = `${pokemon.name} (#${pokemon.id}) - Type: ${typesStr}`;
    resultsDiv.appendChild(card);
  });
}

// API
const api = new PokedexAPI();
api.initialize();

// Main
async function openBoosterPack() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    document.getElementById("results").innerHTML =
      '<p class="error">Please enter a username</p>';
    return;
  }

  const boosterPack = await api.loadBoosterPack(5, username);
  if (boosterPack.length > 0) {
    displayPack(boosterPack);
  } else {
    document.getElementById("results").innerHTML =
      '<p class="error">⛔️: Your Booster Pack was a dud, bud!! Do try again 🥹</p>';
  }
}

// Nav bar
function burgerMenu() {
  var x = document.getElementById("nav-bar");
  if (x.className === "nav") {
    x.className += " responsive";
  } else {
    x.className = "nav";
  }
}

// Get current year for footer
document.getElementById("currentYear").textContent = new Date().getFullYear();
