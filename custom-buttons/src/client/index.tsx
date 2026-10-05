import './styles.css';
import { definePterodactylExtension, type SdkServer } from '@pterodactyl/sdk';
import { ConsoleButtons, SidebarLinks } from './ServerItems';

const ButtonsBefore = ({ data }: { data: SdkServer }) => <ConsoleButtons data={data} position={'before'} />;
const ButtonsAfter = ({ data }: { data: SdkServer }) => <ConsoleButtons data={data} position={'after'} />;
const SidebarBefore = ({ data }: { data: SdkServer }) => <SidebarLinks data={data} position={'before'} />;
const SidebarAfter = ({ data }: { data: SdkServer }) => <SidebarLinks data={data} position={'after'} />;

export default definePterodactylExtension({
    setup({ slots, screens }) {
        slots.register('server.console.power.before', ButtonsBefore);
        slots.register('server.console.power.after', ButtonsAfter);
        slots.register('server.navigation.before', SidebarBefore);
        slots.register('server.navigation.after', SidebarAfter);

        screens.register('custom-buttons', () => import('./screens/CustomButtonsScreen'));
    },
});
