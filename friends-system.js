// ========================================
// STREAMANIA - Friends System
// Individual friends per user account
// ========================================

class FriendsSystem {
    constructor() {
        this.STORAGE_KEY = 'streamania_friends_data';
        this.friends = [];
        this.initialized = false;
        this.init();
    }
    
    init() {
        console.log('Friends system initialized');
        this.loadFriends();
        this.renderFriendsList();
        this.setupEventListeners();
        this.startActivitySimulation();
        this.initialized = true;
    }
    
    // ----------------------------------------
    // Data Management
    // ----------------------------------------
    
    getCurrentUserId() {
        const currentUser = window.authSystem?.currentUser;
        return currentUser?.id || 'guest';
    }
    
    getAllFriendsData() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }
    
    loadFriends() {
        const allData = this.getAllFriendsData();
        const userId = this.getCurrentUserId();
        
        // No default friends - start with empty list
        if (!allData[userId] || allData[userId].length === 0) {
            this.friends = [];
            this.saveFriends();
        } else {
            this.friends = allData[userId];
        }
    }
    
    saveFriends() {
        const allData = this.getAllFriendsData();
        const userId = this.getCurrentUserId();
        allData[userId] = this.friends;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
    }
    
    // No default friends - users must add friends manually
    // Each user starts with an empty friends list
    
    // ----------------------------------------
    // Friend Management
    // ----------------------------------------
    
    addFriend(username) {
        if (!username || username.trim().length < 2) {
            return { success: false, error: 'Le pseudo doit contenir au moins 2 caractères' };
        }
        
        username = username.trim();
        
        // Check if friend already exists
        if (this.friends.some(f => f.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: 'Cet ami est déjà dans votre liste' };
        }
        
        const newFriend = {
            id: 'friend_' + Date.now(),
            username: username,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            status: 'offline',
            activity: 'Hors ligne',
            addedAt: Date.now()
        };
        
        this.friends.push(newFriend);
        this.saveFriends();
        this.renderFriendsList();
        
        return { success: true, friend: newFriend };
    }
    
    removeFriend(friendId) {
        const friendIndex = this.friends.findIndex(f => f.id === friendId);
        if (friendIndex === -1) {
            return { success: false, error: 'Ami non trouvé' };
        }
        
        const removedFriend = this.friends[friendIndex];
        this.friends.splice(friendIndex, 1);
        this.saveFriends();
        this.renderFriendsList();
        
        return { success: true, friend: removedFriend };
    }
    
    updateFriendStatus(friendId, status, activity) {
        const friend = this.friends.find(f => f.id === friendId);
        if (friend) {
            friend.status = status;
            friend.activity = activity;
            this.saveFriends();
            this.renderFriendsList();
        }
    }
    
    // ----------------------------------------
    // UI Rendering
    // ----------------------------------------
    
    renderFriendsList() {
        const friendsList = document.getElementById('friendsList');
        if (!friendsList) return;
        
        // Check if user is logged in
        const isLoggedIn = this.getCurrentUserId() !== 'guest' && 
                         (window.authSystem?.currentUser || window.DiscordSystem?.isLoggedIn());
        
        if (!isLoggedIn) {
            friendsList.innerHTML = `
                <li class="no-friends-message">
                    <span>Connectez-vous pour voir vos amis</span>
                    <small>Créez un compte ou connectez-vous</small>
                </li>
            `;
            return;
        }
        
        // Sort: online first, then by name
        const sortedFriends = [...this.friends].sort((a, b) => {
            const statusOrder = { online: 0, away: 1, offline: 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            return a.username.localeCompare(b.username);
        });
        
        if (sortedFriends.length === 0) {
            friendsList.innerHTML = `
                <li class="no-friends-message">
                    <span>Aucun ami pour le moment</span>
                    <small>Cliquez sur + pour ajouter des amis</small>
                </li>
            `;
            return;
        }
        
        friendsList.innerHTML = sortedFriends.map(friend => this.renderFriendItem(friend)).join('');
        
        // Add event listeners to friend items
        friendsList.querySelectorAll('.friend-item').forEach(item => {
            const friendId = item.dataset.friendId;
            
            // Click to show profile
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.friend-remove-btn')) {
                    this.showFriendProfile(friendId);
                }
            });
            
            // Right click to show context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, friendId);
            });
        });
        
        // Update header count
        this.updateFriendsHeader();
    }
    
    renderFriendItem(friend) {
        const statusText = {
            online: 'En ligne',
            away: 'Absent',
            offline: 'Hors ligne'
        };
        
        return `
            <li class="friend-item" data-friend-id="${friend.id}">
                <div class="friend-avatar">
                    <img src="${friend.avatar}" alt="${friend.username}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=default'">
                    <span class="status-dot ${friend.status}"></span>
                </div>
                <div class="friend-info">
                    <span class="friend-name">${friend.username}</span>
                    <span class="friend-activity ${friend.status === 'offline' ? 'offline' : ''}">
                        ${friend.status === 'online' && friend.activity.startsWith('Regarde') ? 
                            `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>` : ''}
                        ${friend.activity}
                    </span>
                </div>
                <button class="friend-remove-btn" title="Retirer cet ami">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </li>
        `;
    }
    
    updateFriendsHeader() {
        const onlineCount = this.friends.filter(f => f.status === 'online').length;
        const totalCount = this.friends.length;
        
        const friendsTitle = document.querySelector('.friends-title');
        if (friendsTitle) {
            friendsTitle.textContent = `Amis (${onlineCount}/${totalCount})`;
        }
    }
    
    // ----------------------------------------
    // Modals & Dialogs
    // ----------------------------------------
    
    showAddFriendModal() {
        // Remove existing modal
        const existingModal = document.querySelector('.add-friend-modal-overlay');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'add-friend-modal-overlay auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal add-friend-modal-content">
                <button class="modal-close-btn">&times;</button>
                <h2 class="add-friend-title">Ajouter un ami</h2>
                <p class="add-friend-subtitle">Entrez le pseudo de votre ami pour l'ajouter</p>
                
                <form class="auth-form" id="addFriendForm">
                    <div class="form-group">
                        <label>Pseudo de l'ami</label>
                        <input type="text" id="friendUsername" placeholder="Ex: Naruto, Luffy, Goku..." required minlength="2" autofocus>
                    </div>
                    <div class="form-error" id="addFriendError"></div>
                    <button type="submit" class="btn btn-primary auth-submit">Ajouter</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Form submission
        document.getElementById('addFriendForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('friendUsername').value;
            
            const result = this.addFriend(username);
            if (result.success) {
                modal.remove();
                if (window.STREAMANIA) {
                    window.STREAMANIA.showToast(`${result.friend.username} ajouté à vos amis !`, 'success');
                }
            } else {
                document.getElementById('addFriendError').textContent = result.error;
            }
        });
        
        // Close modal
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.auth-modal').style.transform = 'translateY(0)';
        });
        
        // Focus input
        setTimeout(() => document.getElementById('friendUsername').focus(), 100);
    }
    
    showFriendProfile(friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        // Remove existing modal
        const existingModal = document.querySelector('.friend-profile-overlay');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'friend-profile-overlay auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal friend-profile-content">
                <button class="modal-close-btn">&times;</button>
                
                <div class="profile-header">
                    <div class="profile-avatar-container">
                        <img src="${friend.avatar}" alt="${friend.username}" class="profile-avatar">
                        <span class="status-indicator ${friend.status}"></span>
                    </div>
                    <h2 class="profile-username">${friend.username}</h2>
                    <span class="profile-status ${friend.status}">${this.getStatusText(friend.status)}</span>
                </div>
                
                <div class="friend-profile-info">
                    <div class="info-item">
                        <span class="info-label">Activité</span>
                        <span class="info-value">${friend.activity}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ami depuis</span>
                        <span class="info-value">${this.formatDate(friend.addedAt)}</span>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-secondary remove-friend-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <line x1="18" x2="23" y1="11" y2="11"></line>
                        </svg>
                        Retirer de mes amis
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove friend action
        modal.querySelector('.remove-friend-action').addEventListener('click', () => {
            if (confirm(`Êtes-vous sûr de vouloir retirer ${friend.username} de vos amis ?`)) {
                const result = this.removeFriend(friendId);
                modal.remove();
                if (result.success && window.STREAMANIA) {
                    window.STREAMANIA.showToast(`${friend.username} retiré de vos amis`, 'success');
                }
            }
        });
        
        // Close modal
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Animation
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.auth-modal').style.transform = 'translateY(0)';
        });
    }
    
    showContextMenu(e, friendId) {
        const friend = this.friends.find(f => f.id === friendId);
        if (!friend) return;
        
        // Remove existing menu
        const existingMenu = document.querySelector('.friend-context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'friend-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: var(--space-2);
            min-width: 180px;
            z-index: 1000;
            box-shadow: var(--shadow-xl);
        `;
        
        menu.innerHTML = `
            <div class="context-item" data-action="profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Voir le profil</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-item danger" data-action="remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Retirer</span>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Actions
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action === 'profile') {
                    this.showFriendProfile(friendId);
                } else if (action === 'remove') {
                    const result = this.removeFriend(friendId);
                    if (result.success && window.STREAMANIA) {
                        window.STREAMANIA.showToast(`${friend.username} retiré`, 'success');
                    }
                }
                menu.remove();
            });
        });
        
        // Close menu on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }
    
    // ----------------------------------------
    // Helpers
    // ----------------------------------------
    
    getStatusText(status) {
        const texts = {
            online: 'En ligne',
            away: 'Absent',
            offline: 'Hors ligne'
        };
        return texts[status] || status;
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
        
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    
    // ----------------------------------------
    // Activity Simulation
    // ----------------------------------------
    
    startActivitySimulation() {
        const activities = [
            'Regarde One Piece',
            'Regarde Demon Slayer',
            'Regarde Attack on Titan',
            'Regarde Jujutsu Kaisen',
            'Regarde Naruto',
            'Regarde Solo Leveling',
            'En ligne',
            'Absent',
            'Hors ligne'
        ];
        
        setInterval(() => {
            if (this.friends.length === 0) return;
            
            // Randomly update a friend's status
            const randomFriend = this.friends[Math.floor(Math.random() * this.friends.length)];
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            
            let newStatus = 'online';
            if (randomActivity === 'Absent') {
                newStatus = 'away';
                randomFriend.activity = 'Absent';
            } else if (randomActivity === 'Hors ligne') {
                newStatus = 'offline';
                randomFriend.activity = 'Hors ligne';
            } else {
                randomFriend.activity = randomActivity;
            }
            
            randomFriend.status = newStatus;
            this.saveFriends();
            this.renderFriendsList();
        }, 30000); // Every 30 seconds
    }
    
    // ----------------------------------------
    // Event Listeners
    // ----------------------------------------
    
    setupEventListeners() {
        // Add friend button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-friend-btn')) {
                this.showAddFriendModal();
            }
            
            // Remove friend inline button
            if (e.target.closest('.friend-remove-btn')) {
                e.stopPropagation();
                const friendItem = e.target.closest('.friend-item');
                const friendId = friendItem?.dataset.friendId;
                if (friendId) {
                    const friend = this.friends.find(f => f.id === friendId);
                    if (friend && confirm(`Retirer ${friend.username} de vos amis ?`)) {
                        const result = this.removeFriend(friendId);
                        if (result.success && window.STREAMANIA) {
                            window.STREAMANIA.showToast(`${friend.username} retiré`, 'success');
                        }
                    }
                }
            }
        });
        
        // Listen for auth changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'streamania_current_user') {
                this.loadFriends();
                this.renderFriendsList();
            }
        });
    }
    
    // ----------------------------------------
    // Public API
    // ----------------------------------------
    
    getFriends() {
        return [...this.friends];
    }
    
    getFriendById(id) {
        return this.friends.find(f => f.id === id);
    }
    
    getOnlineFriends() {
        return this.friends.filter(f => f.status === 'online');
    }
}

// Initialize friends system
const friendsSystem = new FriendsSystem();

// Export for other scripts
window.friendsSystem = friendsSystem;
