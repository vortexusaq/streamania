// ========================================
// STREAMANIA - Pages JavaScript
// Catalogue, Favoris, Watchlater Pages
// ========================================

(function() {
    'use strict';
    
    // Wait for STREAMANIA to be available
    function waitForStreamania(callback) {
        if (window.STREAMANIA) {
            callback();
        } else {
            setTimeout(() => waitForStreamania(callback), 100);
        }
    }
    
    waitForStreamania(initPages);
    
    function initPages() {
        const { 
            STORAGE_KEYS, 
            LOCAL_DATA, 
            getFromStorage, 
            removeFromList, 
            showToast, 
            renderAnimeCard, 
            goToWatchPage,
            fetchFromAniList,
            ANILIST_QUERIES
        } = window.STREAMANIA;
        
        // Determine current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // ----------------------------------------
        // Catalogue Page
        // ----------------------------------------
        if (currentPage === 'catalogue.html') {
            initCataloguePage();
        }
        
        // ----------------------------------------
        // Favoris Page
        // ----------------------------------------
        if (currentPage === 'favoris.html') {
            initFavorisPage();
        }
        
        // ----------------------------------------
        // Watchlater Page
        // ----------------------------------------
        if (currentPage === 'watchlater.html') {
            initWatchlaterPage();
        }
        
        // ----------------------------------------
        // Catalogue Functions
        // ----------------------------------------
        async function initCataloguePage() {
            const catalogueGrid = document.getElementById('catalogueGrid');
            const genreFilter = document.getElementById('genreFilter');
            const yearFilter = document.getElementById('yearFilter');
            const sortFilter = document.getElementById('sortFilter');
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            
            if (!catalogueGrid) return;
            
            let allAnime = [...LOCAL_DATA.recommendations, ...LOCAL_DATA.popular];
            let currentPage = 1;
            
            // Try to fetch from API
            try {
                const trending = await fetchFromAniList(ANILIST_QUERIES.trending);
                const popular = await fetchFromAniList(ANILIST_QUERIES.popular);
                
                if (trending && popular) {
                    allAnime = [...trending, ...popular].map(anime => ({
                        id: anime.id,
                        title: anime.title?.english || anime.title?.romaji,
                        rating: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A',
                        year: anime.seasonYear,
                        episodes: anime.episodes,
                        image: anime.coverImage?.extraLarge || anime.coverImage?.large,
                        genres: anime.genres || [],
                        isNew: anime.seasonYear >= new Date().getFullYear() - 1
                    }));
                }
            } catch (e) {
                console.log('Using local data for catalogue');
            }
            
            // Remove duplicates
            allAnime = allAnime.filter((anime, index, self) => 
                index === self.findIndex(a => a.id === anime.id)
            );
            
            function renderCatalogue(animeList) {
                catalogueGrid.innerHTML = animeList.map(anime => renderAnimeCard(anime)).join('');
                setupCardClicks();
            }
            
            function setupCardClicks() {
                catalogueGrid.querySelectorAll('.anime-card').forEach(card => {
                    card.addEventListener('click', () => {
                        goToWatchPage(card.dataset.id);
                    });
                });
            }
            
            function filterAndSort() {
                let filtered = [...allAnime];
                
                // Genre filter
                const genre = genreFilter?.value;
                if (genre) {
                    filtered = filtered.filter(anime => 
                        anime.genres?.some(g => g.toLowerCase().includes(genre.toLowerCase()))
                    );
                }
                
                // Year filter
                const year = yearFilter?.value;
                if (year) {
                    if (year === 'older') {
                        filtered = filtered.filter(anime => anime.year < 2020);
                    } else {
                        filtered = filtered.filter(anime => anime.year == year);
                    }
                }
                
                // Sort
                const sort = sortFilter?.value;
                switch (sort) {
                    case 'rating':
                        filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
                        break;
                    case 'newest':
                        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
                        break;
                    case 'alphabetical':
                        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                        break;
                    default: // popularity - keep original order
                        break;
                }
                
                return filtered;
            }
            
            // Event listeners for filters
            [genreFilter, yearFilter, sortFilter].forEach(filter => {
                if (filter) {
                    filter.addEventListener('change', () => {
                        renderCatalogue(filterAndSort());
                    });
                }
            });
            
            // Load more button
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', async () => {
                    loadMoreBtn.textContent = 'Chargement...';
                    
                    // Simulate loading more
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    showToast('Tous les animes sont affichés', 'success');
                    loadMoreBtn.style.display = 'none';
                });
            }
            
            // Initial render
            renderCatalogue(allAnime);
        }
        
        // ----------------------------------------
        // Favoris Functions
        // ----------------------------------------
        function initFavorisPage() {
            const favorisGrid = document.getElementById('favorisGrid');
            const emptyState = document.getElementById('emptyState');
            const favorisCount = document.getElementById('favorisCount');
            
            if (!favorisGrid) return;
            
            function loadFavoris() {
                const favoris = getFromStorage(STORAGE_KEYS.favorites);
                
                if (favorisCount) {
                    favorisCount.textContent = favoris.length;
                }
                
                if (favoris.length === 0) {
                    if (emptyState) emptyState.classList.remove('hidden');
                    favorisGrid.classList.add('hidden');
                } else {
                    if (emptyState) emptyState.classList.add('hidden');
                    favorisGrid.classList.remove('hidden');
                    
                    favorisGrid.innerHTML = favoris.map(anime => 
                        renderAnimeCard(anime, true) // true = show remove button
                    ).join('');
                    
                    setupFavorisInteractions();
                }
            }
            
            function setupFavorisInteractions() {
                // Card clicks
                favorisGrid.querySelectorAll('.anime-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.remove-btn')) return;
                        goToWatchPage(card.dataset.id);
                    });
                });
                
                // Remove buttons
                favorisGrid.querySelectorAll('.remove-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const animeId = parseInt(btn.dataset.id);
                        removeFromList(STORAGE_KEYS.favorites, animeId);
                        showToast('Retiré des favoris', 'success');
                        loadFavoris();
                    });
                });
            }
            
            loadFavoris();
        }
        
        // ----------------------------------------
        // Watchlater Functions
        // ----------------------------------------
        function initWatchlaterPage() {
            const watchlaterGrid = document.getElementById('watchlaterGrid');
            const emptyState = document.getElementById('emptyState');
            const watchlaterCount = document.getElementById('watchlaterCount');
            
            if (!watchlaterGrid) return;
            
            function loadWatchlater() {
                const watchlist = getFromStorage(STORAGE_KEYS.watchlist);
                
                if (watchlaterCount) {
                    watchlaterCount.textContent = watchlist.length;
                }
                
                if (watchlist.length === 0) {
                    if (emptyState) emptyState.classList.remove('hidden');
                    watchlaterGrid.classList.add('hidden');
                } else {
                    if (emptyState) emptyState.classList.add('hidden');
                    watchlaterGrid.classList.remove('hidden');
                    
                    watchlaterGrid.innerHTML = watchlist.map(anime => 
                        renderAnimeCard(anime, true) // true = show remove button
                    ).join('');
                    
                    setupWatchlaterInteractions();
                }
            }
            
            function setupWatchlaterInteractions() {
                // Card clicks
                watchlaterGrid.querySelectorAll('.anime-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        if (e.target.closest('.remove-btn')) return;
                        goToWatchPage(card.dataset.id);
                    });
                });
                
                // Remove buttons
                watchlaterGrid.querySelectorAll('.remove-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const animeId = parseInt(btn.dataset.id);
                        removeFromList(STORAGE_KEYS.watchlist, animeId);
                        showToast('Retiré de votre liste', 'success');
                        loadWatchlater();
                    });
                });
            }
            
            loadWatchlater();
        }
        
        // ----------------------------------------
        // Mobile Menu Setup (for all pages)
        // ----------------------------------------
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const sidebar = document.querySelector('.sidebar');
        
        if (mobileMenuBtn && mobileOverlay && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                mobileOverlay.classList.toggle('active');
                document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
            });
            
            mobileOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    }
})();
