import { http } from '@pterodactyl/sdk';

export type ItemKind = 'button' | 'sidebar';
export type ItemPosition = 'before' | 'after';
export type ItemColor = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';

export const COLORS: { value: ItemColor; label: string }[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'danger', label: 'Danger' },
    { value: 'info', label: 'Info' },
    { value: 'gray', label: 'Gray' },
];

/** Position values are relative to the built-in items; these say where that is on screen. */
export const POSITION_LABELS: Record<ItemKind, Record<ItemPosition, string>> = {
    button: { before: 'Above the power buttons', after: 'Below the power buttons' },
    sidebar: { before: 'Before the built-in links', after: 'After the built-in links' },
};

// Readable names for the placeholder tokens the backend reports in `meta.placeholders`.
// The backend list decides which placeholders exist; a token without a name here is
// shown as it is.
const PLACEHOLDER_NAMES: Record<string, string> = {
    '{{env.P_SERVER_UUID}}': 'Server UUID',
    '{{env.P_SERVER_UUID_SHORT}}': 'Short ID',
    '{{env.P_SERVER_NAME}}': 'Server name',
    '{{env.P_SERVER_ID}}': 'Server number',
    '{{env.P_SERVER_ALLOCATION_IP}}': 'IP address',
    '{{env.P_SERVER_ALLOCATION_PORT}}': 'Port',
    '{{env.P_SERVER_NODE}}': 'Node name',
    '{{env.P_SERVER_OWNER}}': 'Owner username',
};

export const placeholderName = (token: string): string => PLACEHOLDER_NAMES[token] ?? token;

/** What a server page receives: placeholders already substituted by the backend. */
export interface ServerItem {
    id: number;
    label: string;
    url: string;
    icon: string | null;
    color: ItemColor;
    new_tab: boolean;
    position: ItemPosition;
}

export interface ServerItems {
    buttons: ServerItem[];
    sidebar: ServerItem[];
}

export interface AdminItem {
    id: number;
    kind: ItemKind;
    label: string;
    url: string;
    icon: string | null;
    color: ItemColor;
    new_tab: boolean;
    position: ItemPosition;
    sort: number;
    is_active: boolean;
    server_id: number | null;
    egg_id: number | null;
    feature: string | null;
    /** Name of the server in `server_id`, for display. */
    server_name: string | null;
}

export type AdminItemInput = Omit<AdminItem, 'id' | 'server_name'>;

/** The saved fields of an entry, to send it back with one of them changed. */
export const inputOf = ({ id: _id, server_name: _name, ...input }: AdminItem): AdminItemInput => input;

export interface AdminMeta {
    placeholders: string[];
    eggs: { id: number; name: string }[];
}

const ADMIN = '/api/admin/extensions/custom-buttons';

export const fetchServerItems = async (serverUuid: string): Promise<ServerItems> =>
    (
        await http.get<{ data: ServerItems }>(
            `/api/client/servers/${encodeURIComponent(serverUuid)}/extensions/custom-buttons/items`
        )
    ).data.data;

export const fetchAdminItems = async (): Promise<{ items: AdminItem[]; meta: AdminMeta }> => {
    const body = (await http.get<{ data: AdminItem[]; meta: AdminMeta }>(`${ADMIN}/items`)).data;

    return { items: body.data, meta: body.meta };
};

export const createItem = async (input: AdminItemInput): Promise<void> => {
    await http.post(`${ADMIN}/items`, input);
};

export const updateItem = async (id: number, input: AdminItemInput): Promise<void> => {
    await http.patch(`${ADMIN}/items/${id}`, input);
};

export const deleteItem = async (id: number): Promise<void> => {
    await http.delete(`${ADMIN}/items/${id}`);
};
