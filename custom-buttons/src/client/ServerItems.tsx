import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NamedIcon, type SdkServer } from '@pterodactyl/sdk';
import { Link } from 'lucide-react';
import { fetchServerItems, type ItemColor, type ItemPosition, type ServerItem } from './api';

const BASE_BUTTON =
    'cb:inline-flex cb:items-center cb:gap-1 cb:rounded-sm cb:border cb:px-4 cb:py-2 cb:text-sm cb:uppercase cb:tracking-wide cb:no-underline cb:transition-colors cb:duration-150';

// Colour options map onto the panel theme tokens, so they follow the active theme.
// Full class names are spelled out so Tailwind can see them.
export const BUTTON_CLASS: Record<ItemColor, string> = {
    primary: 'cb:border-primary cb:bg-primary cb:text-primary-foreground cb:hover:bg-primary/90',
    success: 'cb:border-success cb:bg-success cb:text-success-foreground cb:hover:bg-success/90',
    warning: 'cb:border-warning cb:bg-warning cb:text-warning-foreground cb:hover:bg-warning/90',
    danger: 'cb:border-destructive cb:bg-destructive cb:text-destructive-foreground cb:hover:bg-destructive/90',
    info: 'cb:border-border cb:bg-secondary cb:text-secondary-foreground cb:hover:bg-secondary/80',
    gray: 'cb:border-border cb:bg-popover cb:text-foreground cb:hover:bg-secondary',
};

const SIDEBAR_LINK =
    'cb:inline-flex cb:items-center cb:gap-1 cb:whitespace-nowrap cb:px-4 cb:py-3 cb:text-muted-foreground cb:no-underline cb:transition-colors cb:duration-150 cb:hover:text-foreground';

/** What decides how an entry looks; the admin preview renders from the same fields. */
export interface ItemLook {
    label: ReactNode;
    icon: string | null;
    color: ItemColor;
}

interface ItemLink {
    url: string;
    new_tab: boolean;
}

interface ItemProps {
    item: ItemLook;
    /** Omitted in the admin preview, where the entry is shown but is not a link. */
    link?: ItemLink;
}

function ItemShell({ className, link, item }: ItemProps & { className: string }) {
    const content = (
        <>
            <NamedIcon name={item.icon || 'link'} fallback={Link} size={'1em'} aria-hidden={'true'} />
            {item.label}
        </>
    );

    if (!link) return <span className={className}>{content}</span>;

    return (
        <a
            href={link.url}
            {...(link.new_tab ? { target: '_blank' } : {})}
            rel={'noopener noreferrer'}
            className={className}
        >
            {content}
        </a>
    );
}

export function ConsoleButton({ item, link }: ItemProps) {
    return (
        <ItemShell
            item={item}
            link={link}
            className={`${BASE_BUTTON} ${BUTTON_CLASS[item.color] ?? BUTTON_CLASS.primary}`}
        />
    );
}

export function SidebarLink({ item, link }: ItemProps) {
    return <ItemShell item={item} link={link} className={SIDEBAR_LINK} />;
}

function useServerItems(server: SdkServer) {
    const uuid = server.attributes.uuid;

    return useQuery({
        queryKey: ['ext-custom-buttons', uuid],
        queryFn: () => fetchServerItems(uuid),
        staleTime: 60_000,
    });
}

// The backend only returns http(s) or "/relative" URLs; check again before rendering a link.
const isSafeHref = (url: string): boolean => /^https?:\/\//i.test(url) || /^\/(?![/\\])/.test(url);

const visible = (items: ServerItem[] | undefined, position: ItemPosition): ServerItem[] =>
    (items ?? []).filter((item) => item.position === position && isSafeHref(item.url));

export function ConsoleButtons({ data, position }: { data: SdkServer; position: ItemPosition }) {
    const { data: items } = useServerItems(data);
    const buttons = visible(items?.buttons, position);

    if (buttons.length === 0) return null;

    // The row sits above ("before") or below ("after") the power buttons; keep a gap on that side.
    return (
        <div
            className={`cb:flex cb:flex-wrap cb:gap-2 cb:sm:justify-end ${position === 'before' ? 'cb:mb-2' : 'cb:mt-2'}`}
        >
            {buttons.map((item) => (
                <ConsoleButton key={item.id} item={item} link={item} />
            ))}
        </div>
    );
}

export function SidebarLinks({ data, position }: { data: SdkServer; position: ItemPosition }) {
    const { data: items } = useServerItems(data);

    return (
        <>
            {visible(items?.sidebar, position).map((item) => (
                <SidebarLink key={item.id} item={item} link={item} />
            ))}
        </>
    );
}
