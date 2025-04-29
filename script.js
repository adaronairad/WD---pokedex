const baseUrl = 'https://pokeapi.co/api/v2/';
const pokemonListEl = document.getElementById('pokemon-list');
const loadMoreBtn = document.getElementById('load-more');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const modal = document.getElementById('pokemon-modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalTypes = document.getElementById('modal-types');
const statsList = document.getElementById('modal-stats-list');
const closeModal = document.getElementById('close-modal');

const typeColors = {
  normal: 'bg-gray-400', fire: 'bg-orange-500', water: 'bg-blue-500', grass: 'bg-green-500',
  electric: 'bg-yellow-400', ice: 'bg-cyan-300', fighting: 'bg-red-700', poison: 'bg-purple-500',
  ground: 'bg-yellow-700', flying: 'bg-indigo-300', psychic: 'bg-pink-500', bug: 'bg-lime-500',
  rock: 'bg-stone-500', ghost: 'bg-indigo-700', dragon: 'bg-violet-700', dark: 'bg-gray-800',
  steel: 'bg-gray-600', fairy: 'bg-pink-300'
};

let offset = 0, limit = 20;
let allPokemon = [];

async function fetchPokemonList(offset, limit) {
  const res = await fetch(`${baseUrl}pokemon?offset=${offset}&limit=${limit}`);
  return (await res.json()).results;
}

async function fetchPokemonData(url) {
  const res = await fetch(url);
  return await res.json();
}

async function loadMorePokemon() {
  loadMoreBtn.textContent = 'Loading...';
  const list = await fetchPokemonList(offset, limit);
  for (const p of list) {
    const data = await fetchPokemonData(p.url);
    allPokemon.push(data);
    const card = createPokemonCard(data);
    pokemonListEl.appendChild(card);
  }
  offset += limit;
  loadMoreBtn.textContent = 'Load More';
}

function createPokemonCard(data) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer';

  const id = document.createElement('span');
  id.textContent = `#${data.id.toString().padStart(3, '0')}`;
  id.className = 'text-gray-500 text-sm mb-1';

  const img = document.createElement('img');
  img.src = data.sprites.other['official-artwork'].front_default;
  img.alt = data.name;
  img.className = 'w-20 h-20 mb-2';

  const name = document.createElement('h2');
  name.textContent = data.name;
  name.className = 'capitalize font-semibold mb-2';

  const types = document.createElement('div');
  types.className = 'flex gap-2';
  data.types.forEach(t => {
    const span = document.createElement('span');
    span.textContent = t.type.name;
    span.className = `text-xs text-white font-semibold px-2 py-1 rounded-full ${typeColors[t.type.name] || 'bg-gray-500'}`;
    types.appendChild(span);
  });

  card.appendChild(id);
  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(types);

  card.addEventListener('click', () => showModal(data));
  return card;
}

function showModal(data) {
  modalTitle.textContent = data.name;
  modalImage.src = data.sprites.other['official-artwork'].front_default;
  modalImage.alt = data.name;
  modalTypes.innerHTML = '';
  data.types.forEach(t => {
    const span = document.createElement('span');
    span.textContent = t.type.name;
    span.className = `text-xs text-white font-semibold px-2 py-1 rounded-full ${typeColors[t.type.name] || 'bg-gray-500'}`;
    modalTypes.appendChild(span);
  });

  statsList.innerHTML = '';
  data.stats.forEach(stat => {
    const li = document.createElement('li');
    li.className = 'flex justify-between text-gray-700';
    li.innerHTML = `<span class="capitalize font-medium">${stat.stat.name}</span><span>${stat.base_stat}</span>`;
    statsList.appendChild(li);
  });

  modal.classList.remove('hidden');
}

function filterAndSearchPokemon() {
  const keyword = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  pokemonListEl.innerHTML = '';
  const filtered = allPokemon.filter(p =>
    p.name.includes(keyword) &&
    (selectedType === '' || p.types.some(t => t.type.name === selectedType))
  );

  filtered.forEach(p => {
    pokemonListEl.appendChild(createPokemonCard(p));
  });
}

async function loadTypes() {
  const res = await fetch(`${baseUrl}type`);
  const data = await res.json();
  data.results.forEach(type => {
    const option = document.createElement('option');
    option.value = type.name;
    option.textContent = type.name;
    typeFilter.appendChild(option);
  });
}

// Listeners
loadMoreBtn.addEventListener('click', loadMorePokemon);
searchInput.addEventListener('input', filterAndSearchPokemon);
typeFilter.addEventListener('change', filterAndSearchPokemon);
closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

// Init
loadMorePokemon();
loadTypes();