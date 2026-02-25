// ========================================
// STREAMANIA - Anime Streaming Platform
// Main JavaScript Application avec AniList API
// ========================================

// ----------------------------------------
// Configuration API
// ----------------------------------------

const API_CONFIG = {
  anilistURL: "https://graphql.anilist.co",
  placeholderImage: "https://placehold.co/600x400/1a1a2e/8b5cf6?text=STREAMANIA",
  fallbackImages: {
    anime: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
    category: "https://images.unsplash.com/photo-1618331833071-1c0c6ee3d19e?w=300&h=225&fit=crop",
    avatar: "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?w=80&h=80&fit=crop",
  },
}

// ----------------------------------------
// Local Storage Keys
// ----------------------------------------
const STORAGE_KEYS = {
  favorites: "streamania_favorites",
  watchlist: "streamania_watchlist",
  continueWatching: "streamania_continue",
  currentAnime: "streamania_current_anime",
}

// ----------------------------------------
// GraphQL Queries pour AniList
// ----------------------------------------

const ANILIST_QUERIES = {
  trending: `
    query {
      Page(page: 1, perPage: 10) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          id
          title { romaji english native }
          coverImage { extraLarge large medium color }
          bannerImage
          averageScore
          seasonYear
          episodes
          format
          genres
          description
        }
      }
    }
  `,
  popular: `
    query {
      Page(page: 1, perPage: 10) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          id
          title { romaji english native }
          coverImage { extraLarge large medium color }
          bannerImage
          averageScore
          seasonYear
          episodes
          format
          genres
          description
        }
      }
    }
  `,
  search: `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME, isAdult: false) {
          id
          title { romaji english native }
          coverImage { extraLarge large medium color }
          bannerImage
          averageScore
          seasonYear
          episodes
          format
          genres
          description
        }
      }
    }
  `,
  getAnime: `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        coverImage { extraLarge large medium color }
        bannerImage
        averageScore
        seasonYear
        episodes
        format
        genres
        description
        status
        duration
      }
    }
  `,
}

// ----------------------------------------
// Données locales
// ----------------------------------------

