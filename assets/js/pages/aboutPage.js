import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { renderAdminBanner } from '../components/adminBanner.js';
import { showToast } from '../components/toast.js';
import { isAdmin, logout } from '../services/authService.js';

async function handleLogout() {
    try {
        await logout();
        window.location.reload();
    } catch (error) {
        console.error('Could not sign out:', error);
        showToast('Could not sign out.', 'error');
    }
}

async function init() {
    renderNavbar('about');
    renderFooter();

    try {
        const admin = await isAdmin();
        renderAdminBanner(admin, handleLogout);
        renderFooter({ admin, onLogout: handleLogout });
    } catch (error) {
        console.error('About page failed to initialize:', error);
        showToast('Administrator status could not be loaded.', 'error');
    }
}

init();
