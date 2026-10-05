import { http } from '@pterodactyl/sdk';

export type StatusCode = 301 | 302;

export interface ShortRedirect {
    id: number;
    slug: string;
    target: string;
    status_code: StatusCode;
    enabled: boolean;
    hits: number;
    /** Full public URL of this redirect on the panel. */
    url: string;
    last_hit_at: string | null;
    created_at: string;
}

export interface RedirectInput {
    slug: string;
    target: string;
    status_code: StatusCode;
    enabled: boolean;
}

export const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '302', label: '302 - Temporary (recommended)' },
    { value: '301', label: '301 - Permanent (cached by browsers)' },
];

const ADMIN = '/api/admin/extensions/redirect';

export const fetchRedirects = async (): Promise<ShortRedirect[]> =>
    (await http.get<{ data: ShortRedirect[] }>(`${ADMIN}/redirects`)).data.data;

export const createRedirect = async (input: RedirectInput): Promise<void> => {
    await http.post(`${ADMIN}/redirects`, input);
};

export const updateRedirect = async (id: number, input: RedirectInput): Promise<void> => {
    await http.patch(`${ADMIN}/redirects/${id}`, input);
};

export const deleteRedirect = async (id: number): Promise<void> => {
    await http.delete(`${ADMIN}/redirects/${id}`);
};
