// ========================================
// STREAMANIA - Upcoming Page JavaScript
// ========================================

;(() => {
    const { showToast, LOCAL_DATA } = window.STREAMANIA || {}
  
    // Upcoming anime data
    const upcomingAnime = [
      {
        id: 201,
        title: "Solo Leveling Season 2",
        releaseDate: "Janvier 2026",
        description: "La suite tant attendue de Solo Leveling. Sung Jin-Woo continue son ascension vers le sommet.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
        genres: ["Action", "Fantasy", "Adventure"],
        rating: null,
        countdown: { days: 15, hours: 8, minutes: 32 },
        isHype: true,
      },
      {
        id: 202,
        title: "Chainsaw Man Part 2",
        releaseDate: "Mars 2026",
        description: "Denji revient pour de nouvelles aventures sanglantes dans la suite de Chainsaw Man.",
        image: "https://images.unsplash.com/photo-1639322537228-f710a51d72d7?w=400&h=600&fit=crop",
        genres: ["Action", "Horror", "Supernatural"],
        rating: null,
        countdown: { days: 75, hours: 12, minutes: 45 },
        isHype: true,
      },
      {
        id: 203,
        title: "Jujutsu Kaisen Season 3",
        releaseDate: "Avril 2026",
        description: "L'arc Culling Game continue avec des combats encore plus intenses.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
        genres: ["Action", "Supernatural", "Fantasy"],
        rating: null,
        countdown: { days: 105, hours: 6, minutes: 18 },
        isHype: true,
      },
      {
        id: 204,
        title: "Spy x Family Season 3",
        releaseDate: "Été 2026",
        description: "La famille Forger revient pour de nouvelles missions et aventures comiques.",
        image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&h=600&fit=crop",
        genres: ["Action", "Comedy", "Slice of Life"],
        rating: null,
        countdown: { days: 180, hours: 0, minutes: 0 },
        isHype: false,
      },
      {
        id: 205,
        title: "Demon Slayer: Infinity Castle",
        releaseDate: "2026",
        description: "L'arc final de Demon Slayer adapté en anime. Le combat ultime contre Muzan.",
        image: "https://images.unsplash.com/photo-1639322537502-d4d62c49a7c9?w=400&h=600&fit=crop",
        genres: ["Action", "Fantasy", "Adventure"],
        rating: null,
        countdown: { days: 250, hours: 0, minutes: 0 },
        isHype: true,
      },
      {
        id: 206,
        title: "Blue Lock Season 2",
        releaseDate: "Février 2026",
        description: "Le programme Blue Lock continue avec de nouveaux défis pour Isagi et ses rivaux.",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=600&fit=crop",
        genres: ["Sports", "Drama", "Action"],
        rating: null,
        countdown: { days: 45, hours: 10, minutes: 22 },
        isHype: false,
      },
    ]
  
    // Announcements data
    const announcements = [
      {
        id: 1,
        title: "One Piece Final Saga - Nouvelle Saison",
        date: "Il y a 2 jours",
        content: "Toei Animation a annoncé que la saga finale de One Piece sera adaptée en anime dès 2026.",
        type: "announcement",
      },
      {
        id: 2,
        title: "Studio MAPPA - Nouveaux Projets",
        date: "Il y a 5 jours",
        content: "MAPPA dévoile 3 nouveaux projets d'anime pour 2026, dont une nouvelle adaptation très attendue.",
        type: "news",
      },
      {
        id: 3,
        title: "Crunchyroll Anime Awards 2026",
        date: "Il y a 1 semaine",
        content: "Les nominations pour les Crunchyroll Anime Awards 2026 sont ouvertes. Votez pour vos favoris!",
        type: "event",
      },
    ]
  
    function renderUpcomingCard(anime) {
      const countdownHtml = anime.countdown
        ? `
        <div class="countdown-timer">
          <div class="countdown-item">
            <span class="countdown-value">${anime.countdown.days}</span>
            <span class="countdown-label">jours</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">${anime.countdown.hours}</span>
            <span class="countdown-label">heures</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">${anime.countdown.minutes}</span>
            <span class="countdown-label">min</span>
          </div>
        </div>
      `
        : ""
  
      return `
        <article class="upcoming-card ${anime.isHype ? "hype" : ""}" data-id="${anime.id}">
          <div class="upcoming-poster">
            <img src="${anime.image}" alt="${anime.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop'">
            <div class="upcoming-overlay">
              ${anime.isHype ? '<span class="hype-badge">HYPE</span>' : ""}
              <span class="release-badge">${anime.releaseDate}</span>
            </div>
          </div>
          <div class="upcoming-info">
            <h3 class="upcoming-title">${anime.title}</h3>
            <p class="upcoming-description">${anime.description}</p>
            <div class="upcoming-genres">
              ${anime.genres.map((g) => `<span class="genre-mini">${g}</span>`).join("")}
            </div>
            ${countdownHtml}
            <button class="notify-btn" data-id="${anime.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
              <span>Me notifier</span>
            </button>
          </div>
        </article>
      `
    }
  
    function renderAnnouncement(announcement) {
      const typeIcons = {
        announcement: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 8v6c0 3-2 5-5 5h-4c-3 0-5-2-5-5V8c0-3 2-5 5-5h4c3 0 5 2 5 5Z"/>
          <path d="M12 3v18"/>
        </svg>`,
        news: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
        </svg>`,
        event: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
        </svg>`,
      }
  
      return `
        <article class="announcement-card ${announcement.type}">
          <div class="announcement-icon">
            ${typeIcons[announcement.type]}
          </div>
          <div class="announcement-content">
            <h3 class="announcement-title">${announcement.title}</h3>
            <p class="announcement-text">${announcement.content}</p>
            <span class="announcement-date">${announcement.date}</span>
          </div>
        </article>
      `
    }
  
    function setupMobileMenu() {
      const sidebar = document.querySelector(".sidebar")
      const mobileMenuBtn = document.getElementById("mobileMenuBtn")
      const mobileOverlay = document.getElementById("mobileOverlay")
  
      if (!mobileMenuBtn || !mobileOverlay || !sidebar) return
  
      mobileMenuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open")
        mobileOverlay.classList.toggle("active")
        document.body.style.overflow = sidebar.classList.contains("open") ? "hidden" : ""
      })
  
      mobileOverlay.addEventListener("click", () => {
        sidebar.classList.remove("open")
        mobileOverlay.classList.remove("active")
        document.body.style.overflow = ""
      })
    }
  
    function renderFriendsList() {
      // Friends are now handled by friends-system.js
      // Don't use LOCAL_DATA.friends - use friendsSystem instead
      const friendsList = document.getElementById("friendsList")
      if (!friendsList) return

      // Check if user is logged in
      const isLoggedIn = window.authSystem?.currentUser || window.DiscordSystem?.isLoggedIn()
      
      if (!isLoggedIn) {
        friendsList.innerHTML = `
          <li class="no-friends-message">
            <span>Connectez-vous pour voir vos amis</span>
            <small>Créez un compte ou connectez-vous</small>
          </li>
        `
        return
      }

      // Use friendsSystem if available
      if (window.friendsSystem) {
        window.friendsSystem.renderFriendsList()
      } else {
        friendsList.innerHTML = `
          <li class="no-friends-message">
            <span>Aucun ami pour le moment</span>
            <small>Cliquez sur + pour ajouter des amis</small>
          </li>
        `
      }
    }
  
    function initUpcomingPage() {
      // Setup mobile menu
      setupMobileMenu()
  
      // Render upcoming anime
      const upcomingGrid = document.getElementById("upcomingGrid")
      if (upcomingGrid) {
        upcomingGrid.innerHTML = upcomingAnime.map((anime) => renderUpcomingCard(anime)).join("")
  
        // Add notify button handlers
        upcomingGrid.querySelectorAll(".notify-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation()
            btn.classList.toggle("active")
            if (btn.classList.contains("active")) {
              btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                <span>Notification activée</span>
              `
              if (showToast) showToast("Notification activée!", "success")
            } else {
              btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                <span>Me notifier</span>
              `
              if (showToast) showToast("Notification désactivée", "info")
            }
          })
        })
      }
  
      // Render announcements
      const announcementsGrid = document.getElementById("announcementsGrid")
      if (announcementsGrid) {
        announcementsGrid.innerHTML = announcements.map((a) => renderAnnouncement(a)).join("")
      }
  
      // Render friends list
      renderFriendsList()
  
      // Setup search if function exists
      if (window.STREAMANIA?.setupSearch) {
        window.STREAMANIA.setupSearch()
      }
    }
  
    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initUpcomingPage)
    } else {
      initUpcomingPage()
    }
  })()