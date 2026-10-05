import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import Banners from './Banners';

function DashboardBanners() {
    return <Banners area={'dashboard'} />;
}

function ServerBanners() {
    return <Banners area={'server'} />;
}

function AdminBanners() {
    return <Banners area={'admin'} />;
}

export default definePterodactylExtension({
    setup({ slots, screens }) {
        slots.register('dashboard.before', DashboardBanners);
        slots.register('server.console.before', ServerBanners);
        slots.register('panel.overview.before', AdminBanners);

        screens.register('announcements', () => import('./screens/AnnouncementsScreen'));
    },
});