const LOCAL_DATA = {
  recommendations: [
    {
      id: 1,
      title: "Demon Slayer: Kimetsu no Yaiba",
      rating: 9.0,
      year: "2019",
      episodes: 55,
      image: "https://images.unsplash.com/photo-1639322537502-d4d62c49a7c9?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Action", "Fantasy", "Adventure"],
      description:
        "Tanjiro Kamado, un jeune garçon au cœur pur, voit sa vie basculer lorsque sa famille est massacrée par des démons.",
    },
    {
      id: 2,
      title: "Jujutsu Kaisen",
      rating: 9.1,
      year: "2020",
      episodes: 48,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Action", "Supernatural", "Fantasy"],
      description:
        "Yuji Itadori rejoint une organisation secrète de sorciers pour tuer une puissante malédiction nommée Ryomen Sukuna.",
    },
    {
      id: 3,
      title: "Attack on Titan",
      rating: 9.5,
      year: "2013",
      episodes: 94,
      image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Action", "Drama", "Fantasy"],
      description:
        "L'humanité vit retranchée derrière d'énormes murs pour se protéger des Titans, de gigantesques créatures humanoïdes.",
    },
    {
      id: 4,
      title: "Spy x Family",
      rating: 8.8,
      year: "2022",
      episodes: 37,
      image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Action", "Comedy", "Slice of Life"],
      description:
        "Un espion, une assassin et une télépathe forment une fausse famille pour accomplir leurs missions secrètes.",
    },
    {
      id: 5,
      title: "Chainsaw Man",
      rating: 8.9,
      year: "2022",
      episodes: 12,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Action", "Horror", "Supernatural"],
      description: "Denji, un jeune homme qui fusionne avec son démon tronçonneuse, devient un chasseur de démons.",
    },
    {
      id: 6,
      title: "My Hero Academia",
      rating: 8.7,
      year: "2016",
      episodes: 138,
      image: "https://images.unsplash.com/photo-1639322537502-d4d62c49a7c9?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Action", "Comedy", "Superhero"],
      description:
        "Dans un monde où 80% de la population possède des superpouvoirs, Izuku Midoriya rêve de devenir un héros.",
    },
    {
      id: 7,
      title: "One Piece",
      rating: 9.2,
      year: "1999",
      episodes: 1100,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Action", "Adventure", "Comedy"],
      description: "Monkey D. Luffy et son équipage de pirates partent à la recherche du trésor ultime, le One Piece.",
    },
    {
      id: 8,
      title: "Vinland Saga",
      rating: 9.1,
      year: "2019",
      episodes: 48,
      image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Action", "Adventure", "Drama"],
      description: "Thorfinn, fils d'un grand guerrier viking, cherche à venger la mort de son père.",
    },
  ],
  popular: [
    {
      id: 9,
      title: "Solo Leveling",
      rating: 9.7,
      year: "2024",
      episodes: 12,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Action", "Fantasy", "Adventure"],
      description:
        "Sung Jin-Woo, le chasseur le plus faible de l'humanité, acquiert un pouvoir mystérieux qui lui permet de monter en niveau.",
    },
    {
      id: 10,
      title: "Frieren: Beyond Journey's End",
      rating: 9.3,
      year: "2023",
      episodes: 28,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Fantasy", "Adventure", "Drama"],
      description:
        "Frieren, une elfe magicienne, entreprend un voyage pour comprendre les humains après la mort de ses compagnons.",
    },
    {
      id: 11,
      title: "Oshi no Ko",
      rating: 9.0,
      year: "2023",
      episodes: 11,
      image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Drama", "Mystery", "Supernatural"],
      description:
        "Un médecin réincarné en enfant d'une idol explore les coulisses sombres de l'industrie du divertissement japonais.",
    },
    {
      id: 12,
      title: "Mushoku Tensei",
      rating: 8.7,
      year: "2021",
      episodes: 35,
      image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Fantasy", "Drama", "Adventure"],
      description:
        "Un homme sans emploi se réincarne dans un monde fantastique et décide de vivre sa nouvelle vie sans regrets.",
    },
    {
      id: 13,
      title: "Bocchi the Rock!",
      rating: 8.8,
      year: "2022",
      episodes: 12,
      image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300&h=450&fit=crop",
      isNew: true,
      genres: ["Comedy", "Music", "Slice of Life"],
      description:
        "Hitori Gotoh, une guitariste solitaire et anxieuse, rejoint un groupe de rock et apprend à s'ouvrir aux autres.",
    },
    {
      id: 14,
      title: "Mob Psycho 100",
      rating: 8.9,
      year: "2016",
      episodes: 37,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Action", "Comedy", "Supernatural"],
      description:
        "Shigeo Kageyama, dit Mob, est un collégien aux pouvoirs psychiques immenses qui tente de vivre normalement.",
    },
    {
      id: 15,
      title: "Haikyuu!!",
      rating: 8.9,
      year: "2014",
      episodes: 85,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Sports", "Comedy", "Drama"],
      description: "Shoyo Hinata, malgré sa petite taille, rêve de devenir un as du volleyball.",
    },
    {
      id: 16,
      title: "Death Note",
      rating: 9.0,
      year: "2006",
      episodes: 37,
      image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=300&h=450&fit=crop",
      isNew: false,
      genres: ["Mystery", "Psychological", "Thriller"],
      description: "Light Yagami trouve un cahier permettant de tuer quiconque dont le nom y est inscrit.",
    },
  ],
  // continueWatching is now managed dynamically and saved per user in localStorage
  // No hardcoded continue watching data - users must watch episodes to populate this
  categories: [
    {
      id: 1,
      name: "Action",
      count: 567,
      image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=300&h=225&fit=crop",
      icon: "⚔️",
    },
    {
      id: 2,
      name: "Fantasy",
      count: 342,
      image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=300&h=225&fit=crop",
      icon: "🧙",
    },
    {
      id: 3,
      name: "Romance",
      count: 234,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=225&fit=crop",
      icon: "💖",
    },
    {
      id: 4,
      name: "Sci-Fi",
      count: 189,
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=225&fit=crop",
      icon: "🚀",
    },
    {
      id: 5,
      name: "Comedy",
      count: 423,
      image: "https://images.unsplash.com/photo-1618331833071-1c0c6ee3d19e?w=300&h=225&fit=crop",
      icon: "😂",
    },
    {
      id: 6,
      name: "Drama",
      count: 312,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=225&fit=crop",
      icon: "🎭",
    },
    {
      id: 7,
      name: "Mystery",
      count: 156,
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=225&fit=crop",
      icon: "🕵️",
    },
    {
      id: 8,
      name: "Sports",
      count: 98,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=225&fit=crop",
      icon: "⚽",
    },
  ],
  // Friends are now managed by friends-system.js and stored per user in localStorage
  // No hardcoded friends - each user starts with an empty friends list
  heroSlides: [
    {
      id: 1,
      title: "DANDADAN",
      titleSub: "ダンダダン",
      rating: "9.2",
      year: "2024",
      episodes: "12 Épisodes",
      description: "Une histoire palpitante mêlant fantômes, extraterrestres et romance adolescente.",
      tags: ["Action", "Comédie", "Surnaturel", "Romance"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=500&fit=crop",
    },
    {
      id: 9,
      title: "SOLO LEVELING",
      titleSub: "俺だけレベルアップな件",
      rating: "9.7",
      year: "2024",
      episodes: "12 Épisodes",
      description:
        "Le chasseur le plus faible de l'humanité acquiert un pouvoir mystérieux lui permettant de monter en niveau.",
      tags: ["Action", "Fantasy", "Adventure"],
      image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=1200&h=500&fit=crop",
    },
    {
      id: 10,
      title: "FRIEREN",
      titleSub: "葬送のフリーレン",
      rating: "9.3",
      year: "2023",
      episodes: "28 Épisodes",
      description:
        "Une elfe magicienne entreprend un voyage pour comprendre l'humanité après la mort de ses compagnons.",
      tags: ["Fantasy", "Adventure", "Drama"],
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=500&fit=crop",
    },
    {
      id: 3,
      title: "ATTACK ON TITAN",
      titleSub: "進撃の巨人",
      rating: "9.5",
      year: "2013",
      episodes: "94 Épisodes",
      description: "L'humanité vit retranchée derrière d'énormes murs pour se protéger des Titans.",
      tags: ["Action", "Drama", "Fantasy"],
      image: "https://images.unsplash.com/photo-1639322537502-d4d62c49a7c9?w=1200&h=500&fit=crop",
    },
  ],
}

