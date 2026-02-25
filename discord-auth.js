// ========================================
// Discord Integration - Version Fonctionnelle
// ========================================

const DiscordSystem = {
    // 🔽 REMPLACE AVEC TON VRAI CLIENT ID
    CLIENT_ID: '1253780703296880711',
    
    // 🔽 URL de redirection - METS LA MÊME QUE DANS DISCORD
    REDIRECT_URI: 'http://localhost:3000',
    
    init() {
        console.log('DiscordSystem initialisé');
        
        // Vérifier si on revient de Discord
        this.checkForToken();
        
        // Vérifier si connecté
        if (this.isLoggedIn()) {
            this.loadUserProfile();
        }
        
        // Ajouter le bouton
        this.createDiscordButton();
        
        // Initialiser les amis
        this.initFriends();
    },
    
    checkForToken() {
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            
            if (token) {
                console.log('Token Discord reçu !');
                localStorage.setItem('discord_token', token);
                
                // Nettoyer l'URL
                this.cleanURL();
                
                // Charger le profil
                this.loadUserProfile();
                
                this.showNotification('Connecté à Discord avec succès !', 'success');
            }
        }
    },
    
    cleanURL() {
        // Enlever le token de l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
    },
    
    async loadUserProfile() {
        const token = localStorage.getItem('discord_token');
        if (!token) return;
        
        try {
            // Récupérer les infos utilisateur
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('discord_user', JSON.stringify(userData));
                this.updateProfileDisplay(userData);
            }
            
        } catch (error) {
            console.error('Erreur:', error);
        }
    },
    
    updateProfileDisplay(userData) {
        // Mettre à jour l'avatar
        const userAvatar = document.querySelector('.user-avatar img');
        const userName = document.querySelector('.user-name');
        const userPlan = document.querySelector('.user-plan');
        
        if (userAvatar && userName && userData) {
            const avatarUrl = userData.avatar 
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
                : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;
            
            userAvatar.src = avatarUrl;
            userAvatar.alt = userData.username;
            userName.textContent = userData.username;
            
            if (userPlan) {
                userPlan.innerHTML = `
                    <span style="color: #5865F2; display: flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24">
                            <path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                        </svg>
                        Discord Connecté
                    </span>
                `;
            }
        }
        
        this.updateAuthButton();
    },
    
    createDiscordButton() {
        const userAccount = document.querySelector('.user-account');
        if (!userAccount || document.querySelector('.discord-btn')) return;
        
        const button = document.createElement('button');
        button.className = 'discord-btn';
        button.innerHTML = this.isLoggedIn() ? `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            <span>Se déconnecter</span>
        ` : `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            <span>Discord Login</span>
        `;
        
        button.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 12px;
            margin-top: 12px;
            background: ${this.isLoggedIn() ? 'var(--bg-card)' : 'linear-gradient(135deg, #5865F2 0%, #404EED 100%)'};
            color: ${this.isLoggedIn() ? 'var(--text-secondary)' : 'white'};
            border: ${this.isLoggedIn() ? '1px solid var(--border-subtle)' : 'none'};
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast);
        `;
        
        button.addEventListener('mouseenter', () => {
            if (this.isLoggedIn()) {
                button.style.background = 'var(--bg-card-hover)';
                button.style.color = 'var(--accent-error)';
                button.style.borderColor = 'var(--accent-error)';
            } else {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = 'var(--shadow-glow)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (this.isLoggedIn()) {
                button.style.background = 'var(--bg-card)';
                button.style.color = 'var(--text-secondary)';
                button.style.borderColor = 'var(--border-subtle)';
            } else {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            }
        });
        
        button.addEventListener('click', () => {
            if (this.isLoggedIn()) {
                this.logout();
            } else {
                this.loginWithDiscord();
            }
        });
        
        userAccount.appendChild(button);
    },
    
    updateAuthButton() {
        const button = document.querySelector('.discord-btn');
        if (!button) return;
        
        button.innerHTML = this.isLoggedIn() ? `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            <span>Se déconnecter</span>
        ` : `
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
            <span>Discord Login</span>
        `;
        
        button.style.background = this.isLoggedIn() ? 'var(--bg-card)' : 'linear-gradient(135deg, #5865F2 0%, #404EED 100%)';
        button.style.color = this.isLoggedIn() ? 'var(--text-secondary)' : 'white';
        button.style.border = this.isLoggedIn() ? '1px solid var(--border-subtle)' : 'none';
    },
    
    loginWithDiscord() {
        // URL Discord OAuth CORRECTE
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            response_type: 'token',
            scope: 'identify email',
            prompt: 'none'
        });
        
        const authUrl = `https://discord.com/api/oauth2/authorize?${params}`;
        console.log('Redirection vers:', authUrl);
        
        // Ouvrir dans la même fenêtre
        window.location.href = authUrl;
    },
    
    logout() {
        localStorage.removeItem('discord_token');
        localStorage.removeItem('discord_user');
        
        // Réinitialiser l'UI
        const userAvatar = document.querySelector('.user-avatar img');
        const userName = document.querySelector('.user-name');
        const userPlan = document.querySelector('.user-plan');
        
        if (userAvatar) {
            userAvatar.src = 'C:\\Users\\vsst2\\Desktop\\a19e3326c064685f023cb3ce48f6e10f.jpg';
        }
        if (userName) userName.textContent = 'Vortex';
        if (userPlan) {
            userPlan.textContent = 'Premium Member';
        }
        
        this.updateAuthButton();
        this.showNotification('Déconnecté de Discord', 'info');
    },
    
    isLoggedIn() {
        return !!localStorage.getItem('discord_token');
    },
    
    initFriends() {
        // Friends are now managed by friends-system.js
        // Don't create hardcoded friends - use friendsSystem instead
        if (window.friendsSystem) {
            window.friendsSystem.renderFriendsList();
        }
    },
    
    renderFriends() {
        // Friends are now managed by friends-system.js
        // Redirect to friendsSystem
        if (window.friendsSystem) {
            window.friendsSystem.renderFriendsList();
        }
    },
    
    
    showFriendPopup(friend) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        popup.innerHTML = `
            <div style="
                background: var(--bg-secondary);
                border-radius: 20px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                border: 1px solid var(--border-default);
            ">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                    <div style="position: relative;">
                        <img src="https://cdn.discordapp.com/embed/avatars/${friend.id % 5}.png" 
                             style="width: 60px; height: 60px; border-radius: 50%;">
                        <span class="status-dot ${friend.status}" 
                              style="position: absolute; bottom: 2px; right: 2px; width: 16px; height: 16px;"></span>
                    </div>
                    <div>
                        <h3 style="color: var(--text-primary); margin: 0;">${friend.name}</h3>
                        <p style="color: var(--text-secondary); margin: 4px 0 0 0;">${friend.activity}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button onclick="alert('Message envoyé à ${friend.name}')" style="
                        flex: 1;
                        padding: 12px;
                        background: var(--primary-500);
                        color: white;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                    ">Message</button>
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="
                        padding: 12px 20px;
                        background: var(--bg-card);
                        color: var(--text-secondary);
                        border: 1px solid var(--border-subtle);
                        border-radius: 12px;
                        cursor: pointer;
                    ">Fermer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    },
    
    showNotification(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-icon ${type}">${type === 'success' ? '✓' : '!'}</div>
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    DiscordSystem.init();
});