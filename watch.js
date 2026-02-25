// ========================================
// STREAMANIA - Watch Page JavaScript
// ========================================

;(() => {
    const { STORAGE_KEYS, showToast, getFromStorage, addToList, removeFromList, isInList, LOCAL_DATA, saveToStorage } =
      window.STREAMANIA || {}
  
    // Get anime ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const animeId = Number.parseInt(urlParams.get("id")) || 1
  
    // Get anime data
    let currentAnime = getFromStorage(STORAGE_KEYS?.currentAnime) || null
  
    if (!currentAnime || currentAnime.id !== animeId) {
      // Find in local data
      const allAnime = [...(LOCAL_DATA?.recommendations || []), ...(LOCAL_DATA?.popular || [])]
      currentAnime = allAnime.find((a) => a.id === animeId) || allAnime[0]
    }
  
    // Episode data
    const episodes = generateEpisodes(currentAnime)
    let currentEpisode = 1
    const isPlaying = false
    let currentTime = 0
    const duration = 1440 // 24 minutes in seconds
    
    // Save continue watching data
    function saveContinueWatching() {
      if (!STORAGE_KEYS?.continueWatching || !currentAnime) return
      
      const continueList = getFromStorage(STORAGE_KEYS.continueWatching) || []
      const progress = Math.round((currentTime / duration) * 100)
      const timeLeft = duration - currentTime
      const minutesLeft = Math.floor(timeLeft / 60)
      const secondsLeft = Math.floor(timeLeft % 60)
      const timeLeftStr = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`
      
      // Find existing entry or create new one
      const existingIndex = continueList.findIndex(item => item.animeId === currentAnime.id)
      
      const continueItem = {
        id: existingIndex >= 0 ? continueList[existingIndex].id : Date.now(),
        animeId: currentAnime.id,
        title: currentAnime.title?.english || currentAnime.title?.romaji || currentAnime.title || 'Anime',
        episode: `Épisode ${currentEpisode}`,
        progress: Math.min(progress, 99), // Don't save as 100% (completed)
        timeLeft: timeLeftStr,
        image: currentAnime.image || currentAnime.coverImage?.large || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=240&h=140&fit=crop',
        lastWatched: Date.now()
      }
      
      if (existingIndex >= 0) {
        continueList[existingIndex] = continueItem
      } else {
        continueList.push(continueItem)
      }
      
      // Remove completed items (progress >= 95%)
      const filtered = continueList.filter(item => item.progress < 95)
      
      // Save to localStorage
      if (saveToStorage) {
        saveToStorage(STORAGE_KEYS.continueWatching, filtered)
      } else {
        try {
          localStorage.setItem(STORAGE_KEYS.continueWatching, JSON.stringify(filtered))
        } catch (e) {
          console.error('Error saving continue watching:', e)
        }
      }
    }
  
    function generateEpisodes(anime) {
      const count = anime?.episodes || 12
      const eps = []
      const titles = [
        "Le Commencement",
        "L'Éveil",
        "Premier Combat",
        "Nouvelle Force",
        "L'Entraînement",
        "La Rencontre",
        "Le Défi",
        "Révélation",
        "Alliance",
        "Le Secret",
        "Confrontation",
        "Dénouement",
        "Renaissance",
        "Le Choix",
        "Destin",
        "Lumière dans l'Ombre",
        "L'Héritage",
        "Tempête",
        "Sacrifice",
        "Victoire",
      ]
  
      for (let i = 1; i <= Math.min(count, 20); i++) {
        eps.push({
          number: i,
          title: titles[i - 1] || `Épisode ${i}`,
          description: `L'aventure continue dans cet épisode captivant de ${anime?.title || "la série"}.`,
          duration: "24:00",
          thumbnail: `https://images.unsplash.com/photo-${1578662996442 + i * 1000}-48f60103fc96?w=320&h=180&fit=crop`,
          progress: i === 1 ? 67 : 0,
        })
      }
      return eps
    }
  
    // Initialize page
    function initWatchPage() {
      if (!currentAnime) return
  
      // Update anime info
      updateAnimeInfo()
  
      // Render episodes
      renderEpisodes()
  
      // Render related anime
      renderRelatedAnime()
  
      // Setup player controls
      setupPlayerControls()
  
      // Setup action buttons
      setupActionButtons()
  
      // Setup season selector
      setupSeasonSelector()
  
      // Check if anime is in lists
      updateListButtonStates()
    }
  
    function updateAnimeInfo() {
      const title = currentAnime.title?.english || currentAnime.title?.romaji || currentAnime.title
  
      document.getElementById("animeName").textContent = title
      document.getElementById("animeSubtitle").textContent =
        currentAnime.title?.native || currentAnime.title?.romaji || ""
      document.getElementById("animeRating").textContent =
        currentAnime.rating || (currentAnime.averageScore / 10).toFixed(1)
      document.getElementById("animeYear").textContent = currentAnime.year || currentAnime.seasonYear || "2024"
      document.getElementById("animeStatus").textContent = currentAnime.status || "En cours"
      document.getElementById("animeTotalEpisodes").textContent = `${currentAnime.episodes || 12} épisodes`
      document.getElementById("animeDescription").textContent = currentAnime.description || "Description non disponible."
  
      // Update genres
      const genresContainer = document.getElementById("animeGenres")
      if (genresContainer && currentAnime.genres) {
        genresContainer.innerHTML = currentAnime.genres.map((g) => `<span class="genre-tag">${g}</span>`).join("")
      }
  
      // Update poster image
      const posterImage = document.getElementById("posterImage")
      if (posterImage) {
        posterImage.src =
          currentAnime.image ||
          currentAnime.coverImage?.extraLarge ||
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop"
      }
  
      // Update episode title
      document.getElementById("episodeTitle").textContent =
        `Épisode ${currentEpisode} - ${episodes[currentEpisode - 1]?.title || "Le Commencement"}`
    }
  
    function renderEpisodes() {
      const grid = document.getElementById("episodesGrid")
      if (!grid) return
  
      grid.innerHTML = episodes
        .map(
          (ep) => `
        <div class="episode-card ${ep.number === currentEpisode ? "current" : ""}" data-episode="${ep.number}">
          <div class="episode-thumbnail">
            <img src="${ep.thumbnail}" alt="Épisode ${ep.number}" onerror="this.src='https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=320&h=180&fit=crop'">
            <div class="episode-overlay">
              <div class="episode-play-icon">
                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>
            <span class="episode-number">EP ${ep.number}</span>
            <span class="episode-duration">${ep.duration}</span>
          </div>
          <div class="episode-info">
            <h3 class="episode-title-text">${ep.title}</h3>
            <p class="episode-description">${ep.description}</p>
          </div>
          ${ep.progress > 0 ? `<div class="episode-progress"><div class="episode-progress-bar" style="width: ${ep.progress}%"></div></div>` : ""}
        </div>
      `,
        )
        .join("")
  
      // Add click handlers
      grid.querySelectorAll(".episode-card").forEach((card) => {
        card.addEventListener("click", () => {
          const epNum = Number.parseInt(card.dataset.episode)
          playEpisode(epNum)
        })
      })
    }
  
    function renderRelatedAnime() {
      const grid = document.getElementById("relatedAnime")
      if (!grid || !LOCAL_DATA) return
  
      const related = LOCAL_DATA.recommendations.slice(0, 6)
      grid.innerHTML = related.map((anime) => window.STREAMANIA.renderAnimeCard(anime)).join("")
  
      // Add click handlers
      grid.querySelectorAll(".anime-card").forEach((card) => {
        card.addEventListener("click", () => {
          window.STREAMANIA.goToWatchPage(card.dataset.id)
        })
      })
    }
  
    function playEpisode(epNum) {
      // Save current progress before changing episode
      if (currentTime > 0) {
        saveContinueWatching()
      }
      
      currentEpisode = epNum
      currentTime = 0 // Reset time for new episode
  
      // Update UI
      document.querySelectorAll(".episode-card").forEach((card) => {
        card.classList.toggle("current", Number.parseInt(card.dataset.episode) === epNum)
      })
  
      document.getElementById("episodeTitle").textContent =
        `Épisode ${epNum} - ${episodes[epNum - 1]?.title || "Sans titre"}`
  
      // Simulate video play
      startPlaying()
      
      // Save new episode to continue watching
      saveContinueWatching()
  
      showToast(`Lecture de l'épisode ${epNum}`, "success")
    }
  
    function setupPlayerControls() {
      const videoPoster = document.getElementById("videoPoster")
      const videoElement = document.getElementById("videoElement")
      const playerControls = document.getElementById("playerControls")
      const bigPlayBtn = document.getElementById("bigPlayBtn")
      const playPauseBtn = document.getElementById("playPauseBtn")
      const progressBar = document.getElementById("progressBar")
      const progressFill = document.getElementById("progressFill")
      const progressHandle = document.getElementById("progressHandle")
      const currentTimeEl = document.getElementById("currentTime")
      const durationEl = document.getElementById("duration")
      const volumeBtn = document.getElementById("volumeBtn")
      const volumeSlider = document.getElementById("volumeSlider")
      const fullscreenBtn = document.getElementById("fullscreenBtn")
      const settingsBtn = document.getElementById("settingsBtn")
      const subtitlesBtn = document.getElementById("subtitlesBtn")
      const settingsDropdown = document.getElementById("settingsDropdown")
      const subtitlesDropdown = document.getElementById("subtitlesDropdown")
      const rewindBtn = document.getElementById("rewindBtn")
      const forwardBtn = document.getElementById("forwardBtn")
      const pipBtn = document.getElementById("pipBtn")
  
      // Big play button
      if (bigPlayBtn) {
        bigPlayBtn.addEventListener("click", startPlaying)
      }
  
      // Play/Pause
      if (playPauseBtn) {
        playPauseBtn.addEventListener("click", togglePlayPause)
      }
  
      // Progress bar
      if (progressBar) {
        progressBar.addEventListener("click", (e) => {
          const rect = progressBar.getBoundingClientRect()
          const percent = (e.clientX - rect.left) / rect.width
          currentTime = percent * duration
          updateProgress()
        })
      }
  
      // Volume
      if (volumeBtn) {
        volumeBtn.addEventListener("click", () => {
          const volumeHigh = volumeBtn.querySelector(".volume-high")
          const volumeMuted = volumeBtn.querySelector(".volume-muted")
          volumeHigh.classList.toggle("hidden")
          volumeMuted.classList.toggle("hidden")
        })
      }
  
      if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
          const value = e.target.value
          volumeSlider.style.setProperty("--volume-percent", `${value}%`)
        })
      }
  
      // Fullscreen
      if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", toggleFullscreen)
      }
  
      // Rewind/Forward
      if (rewindBtn) {
        rewindBtn.addEventListener("click", () => {
          currentTime = Math.max(0, currentTime - 10)
          updateProgress()
          showToast("-10 secondes", "info")
        })
      }
  
      if (forwardBtn) {
        forwardBtn.addEventListener("click", () => {
          currentTime = Math.min(duration, currentTime + 10)
          updateProgress()
          showToast("+10 secondes", "info")
        })
      }
  
      // PIP
      if (pipBtn) {
        pipBtn.addEventListener("click", async () => {
          try {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture()
            } else if (videoElement && document.pictureInPictureEnabled) {
              await videoElement.requestPictureInPicture()
            }
          } catch (err) {
            showToast("Picture-in-Picture non disponible", "error")
          }
        })
      }
  
      // Settings dropdown
      if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          settingsDropdown.classList.toggle("show")
          subtitlesDropdown?.classList.remove("show")
        })
  
        settingsDropdown.querySelectorAll(".dropdown-item").forEach((item) => {
          item.addEventListener("click", () => {
            const quality = item.dataset.quality
            if (quality) {
              settingsDropdown.querySelectorAll(".dropdown-item").forEach((i) => i.classList.remove("active"))
              item.classList.add("active")
              showToast(`Qualité: ${quality}`, "success")
            }
            settingsDropdown.classList.remove("show")
          })
        })
      }
  
      // Subtitles dropdown
      if (subtitlesBtn && subtitlesDropdown) {
        subtitlesBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          subtitlesDropdown.classList.toggle("show")
          settingsDropdown?.classList.remove("show")
        })
  
        subtitlesDropdown.querySelectorAll(".dropdown-item").forEach((item) => {
          item.addEventListener("click", () => {
            const subtitle = item.dataset.subtitle
            if (subtitle) {
              subtitlesDropdown.querySelectorAll(".dropdown-item").forEach((i) => i.classList.remove("active"))
              item.classList.add("active")
              showToast(`Sous-titres: ${subtitle === "off" ? "Désactivés" : subtitle}`, "success")
            }
            subtitlesDropdown.classList.remove("show")
          })
        })
      }
  
      // Close dropdowns on outside click
      document.addEventListener("click", () => {
        settingsDropdown?.classList.remove("show")
        subtitlesDropdown?.classList.remove("show")
      })
  
      // Keyboard controls
      document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT") return
  
        switch (e.key) {
          case " ":
          case "k":
            e.preventDefault()
            togglePlayPause()
            break
          case "ArrowLeft":
            currentTime = Math.max(0, currentTime - 10)
            updateProgress()
            break
          case "ArrowRight":
            currentTime = Math.min(duration, currentTime + 10)
            updateProgress()
            break
          case "f":
            toggleFullscreen()
            break
          case "m":
            volumeBtn?.click()
            break
        }
      })
  
      // Update duration display
      if (durationEl) {
        durationEl.textContent = formatTime(duration)
      }
    }
  
    let isCurrentlyPlaying = false
    let playInterval = null
  
    function startPlaying() {
      const videoPoster = document.getElementById("videoPoster")
      const videoElement = document.getElementById("videoElement")
      const bigPlayBtn = document.getElementById("bigPlayBtn")
      const playPauseBtn = document.getElementById("playPauseBtn")
  
      if (videoPoster) videoPoster.classList.add("hidden")
      if (bigPlayBtn) bigPlayBtn.classList.add("hidden")
      if (videoElement) {
        videoElement.classList.remove("hidden")
        videoElement.play().catch(() => {})
      }
  
      isCurrentlyPlaying = true
      updatePlayPauseIcon()
  
      // Simulate progress
      if (playInterval) clearInterval(playInterval)
      playInterval = setInterval(() => {
        if (isCurrentlyPlaying && currentTime < duration) {
          currentTime += 1
          updateProgress()
        }
      }, 1000)
    }
  
    function togglePlayPause() {
      isCurrentlyPlaying = !isCurrentlyPlaying
      updatePlayPauseIcon()
  
      const videoElement = document.getElementById("videoElement")
      if (videoElement) {
        if (isCurrentlyPlaying) {
          videoElement.play().catch(() => {})
          if (!playInterval) {
            playInterval = setInterval(() => {
              if (isCurrentlyPlaying && currentTime < duration) {
                currentTime += 1
                updateProgress()
              }
            }, 1000)
          }
        } else {
          videoElement.pause()
          if (playInterval) {
            clearInterval(playInterval)
            playInterval = null
          }
        }
      }
    }
  
    function updatePlayPauseIcon() {
      const playPauseBtn = document.getElementById("playPauseBtn")
      if (!playPauseBtn) return
  
      if (isCurrentlyPlaying) {
        playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
      } else {
        playPauseBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
      }
    }
  
    function updateProgress() {
      const progressFill = document.getElementById("progressFill")
      const progressHandle = document.getElementById("progressHandle")
      const currentTimeEl = document.getElementById("currentTime")
  
      const percent = (currentTime / duration) * 100
  
      if (progressFill) progressFill.style.width = `${percent}%`
      if (progressHandle) progressHandle.style.left = `${percent}%`
      if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime)
      
      // Save progress every 10 seconds
      if (Math.floor(currentTime) % 10 === 0 && currentTime > 0) {
        saveContinueWatching()
      }
    }
  
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }
  
    function toggleFullscreen() {
      const player = document.querySelector(".video-player")
      if (!player) return
  
      if (!document.fullscreenElement) {
        player.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen()
      }
    }
  
    function setupActionButtons() {
      const favoriteBtn = document.getElementById("favoriteBtn")
      const watchLaterBtn = document.getElementById("watchLaterBtn")
      const shareBtn = document.getElementById("shareBtn")
      const downloadBtn = document.getElementById("downloadBtn")
      const prevEpBtn = document.getElementById("prevEpisodeBtn")
      const nextEpBtn = document.getElementById("nextEpisodeBtn")
  
      if (favoriteBtn) {
        favoriteBtn.addEventListener("click", () => {
          if (isInList(STORAGE_KEYS.favorites, currentAnime.id)) {
            removeFromList(STORAGE_KEYS.favorites, currentAnime.id)
            favoriteBtn.classList.remove("active")
            showToast("Retiré des favoris", "info")
          } else {
            addToList(STORAGE_KEYS.favorites, currentAnime)
            favoriteBtn.classList.add("active")
            showToast("Ajouté aux favoris", "success")
          }
        })
      }
  
      if (watchLaterBtn) {
        watchLaterBtn.addEventListener("click", () => {
          if (isInList(STORAGE_KEYS.watchlist, currentAnime.id)) {
            removeFromList(STORAGE_KEYS.watchlist, currentAnime.id)
            watchLaterBtn.classList.remove("active")
            showToast('Retiré de "Voir plus tard"', "info")
          } else {
            addToList(STORAGE_KEYS.watchlist, currentAnime)
            watchLaterBtn.classList.add("active")
            showToast('Ajouté à "Voir plus tard"', "success")
          }
        })
      }
  
      if (shareBtn) {
        shareBtn.addEventListener("click", async () => {
          const url = window.location.href
          const title = currentAnime.title?.english || currentAnime.title?.romaji || currentAnime.title
  
          if (navigator.share) {
            try {
              await navigator.share({ title, url })
            } catch (err) {
              copyToClipboard(url)
            }
          } else {
            copyToClipboard(url)
          }
        })
      }
  
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          showToast("Téléchargement non disponible pour ce contenu", "error")
        })
      }
  
      if (prevEpBtn) {
        prevEpBtn.addEventListener("click", () => {
          if (currentEpisode > 1) {
            playEpisode(currentEpisode - 1)
          } else {
            showToast("Premier épisode", "info")
          }
        })
      }
  
      if (nextEpBtn) {
        nextEpBtn.addEventListener("click", () => {
          if (currentEpisode < episodes.length) {
            playEpisode(currentEpisode + 1)
          } else {
            showToast("Dernier épisode", "info")
          }
        })
      }
    }
  
    function copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("Lien copié !", "success")
        })
        .catch(() => {
          showToast("Impossible de copier le lien", "error")
        })
    }
  
    function updateListButtonStates() {
      const favoriteBtn = document.getElementById("favoriteBtn")
      const watchLaterBtn = document.getElementById("watchLaterBtn")
  
      if (favoriteBtn && isInList(STORAGE_KEYS.favorites, currentAnime.id)) {
        favoriteBtn.classList.add("active")
      }
  
      if (watchLaterBtn && isInList(STORAGE_KEYS.watchlist, currentAnime.id)) {
        watchLaterBtn.classList.add("active")
      }
    }
  
    function setupSeasonSelector() {
      const seasonDropdown = document.getElementById("seasonDropdown")
      if (!seasonDropdown) return
  
      seasonDropdown.addEventListener("change", (e) => {
        showToast(`Saison ${e.target.value} sélectionnée`, "success")
      })
    }
  
    // Save progress when leaving page
    window.addEventListener('beforeunload', () => {
      if (currentTime > 0) {
        saveContinueWatching()
      }
    })
    
    // Save progress when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && currentTime > 0) {
        saveContinueWatching()
      }
    })

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initWatchPage)
    } else {
      initWatchPage()
    }
  })()
  