// ----------------------------------------
// DOM Elements
// ----------------------------------------

const elements = {
  recommendations: document.getElementById("recommendations"),
  popularAnime: document.getElementById("popularAnime"),
  continueWatching: document.getElementById("continueWatching"),
  categories: document.getElementById("categories"),
  friendsList: document.getElementById("friendsList"),
  heroParticles: document.getElementById("heroParticles"),
  searchInput: document.getElementById("searchInput"),
  searchResults: document.getElementById("searchResults"),
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  mobileOverlay: document.getElementById("mobileOverlay"),
  toastContainer: document.getElementById("toastContainer"),
  recScrollLeft: document.getElementById("recScrollLeft"),
  recScrollRight: document.getElementById("recScrollRight"),
  popScrollLeft: document.getElementById("popScrollLeft"),
  popScrollRight: document.getElementById("popScrollRight"),
}

// ----------------------------------------
// Utilitaires
// ----------------------------------------

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error("Error saving to storage:", e)
  }
}

function isInList(listKey, animeId) {
  const list = getFromStorage(listKey)
  return list.some((item) => item.id === animeId)
}

function addToList(listKey, anime) {
  const list = getFromStorage(listKey)
  if (!list.some((item) => item.id === anime.id)) {
    list.push(anime)
    saveToStorage(listKey, list)
    return true
  }
  return false
}

