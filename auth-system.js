// ========================================
// STREAMANIA - Authentication System
// Local Storage Based Auth with Profile Management
// ========================================

class AuthSystem {
    constructor() {
        this.STORAGE_KEYS = {
            currentUser: 'streamania_current_user',
            users: 'streamania_users',
            userFriends: 'streamania_user_friends'
        };
        
        this.currentUser = this.getCurrentUser();
        this.init();
    }
    
    init() {
        // Initialize default users if none exist
        if (!this.getUsers().length) {
            this.createDefaultUsers();
        }
        
        // Update UI based on auth state
        this.updateUI();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // ----------------------------------------
    // User Management
    // ----------------------------------------
    
    createDefaultUsers() {
        const defaultUsers = [
            {
                id: 'user_001',
                username: 'Vortex',
                email: 'vortex@streamania.com',
                password: 'demo123',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
                plan: 'Premium',
                createdAt: Date.now(),
                friends: ['friend_001', 'friend_002']
            }
        ];
        
        localStorage.setItem(this.STORAGE_KEYS.users, JSON.stringify(defaultUsers));
    }
    
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.users)) || [];
        } catch {
            return [];
        }
    }
    
    saveUsers(users) {
        localStorage.setItem(this.STORAGE_KEYS.users, JSON.stringify(users));
    }
    
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.currentUser));
        } catch {
            return null;
        }
    }
    
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.STORAGE_KEYS.currentUser, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.STORAGE_KEYS.currentUser);
        }
        this.currentUser = user;
    }
    
    // ----------------------------------------
    // Authentication
    // ----------------------------------------
    
    register(username, email, password) {
        const users = this.getUsers();
        
        // Check if username or email already exists
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
        }
        
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Cet email est déjà utilisé' };
        }
        
        // Validate password
        if (password.length < 6) {
            return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            username: username,
            email: email,
            password: password, // In a real app, this would be hashed
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            plan: 'Free',
            createdAt: Date.now(),
            friends: []
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        // Auto login
        this.setCurrentUser(newUser);
        this.updateUI();
        
        return { success: true, user: newUser };
    }
    
    login(usernameOrEmail, password) {
        const users = this.getUsers();
        
        const user = users.find(u => 
            (u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
             u.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
            u.password === password
        );
        
        if (user) {
            this.setCurrentUser(user);
            this.updateUI();
            return { success: true, user: user };
        }
        
        return { success: false, error: 'Identifiants incorrects' };
    }
    
    logout() {
        this.setCurrentUser(null);
        this.updateUI();
        window.location.reload();
    }
    
    // ----------------------------------------
    // Profile Management
    // ----------------------------------------
    
    updateProfile(updates) {
        if (!this.currentUser) return { success: false, error: 'Non connecté' };
        
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) return { success: false, error: 'Utilisateur non trouvé' };
        
        // Check username uniqueness if changing
        if (updates.username && updates.username !== this.currentUser.username) {
            if (users.some(u => u.username.toLowerCase() === updates.username.toLowerCase() && u.id !== this.currentUser.id)) {
                return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
            }
        }
        
        // Update user
        const updatedUser = { ...users[userIndex], ...updates };
        users[userIndex] = updatedUser;
        
        this.saveUsers(users);
        this.setCurrentUser(updatedUser);
        this.updateUI();
        
        return { success: true, user: updatedUser };
    }
    
    changeAvatar(avatarUrl) {
        return this.updateProfile({ avatar: avatarUrl });
    }
    
    // ----------------------------------------
    // UI Updates
    // ----------------------------------------
    
    updateUI() {
        const user = this.currentUser;
        
        // Update user name display
        const userNameEl = document.querySelector('.user-name');
        if (userNameEl) {
            userNameEl.textContent = user ? user.username : 'Invité';
        }
        
        // Update user plan display
        const userPlanEl = document.querySelector('.user-plan');
        if (userPlanEl) {
            userPlanEl.textContent = user ? `${user.plan} Member` : 'Non connecté';
        }
        
        // Update avatar
        const userAvatarEl = document.getElementById('userAvatar');
        if (userAvatarEl && user) {
            userAvatarEl.src = user.avatar;
        }
        
        // Show/hide login prompt
        this.updateAuthButtons();
    }
    
    updateAuthButtons() {
        const settingsBtn = document.querySelector('.user-settings-btn');
        if (settingsBtn) {
            settingsBtn.onclick = () => {
                if (this.currentUser) {
                    this.showProfileModal();
                } else {
                    this.showAuthModal();
                }
            };
        }
    }
    
    // ----------------------------------------
    // Modals
    // ----------------------------------------
    
    showAuthModal(mode = 'login') {
        // Remove existing modal
        const existingModal = document.querySelector('.auth-modal-overlay');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal">
                <button class="modal-close-btn">&times;</button>
                <div class="auth-tabs">
                    <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-tab="login">Connexion</button>
                    <button class="auth-tab ${mode === 'register' ? 'active' : ''}" data-tab="register">Inscription</button>
                </div>
                
                <form class="auth-form" id="loginForm" style="${mode === 'login' ? '' : 'display: none;'}">
                    <div class="form-group">
                        <label>Nom d'utilisateur ou Email</label>
                        <input type="text" id="loginUsername" placeholder="Entrez votre pseudo ou email" required>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" id="loginPassword" placeholder="Entrez votre mot de passe" required>
                    </div>
                    <div class="form-error" id="loginError"></div>
                    <button type="submit" class="btn btn-primary auth-submit">Se connecter</button>
                </form>
                
                <form class="auth-form" id="registerForm" style="${mode === 'register' ? '' : 'display: none;'}">
                    <div class="form-group">
                        <label>Nom d'utilisateur</label>
                        <input type="text" id="registerUsername" placeholder="Choisissez un pseudo" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="registerEmail" placeholder="votre@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" id="registerPassword" placeholder="Minimum 6 caractères" required minlength="6">
                    </div>
                    <div class="form-error" id="registerError"></div>
                    <button type="submit" class="btn btn-primary auth-submit">Créer un compte</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Tab switching
        modal.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabName = tab.dataset.tab;
                document.getElementById('loginForm').style.display = tabName === 'login' ? '' : 'none';
                document.getElementById('registerForm').style.display = tabName === 'register' ? '' : 'none';
            });
        });
        
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = this.login(username, password);
            if (result.success) {
                modal.remove();
                if (window.STREAMANIA) {
                    window.STREAMANIA.showToast('Connexion réussie !', 'success');
                }
            } else {
                document.getElementById('loginError').textContent = result.error;
            }
        });
        
        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            const result = this.register(username, email, password);
            if (result.success) {
                modal.remove();
                if (window.STREAMANIA) {
                    window.STREAMANIA.showToast('Compte créé avec succès !', 'success');
                }
            } else {
                document.getElementById('registerError').textContent = result.error;
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
    
    showProfileModal() {
        if (!this.currentUser) return;
        
        // Remove existing modal
        const existingModal = document.querySelector('.profile-modal-overlay');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.className = 'profile-modal-overlay auth-modal-overlay';
        modal.innerHTML = `
            <div class="auth-modal profile-modal">
                <button class="modal-close-btn">&times;</button>
                <div class="profile-header">
                    <div class="profile-avatar-container">
                        <img src="${this.currentUser.avatar}" alt="Avatar" class="profile-avatar">
                        <button class="change-avatar-btn" title="Changer l'avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </button>
                    </div>
                    <h2 class="profile-username">${this.currentUser.username}</h2>
                    <span class="profile-plan">${this.currentUser.plan} Member</span>
                </div>
                
                <form class="auth-form profile-form" id="profileForm">
                    <div class="form-group">
                        <label>Nom d'utilisateur</label>
                        <input type="text" id="profileUsername" value="${this.currentUser.username}" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="profileEmail" value="${this.currentUser.email}" required>
                    </div>
                    <div class="form-error" id="profileError"></div>
                    <button type="submit" class="btn btn-primary auth-submit">Sauvegarder</button>
                </form>
                
                <div class="profile-actions">
                    <button class="btn btn-secondary logout-btn">Se déconnecter</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Change avatar
        modal.querySelector('.change-avatar-btn').addEventListener('click', () => {
            const newSeed = Date.now();
            const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;
            this.changeAvatar(newAvatar);
            modal.querySelector('.profile-avatar').src = newAvatar;
        });
        
        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('profileUsername').value;
            const email = document.getElementById('profileEmail').value;
            
            const result = this.updateProfile({ username, email });
            if (result.success) {
                modal.querySelector('.profile-username').textContent = username;
                document.getElementById('profileError').textContent = '';
                if (window.STREAMANIA) {
                    window.STREAMANIA.showToast('Profil mis à jour !', 'success');
                }
            } else {
                document.getElementById('profileError').textContent = result.error;
            }
        });
        
        // Logout
        modal.querySelector('.logout-btn').addEventListener('click', () => {
            this.logout();
            modal.remove();
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
    
    // ----------------------------------------
    // Event Listeners
    // ----------------------------------------
    
    setupEventListeners() {
        // Settings button click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.user-settings-btn')) {
                if (this.currentUser) {
                    this.showProfileModal();
                } else {
                    this.showAuthModal();
                }
            }
            
            // User profile click
            if (e.target.closest('.user-profile') && !e.target.closest('.user-settings-btn')) {
                if (this.currentUser) {
                    this.showProfileModal();
                } else {
                    this.showAuthModal();
                }
            }
        });
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Export for other scripts
window.authSystem = authSystem;
