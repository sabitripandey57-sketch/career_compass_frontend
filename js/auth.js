// Authentication utilities
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Initializing AuthManager...');
        
        // Update navigation immediately and after DOM loads
        this.updateNavigation();
        
        // Add event listeners for logout
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🌍 DOM Content Loaded - updating navigation again');
            this.updateNavigation();
            this.setupLogoutListeners();
        });
        
        // Also try after a short delay to ensure all scripts have loaded
        setTimeout(() => {
            console.log('⏰ Delayed navigation update');
            this.updateNavigation();
        }, 500);
    }

    updateNavigation() {
        console.log('🔄 Updating navigation...');
        const isLoggedIn = this.isLoggedIn();
        const user = this.getStoredUser();
        
        console.log('📊 Auth status:', { isLoggedIn, user });
        
        // Find navigation elements
        const navLinks = document.querySelector('.nav-link ul') || 
                        document.getElementById('navigation-menu') || 
                        document.querySelector('#navigation-menu');
        
        console.log('📋 Found navLinks element:', navLinks);
        
        if (navLinks && isLoggedIn && user) {
            console.log('👤 Creating authenticated navigation for:', user.role);
            // Authenticated user navigation
            const dashboardLink = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
            const dashboardText = user.role === 'admin' ? 'Admin Panel' : 'Dashboard';
            
            let navigationHTML = `
                <li><a href="index.html" class="hover-link">Home</a></li>
                <li><a href="college.html" class="hover-link">Colleges</a></li>
                <li><a href="${dashboardLink}" class="hover-link">${dashboardText}</a></li>
            `;
            
            // Add student-specific links
            if (user.role === 'student') {
                navigationHTML += `
                    <li><a href="profile.html" class="hover-link">Profile</a></li>
                    <li><a href="AfterSEE.html" class="hover-link">After SEE</a></li>
                    <li><a href="Afterinter.html" class="hover-link">After +2</a></li>
                `;
            }
            
            navigationHTML += `
                <li><a href="contact.html" class="hover-link">Contact</a></li>
                <li><a href="help.html" class="hover-link">Help</a></li>
                <li class="user-menu">
                    <a href="#" class="hover-link secondary-button user-dropdown-toggle" id="user-profile">
                        👤 ${user.name} ▼
                    </a>
                    <div class="user-dropdown" id="user-dropdown" style="display: none;">
                        <a href="profile.html" class="dropdown-item">👤 My Profile</a>
                        <a href="${dashboardLink}" class="dropdown-item">📊 ${dashboardText}</a>
                        <a href="#" class="dropdown-item" id="logout-btn">🚪 Logout</a>
                    </div>
                </li>
            `;
            
            navLinks.innerHTML = navigationHTML;
            console.log('✅ Authenticated navigation created with dropdown');
            
            // Add dropdown functionality with delay to ensure DOM is ready
            setTimeout(() => {
                this.setupUserDropdown();
            }, 100);
            
        } else if (navLinks) {
            console.log('🚪 Creating guest navigation');
            // Guest navigation
            navLinks.innerHTML = `
                <li><a href="index.html" class="hover-link">Home</a></li>
                <li><a href="college.html" class="hover-link">Colleges</a></li>
                <li><a href="AfterSEE.html" class="hover-link">After SEE</a></li>
                <li><a href="Afterinter.html" class="hover-link">After +2</a></li>
                <li><a href="checkrequirement.html" class="hover-link">Requirements</a></li>
                <li><a href="contact.html" class="hover-link">Contact</a></li>
                <li><a href="help.html" class="hover-link">Help</a></li>
                <li><a href="signup.html" class="hover-link secondary-button">Sign up</a></li>
                <li><a href="login.html" class="hover-link primary-button">Login</a></li>
            `;
            console.log('✅ Guest navigation created');
        } else {
            console.log('⚠️ No navigation container found!');
        }
    }

    setupLogoutListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'logout-btn') {
                e.preventDefault();
                await this.logout();
            }
        });
    }

    setupUserDropdown() {
        console.log('🔧 Setting up user dropdown...');
        const dropdownToggle = document.getElementById('user-profile');
        const dropdown = document.getElementById('user-dropdown');
        
        console.log('🎯 Dropdown elements:', { dropdownToggle, dropdown });
        
        if (dropdownToggle && dropdown) {
            console.log('✅ Dropdown elements found, adding event listeners');
            
            // Remove any existing listeners
            dropdownToggle.removeEventListener('click', this.toggleDropdown);
            
            // Add new listener
            this.toggleDropdown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📱 Dropdown toggle clicked');
                
                // Toggle dropdown
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
                console.log('🔄 Dropdown visibility:', !isVisible);
            };
            
            dropdownToggle.addEventListener('click', this.toggleDropdown);
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-menu')) {
                    dropdown.style.display = 'none';
                }
            });
            
            console.log('✅ Dropdown event listeners added successfully');
        } else {
            console.log('⚠️ Dropdown setup failed - elements not found');
        }
    }

    async logout() {
        try {
            console.log('Starting logout process...');
            
            // Clear all stored data immediately
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            sessionStorage.clear();
            
            // Clear cookies
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Try to call logout API (but don't wait for it)
            try {
                fetch('http://localhost:5001/api/users/logout', {
                    method: 'POST',
                    credentials: 'include'
                }).catch(() => {/* ignore errors */});
            } catch (e) {
                // Ignore API errors during logout
            }
            
            // Show success message
            this.showNotification('Successfully logged out!', 'success');
            
            console.log('User logged out successfully');
            
            // Update navigation immediately
            this.updateNavigation();
            
            // Redirect to home after brief delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force clear everything even if there's an error
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(c => {
                const eqPos = c.indexOf("=");
                const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });
            
            this.showNotification('Logged out successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }
    
    // Check if user is logged in
    isLoggedIn() {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }
    
    // Get stored user data
    getStoredUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(n => n.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add styles if they don't exist
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .auth-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 5px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .auth-notification.success {
                    background-color: #2ed573;
                }
                .auth-notification.error {
                    background-color: #ff4757;
                }
                .auth-notification.info {
                    background-color: #3498db;
                }
                .auth-notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 10px;
                }
                
                /* User dropdown styles */
                .user-menu {
                    position: relative;
                }
                
                .user-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    min-width: 200px;
                    z-index: 1000;
                    padding: 5px 0;
                    margin-top: 5px;
                }
                
                .user-dropdown .dropdown-item {
                    display: block;
                    padding: 8px 15px;
                    color: #333;
                    text-decoration: none;
                    transition: background-color 0.3s;
                }
                
                .user-dropdown .dropdown-item:hover {
                    background-color: #f8f9fa;
                    text-decoration: none;
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            alert('Please login to access this page');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Redirect to dashboard if already authenticated
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            const user = this.getStoredUser();
            if (user && user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
            return true;
        }
        return false;
    }
    
    // Global logout function for easy access
    static quickLogout() {
        try {
            localStorage.clear();
            sessionStorage.clear();
            document.cookie.split(";").forEach(c => {
                const eqPos = c.indexOf("=");
                const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Quick logout error:', error);
            window.location.href = 'index.html';
        }
    }
}

// Utility functions
function showLoading(element) {
    element.innerHTML = '<div class="loading">Loading...</div>';
}

function hideLoading() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(element => element.remove());
}

function showError(message, container = null) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
    `;
    errorDiv.textContent = message;
    
    if (container) {
        container.appendChild(errorDiv);
    } else {
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message, container = null) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
    `;
    successDiv.textContent = message;
    
    if (container) {
        container.appendChild(successDiv);
    } else {
        document.body.insertBefore(successDiv, document.body.firstChild);
    }
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Global logout functions
function logout() {
    if (window.authManager) {
        return authManager.logout();
    } else {
        AuthManager.quickLogout();
    }
}

function quickLogout() {
    return AuthManager.quickLogout();
}

// Initialize auth manager
const authManager = new AuthManager();

// Make authManager globally accessible
window.authManager = authManager;
window.logout = logout;
window.quickLogout = quickLogout;