function removeFromList(listKey, animeId) {
  const list = getFromStorage(listKey)
  const filtered = list.filter((item) => item.id !== animeId)
  saveToStorage(listKey, filtered)
}

// ----------------------------------------
// Fonctions de rendu
// ----------------------------------------

function renderAnimeCard(anime, showRemoveBtn = false) {
  const imageUrl =
    anime.image || anime.coverImage?.extraLarge || anime.coverImage?.large || API_CONFIG.fallbackImages.anime
  const rating = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : anime.rating
  const title = anime.title?.english || anime.title?.romaji || anime.title
  const year = anime.seasonYear || anime.year
  const episodes = anime.episodes || anime.episodeCount

  return `
    <article class="anime-card" data-id="${anime.id}" tabindex="0" role="button" aria-label="Voir ${title}">
      ${
        showRemoveBtn
          ? `
        <button class="remove-btn" data-id="${anime.id}" title="Retirer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `
          : ""
      }
      <div class="anime-poster">
        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='${API_CONFIG.fallbackImages.anime}'">
        <div class="anime-poster-overlay"></div>
        <div class="anime-rating">
          <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>${rating}</span>
        </div>
        ${anime.isNew ? '<span class="anime-new-badge">New</span>' : ""}
        <div class="anime-play-btn">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </div>
      <div class="anime-info">
        <h3 class="anime-title">${title}</h3>
        <div class="anime-meta">
          <span>${year}</span>
          <span class="anime-meta-divider"></span>
          <span>${episodes ? `${episodes} épisodes` : "Film"}</span>
        </div>
      </div>
    </article>
  `
}

function renderContinueCard(item) {
  return `
    <article class="continue-card" data-id="${item.id}" data-anime-id="${item.animeId}" tabindex="0" role="button" aria-label="Continuer ${item.title}">
      <div class="continue-thumbnail">
        <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='${API_CONFIG.fallbackImages.anime}'">
        <div class="continue-play-overlay">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </div>
      </div>
      <div class="continue-info">
        <h3 class="continue-title">${item.title}</h3>
        <p class="continue-episode">${item.episode}</p>
        <div class="continue-progress">
          <div class="continue-progress-bar" style="width: ${item.progress}%"></div>
        </div>
      </div>
      <span class="continue-time">${item.timeLeft} restant</span>
    </article>
  `
}

function renderCategoryCard(category) {
  return `
    <article class="category-card" data-id="${category.id}" data-name="${category.name}" tabindex="0" role="button" aria-label="Explorer ${category.name}">
      <div class="category-image">
        <img src="${category.image}" alt="${category.name}" loading="lazy" onerror="this.src='${API_CONFIG.fallbackImages.category}'">
        <div class="category-overlay"></div>
        <div class="category-icon">${category.icon}</div>
        <span class="category-count">${category.count} animes</span>
      </div>
      <div class="category-info">
        <h3 class="category-name">${category.name}</h3>
      </div>
    </article>
  `
}

function renderFriendItem(friend) {
  return `
    <li class="friend-item" data-id="${friend.id}">
      <div class="friend-avatar">
        <img src="${friend.avatar}" alt="${friend.name}" loading="lazy" onerror="this.src='${API_CONFIG.fallbackImages.avatar}'">
        <span class="status-dot ${friend.status}"></span>
      </div>
      <div class="friend-info">
        <span class="friend-name">${friend.name}</span>
        <span class="friend-activity ${friend.watching ? "" : "offline"}">
          ${friend.watching ? `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>` : ""}
          ${friend.activity}
        </span>
      </div>
    </li>
  `
}

function renderSearchResult(anime) {
  const title = anime.title?.english || anime.title?.romaji || anime.title
  const image = anime.coverImage?.medium || anime.image || API_CONFIG.fallbackImages.anime
  const year = anime.seasonYear || anime.year || ""

  return `
    <div class="search-result-item" data-id="${anime.id}">
      <img src="${image}" alt="${title}">
      <div class="search-result-info">
        <div class="search-result-title">${title}</div>
        <div class="search-result-meta">${year} • ${anime.episodes || "?"} épisodes</div>
      </div>
    </div>
  `
}

// ----------------------------------------
// API Functions
// ----------------------------------------

async function fetchFromAniList(query, variables = {}) {
  try {
    const response = await fetch(API_CONFIG.anilistURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    return data.data?.Page?.media || data.data?.Media || []
  } catch (error) {
    console.error("Error fetching from AniList:", error)
    return null
  }
}

async function loadTrendingAnime() {
  const anime = await fetchFromAniList(ANILIST_QUERIES.trending)

  if (anime && elements.recommendations) {
    elements.recommendations.innerHTML = anime
      .map((a) =>
        renderAnimeCard({
          ...a,
          image: a.coverImage?.extraLarge || a.coverImage?.large,
          rating: (a.averageScore / 10).toFixed(1),
          year: a.seasonYear,
          isNew: a.seasonYear >= new Date().getFullYear() - 1,
        }),
      )
      .join("")
  } else if (elements.recommendations) {
    elements.recommendations.innerHTML = LOCAL_DATA.recommendations.map((a) => renderAnimeCard(a)).join("")
  }
}

async function loadPopularAnime() {
  const anime = await fetchFromAniList(ANILIST_QUERIES.popular)

  if (anime && elements.popularAnime) {
    elements.popularAnime.innerHTML = anime
      .map((a) =>
        renderAnimeCard({
          ...a,
          image: a.coverImage?.extraLarge || a.coverImage?.large,
          rating: (a.averageScore / 10).toFixed(1),
          year: a.seasonYear,
          isNew: a.seasonYear >= new Date().getFullYear() - 1,
        }),
      )
      .join("")
  } else if (elements.popularAnime) {
    elements.popularAnime.innerHTML = LOCAL_DATA.popular.map((a) => renderAnimeCard(a)).join("")
  }
}

// ----------------------------------------
// UI Interactions
// ----------------------------------------

function createParticles() {
  if (!elements.heroParticles) return
  elements.heroParticles.innerHTML = ""

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div")
    particle.className = "hero-particle"
    particle.style.left = `${Math.random() * 100}%`
    particle.style.animationDelay = `${Math.random() * 15}s`
    particle.style.animationDuration = `${15 + Math.random() * 10}s`
    particle.style.opacity = `${0.3 + Math.random() * 0.4}`
    elements.heroParticles.appendChild(particle)
  }
}

function setupCarouselControls(container, leftBtn, rightBtn) {
  if (!container || !leftBtn || !rightBtn) return

  const scrollAmount = 400

  leftBtn.addEventListener("click", () => container.scrollBy({ left: -scrollAmount, behavior: "smooth" }))
  rightBtn.addEventListener("click", () => container.scrollBy({ left: scrollAmount, behavior: "smooth" }))

  const updateButtons = debounce(() => {
    const { scrollLeft, scrollWidth, clientWidth } = container
    leftBtn.disabled = scrollLeft <= 0
    rightBtn.disabled = scrollLeft + clientWidth >= scrollWidth - 10
  }, 100)

  container.addEventListener("scroll", updateButtons)
  updateButtons()
}

function setupMobileMenu() {
  const sidebar = document.querySelector(".sidebar")
  if (!elements.mobileMenuBtn || !elements.mobileOverlay || !sidebar) return

  elements.mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open")
    elements.mobileOverlay.classList.toggle("active")
    document.body.style.overflow = sidebar.classList.contains("open") ? "hidden" : ""
  })

  elements.mobileOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open")
    elements.mobileOverlay.classList.remove("active")
    document.body.style.overflow = ""
  })
}

function searchLocalData(query) {
  const lowerQuery = query.toLowerCase()
  const allAnime = [...LOCAL_DATA.recommendations, ...LOCAL_DATA.popular]
  
  return allAnime.filter(anime => {
    const title = (anime.title?.english || anime.title?.romaji || anime.title || '').toLowerCase()
    const genres = (anime.genres || []).join(' ').toLowerCase()
    return title.includes(lowerQuery) || genres.includes(lowerQuery)
  }).slice(0, 10)
}

function setupSearch() {
  if (!elements.searchInput) return

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      elements.searchInput.focus()
    }
    if (e.key === "Escape") {
      elements.searchInput.blur()
      if (elements.searchResults) elements.searchResults.classList.remove("active")
    }
  })

  elements.searchInput.addEventListener(
    "input",
    debounce(async (e) => {
      const query = e.target.value.trim()
      if (query.length > 1) {
        // Show loading state
        if (elements.searchResults) {
          elements.searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-info"><div class="search-result-title">Recherche en cours...</div></div></div>'
          elements.searchResults.classList.add("active")
        }
        
        // Try AniList API first
        let results = await fetchFromAniList(ANILIST_QUERIES.search, { search: query })
        
        // Fallback to local search if API fails or returns nothing
        if (!results || results.length === 0) {
          results = searchLocalData(query)
        }
        
        if (results && results.length > 0 && elements.searchResults) {
          elements.searchResults.innerHTML = results.map(anime => {
            // Normalize the anime object for rendering
            const normalized = {
              id: anime.id,
              title: anime.title?.english || anime.title?.romaji || anime.title,
              image: anime.coverImage?.medium || anime.image || API_CONFIG.fallbackImages.anime,
              year: anime.seasonYear || anime.year,
              episodes: anime.episodes
            }
            return renderSearchResult(normalized)
          }).join("")
          elements.searchResults.classList.add("active")

          // Add click handlers to results
          elements.searchResults.querySelectorAll(".search-result-item").forEach((item) => {
            item.addEventListener("click", () => {
              const animeId = item.dataset.id
              goToWatchPage(animeId)
              elements.searchResults.classList.remove("active")
              elements.searchInput.value = ''
            })
          })
        } else if (elements.searchResults) {
          elements.searchResults.innerHTML =
            '<div class="search-result-item"><div class="search-result-info"><div class="search-result-title">Aucun résultat pour "' + query + '"</div><div class="search-result-meta">Essayez un autre terme</div></div></div>'
          elements.searchResults.classList.add("active")
        }
      } else if (elements.searchResults) {
        elements.searchResults.classList.remove("active")
      }
    }, 300),
  )

  // Hide results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container") && elements.searchResults) {
      elements.searchResults.classList.remove("active")
    }
  })
}

function showToast(message, type = "success") {
  if (!elements.toastContainer) return

  const toast = document.createElement("div")
  toast.className = "toast"
  toast.innerHTML = `
    <svg class="toast-icon ${type}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${
        type === "success"
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line>'
      }
    </svg>
    <span class="toast-message">${message}</span>
  `

  elements.toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slide-in 0.3s ease-out reverse"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

function goToWatchPage(animeId) {
  // Find anime data
  const allAnime = [...LOCAL_DATA.recommendations, ...LOCAL_DATA.popular]
  const anime = allAnime.find((a) => a.id == animeId)

  if (anime) {
    saveToStorage(STORAGE_KEYS.currentAnime, anime)
  }

  window.location.href = `watch.html?id=${animeId}`
}

function setupCardInteractions() {
  // Anime cards
  document.querySelectorAll(".anime-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".remove-btn")) return
      const animeId = card.dataset.id
      goToWatchPage(animeId)
    })

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        card.click()
      }
    })
  })

  // Continue watching cards
  document.querySelectorAll(".continue-card").forEach((card) => {
    card.addEventListener("click", () => {
      const animeId = card.dataset.animeId
      goToWatchPage(animeId)
    })
  })

  // Category cards
  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const categoryName = card.dataset.name
      window.location.href = `catalogue.html?genre=${encodeURIComponent(categoryName.toLowerCase())}`
    })
  })
}

function setupHeroSlider() {
  const dots = document.querySelectorAll(".hero-nav-dot")
  const heroSection = document.getElementById("heroSection")
  const slides = LOCAL_DATA.heroSlides
  let currentSlide = 0
  let autoplayInterval

  function updateHero(index) {
    const slide = slides[index]
    if (!slide) return

    // Update content
    const titleEl = document.getElementById("heroTitle")
    const titleSubEl = document.getElementById("heroTitleSub")
    const ratingEl = document.getElementById("heroRating")
    const yearEl = document.getElementById("heroYear")
    const episodesEl = document.getElementById("heroEpisodes")
    const descEl = document.getElementById("heroDescription")
    const tagsEl = document.getElementById("heroTags")
    const bgImage = document.getElementById("heroBgImage")

    if (titleEl) titleEl.textContent = slide.title
    if (titleSubEl) titleSubEl.textContent = slide.titleSub
    if (ratingEl) ratingEl.textContent = slide.rating
    if (yearEl) yearEl.textContent = slide.year
    if (episodesEl) episodesEl.textContent = slide.episodes
    if (descEl) descEl.textContent = slide.description
    if (tagsEl) tagsEl.innerHTML = slide.tags.map((t) => `<span class="tag">${t}</span>`).join("")
    if (bgImage) bgImage.src = slide.image

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index)
    })

    // Reset progress bar
    const progressBar = document.getElementById("heroProgressBar")
    if (progressBar) {
      progressBar.style.animation = "none"
      progressBar.offsetHeight // Trigger reflow
      progressBar.style.animation = "progress-fill 8s linear"
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length
    updateHero(currentSlide)
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 8000)
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval)
  }

  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index
      updateHero(currentSlide)
      stopAutoplay()
      startAutoplay()
    })
  })

  // Hero watch button
  const heroWatchBtn = document.getElementById("heroWatchBtn")
  if (heroWatchBtn) {
    heroWatchBtn.addEventListener("click", () => {
      const slide = slides[currentSlide]
      goToWatchPage(slide.id)
    })
  }

  // Hero add to list button
  const heroAddListBtn = document.getElementById("heroAddListBtn")
  if (heroAddListBtn) {
    heroAddListBtn.addEventListener("click", () => {
      const slide = slides[currentSlide]
      const anime = LOCAL_DATA.recommendations.find((a) => a.id === slide.id) ||
        LOCAL_DATA.popular.find((a) => a.id === slide.id) || {
          id: slide.id,
          title: slide.title,
          rating: slide.rating,
          year: slide.year,
          image: slide.image,
        }

      if (addToList(STORAGE_KEYS.watchlist, anime)) {
        showToast(`${slide.title} ajouté à votre liste !`, "success")
      } else {
        showToast(`${slide.title} est déjà dans votre liste`, "error")
      }
    })
  }

  // Hero favorite button
  const heroFavBtn = document.getElementById("heroFavBtn")
  if (heroFavBtn) {
    heroFavBtn.addEventListener("click", () => {
      const slide = slides[currentSlide]
      const anime = LOCAL_DATA.recommendations.find((a) => a.id === slide.id) ||
        LOCAL_DATA.popular.find((a) => a.id === slide.id) || {
          id: slide.id,
          title: slide.title,
          rating: slide.rating,
          year: slide.year,
          image: slide.image,
        }

      if (addToList(STORAGE_KEYS.favorites, anime)) {
        showToast(`${slide.title} ajouté aux favoris !`, "success")
        heroFavBtn.classList.add("active")
      } else {
        removeFromList(STORAGE_KEYS.favorites, anime.id)
        showToast(`${slide.title} retiré des favoris`, "success")
        heroFavBtn.classList.remove("active")
      }
    })
  }

  // Pause on hover
  if (heroSection) {
    heroSection.addEventListener("mouseenter", stopAutoplay)
    heroSection.addEventListener("mouseleave", startAutoplay)
  }

  // Start autoplay
  startAutoplay()
}

// ----------------------------------------
// Initialisation
// ----------------------------------------

async function init() {
  try {
    // Render static content first
    if (elements.continueWatching) {
      // Check localStorage first for real continue watching data
      const savedContinueWatching = getFromStorage(STORAGE_KEYS.continueWatching)
      
      if (savedContinueWatching && savedContinueWatching.length > 0) {
        // Use saved data from localStorage
        elements.continueWatching.innerHTML = savedContinueWatching.map(renderContinueCard).join("")
        
        // Update count dynamically
        const continueCount = document.getElementById('continueCount')
        if (continueCount) {
          const count = savedContinueWatching.length
          continueCount.textContent = `${count} ${count === 1 ? 'épisode' : 'épisodes'}`
        }
      } else {
        // Hide the section if user hasn't watched anything
        const continueSection = document.querySelector('.continue-watching-section')
        if (continueSection) {
          continueSection.style.display = 'none'
        }
      }
    }

    if (elements.categories) {
      elements.categories.innerHTML = LOCAL_DATA.categories.map(renderCategoryCard).join("")
    }

    // Friends list is handled by friends-system.js
    // Only show friends if user is logged in
    if (elements.friendsList) {
      // Check if user is logged in
      const isLoggedIn = window.authSystem?.currentUser || window.DiscordSystem?.isLoggedIn();
      
      if (isLoggedIn && window.friendsSystem) {
        // Friends will be rendered by friendsSystem.init()
        if (!window.friendsSystem.initialized) {
          window.friendsSystem.renderFriendsList();
        }
      } else {
        // Show empty state or hide friends section if not logged in
        elements.friendsList.innerHTML = '<li class="no-friends-message"><span>Connectez-vous pour voir vos amis</span></li>';
      }
    }

    // Load dynamic content from API
    await Promise.all([loadTrendingAnime(), loadPopularAnime()])

    // Setup UI
    createParticles()
    setupMobileMenu()
    setupSearch()
    setupHeroSlider()

    setupCarouselControls(elements.recommendations, elements.recScrollLeft, elements.recScrollRight)
    setupCarouselControls(elements.popularAnime, elements.popScrollLeft, elements.popScrollRight)

    setTimeout(setupCardInteractions, 100)

    setTimeout(() => {
      showToast("Bienvenue sur STREAMANIA !", "success")
    }, 1000)
  } catch (error) {
    console.error("Initialization error:", error)
    showToast("Erreur de chargement, utilisation des données locales", "error")

    if (elements.recommendations) {
      elements.recommendations.innerHTML = LOCAL_DATA.recommendations.map((a) => renderAnimeCard(a)).join("")
    }
    if (elements.popularAnime) {
      elements.popularAnime.innerHTML = LOCAL_DATA.popular.map((a) => renderAnimeCard(a)).join("")
    }
  }
}

// Start application
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}

// Export for other pages
window.STREAMANIA = {
  API_CONFIG,
  LOCAL_DATA,
  STORAGE_KEYS,
  showToast,
  getFromStorage,
  saveToStorage,
  addToList,
  removeFromList,
  isInList,
  renderAnimeCard,
  goToWatchPage,
  fetchFromAniList,
  ANILIST_QUERIES,
}
