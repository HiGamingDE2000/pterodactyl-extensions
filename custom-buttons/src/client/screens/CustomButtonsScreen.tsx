import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Alert,
    Button,
    Dialog,
    PageContentBlock,
    Spinner,
    Switch,
    Table,
    httpErrorToHuman,
    toast,
    type TableColumn,
} from '@pterodactyl/sdk';
import { usePresence } from '../presence';
import {
    POSITION_LABELS,
    deleteItem,
    fetchAdminItems,
    inputOf,
    updateItem,
    type AdminItem,
    type AdminItemInput,
    type AdminMeta,
    type ItemKind,
} from '../api';
import ItemDialog from './ItemDialog';
import { ItemSample, UrlText, filterSummary } from './ItemPreview';

const ADMIN_QUERY = ['ext-custom-buttons', 'admin'];

interface AdminData {
    items: AdminItem[];
    meta: AdminMeta;
}

interface Change {
    item: AdminItem;
    patch: Partial<AdminItemInput>;
}

const COPY: Record<ItemKind, { title: string; about: string; noun: string; column: string; emptyTitle: string; empty: string }> = {
    button: {
        title: 'Console buttons',
        about: 'Shown with the power buttons on the server console.',
        noun: 'button',
        column: 'Button',
        emptyTitle: 'No buttons yet',
        empty: 'Add a button to send people from a server to your billing area, a status page, a map or any other link.',
    },
    sidebar: {
        title: 'Sidebar items',
        about: 'Shown in the navigation of every server page.',
        noun: 'sidebar item',
        column: 'Sidebar item',
        emptyTitle: 'No sidebar items yet',
        empty: 'Add a sidebar item to put a link to your documentation, support or any other page in the server navigation.',
    },
};

/** What the cells of one list need; lets the column definitions stay the same between renders. */
interface ListContextValue {
    kind: ItemKind;
    meta: AdminMeta;
    ordered: AdminItem[];
    move(item: AdminItem, direction: -1 | 1): void;
    setActive(item: AdminItem, active: boolean): void;
    edit(item: AdminItem): void;
    remove(item: AdminItem): void;
}

const ListContext = createContext<ListContextValue | null>(null);

function useList(): ListContextValue {
    const value = useContext(ListContext);
    if (!value) throw new Error('List cell rendered outside its list.');

    return value;
}

const ICON_BUTTON = 'cb:inline-flex cb:size-7 cb:items-center cb:justify-center cb:p-0';

const moveTarget = (id: number, direction: -1 | 1): string => `${id}:${direction}`;

function OrderCell({ row }: { row: AdminItem }) {
    const { ordered, move } = useList();
    const index = ordered.findIndex((item) => item.id === row.id);
    // Entries only trade places with a neighbour in the same position.
    const canMove = (direction: -1 | 1) => ordered[index + direction]?.position === row.position;

    return (
        <div className={'cb:flex cb:gap-1'}>
            {([-1, 1] as const).map((direction) => (
                <Button.Text
                    key={direction}
                    type={'button'}
                    size={'xsmall'}
                    isSecondary
                    className={ICON_BUTTON}
                    data-custom-buttons-move={moveTarget(row.id, direction)}
                    aria-label={`Move ${row.label} ${direction < 0 ? 'up' : 'down'}`}
                    disabled={!canMove(direction)}
                    onClick={() => move(row, direction)}
                >
                    {direction < 0 ? (
                        <ArrowUp aria-hidden={'true'} size={14} />
                    ) : (
                        <ArrowDown aria-hidden={'true'} size={14} />
                    )}
                </Button.Text>
            ))}
        </div>
    );
}

function ItemCell({ row }: { row: AdminItem }) {
    const { kind, meta } = useList();
    const sample = <ItemSample kind={kind} item={row} />;

    return (
        <div className={'cb:flex cb:min-w-40 cb:flex-col cb:items-start cb:gap-1.5'}>
            <span className={row.is_active ? 'cb:inline-flex' : 'cb:inline-flex cb:opacity-50'}>
                {kind === 'button' ? (
                    sample
                ) : (
                    <span className={'cb:inline-flex cb:rounded-sm cb:border cb:border-border cb:text-sm'}>{sample}</span>
                )}
            </span>
            <UrlText url={row.url} placeholders={meta.placeholders} />
        </div>
    );
}

function ShownOnCell({ row }: { row: AdminItem }) {
    const { kind, meta } = useList();
    const filters = filterSummary(row, meta.eggs);

    return (
        <div className={'cb:min-w-32'}>
            {filters.length === 0 ? (
                <span>Every server</span>
            ) : (
                <ul className={'cb:m-0 cb:list-none cb:p-0'}>
                    {filters.map((filter) => (
                        <li key={filter}>{filter}</li>
                    ))}
                </ul>
            )}
            <p className={'cb:m-0 cb:mt-0.5 cb:text-xs cb:text-muted-foreground'}>
                {POSITION_LABELS[kind][row.position]}
            </p>
        </div>
    );
}

function ActiveCell({ row }: { row: AdminItem }) {
    const { setActive } = useList();
    const id = useId();

    return (
        <div className={'cb:flex cb:items-center cb:gap-2'}>
            <label htmlFor={id} className={'cb:sr-only'}>
                Show {row.label} on servers
            </label>
            <Switch id={id} checked={row.is_active} onChange={(checked) => setActive(row, checked)} />
            <span aria-hidden={'true'} className={'cb:hidden cb:text-xs cb:text-muted-foreground cb:lg:inline'}>
                {row.is_active ? 'Active' : 'Hidden'}
            </span>
        </div>
    );
}

function ActionsCell({ row }: { row: AdminItem }) {
    const { edit, remove } = useList();

    return (
        <div className={'cb:flex cb:justify-end cb:gap-1'}>
            <Button.Text
                type={'button'}
                size={'xsmall'}
                isSecondary
                className={ICON_BUTTON}
                aria-label={`Edit ${row.label}`}
                onClick={() => edit(row)}
            >
                <Pencil aria-hidden={'true'} size={14} />
            </Button.Text>
            <Button.Text
                type={'button'}
                size={'xsmall'}
                color={'red'}
                isSecondary
                className={ICON_BUTTON}
                aria-label={`Delete ${row.label}`}
                onClick={() => remove(row)}
            >
                <Trash2 aria-hidden={'true'} size={14} />
            </Button.Text>
        </div>
    );
}

const hidden = (text: string) => <span className={'cb:sr-only'}>{text}</span>;

function NewButton({ kind, onClick }: { kind: ItemKind; onClick: () => void }) {
    return (
        <Button type={'button'} onClick={onClick}>
            <Plus aria-hidden={'true'} className={'cb:mr-2 cb:inline cb:size-4 cb:align-[-0.15em]'} />
            New {COPY[kind].noun}
        </Button>
    );
}

function ItemsSection({ kind, data, isFetching }: { kind: ItemKind; data: AdminData; isFetching: boolean }) {
    const queryClient = useQueryClient();
    const { meta } = data;
    const items = useMemo(() => data.items.filter((item) => item.kind === kind), [data.items, kind]);
    const copy = COPY[kind];
    const headingId = useId();
    const [editing, setEditing] = useState<AdminItem | 'new' | null>(null);
    const dialog = usePresence(editing);
    const [deleting, setDeleting] = useState<AdminItem | null>(null);
    const confirm = usePresence(deleting);
    const [announcement, setAnnouncement] = useState('');
    const refocus = useRef<{ id: number; direction: -1 | 1 } | null>(null);

    // The order people see: entries placed before the built-in items, then those after.
    const ordered = useMemo(
        () =>
            [...items].sort(
                (a, b) =>
                    Number(a.position === 'after') - Number(b.position === 'after') || a.sort - b.sort || a.id - b.id
            ),
        [items]
    );

    const change = useMutation({
        mutationFn: async (changes: Change[]) => {
            await Promise.all(changes.map(({ item, patch }) => updateItem(item.id, { ...inputOf(item), ...patch })));
        },
        // Show the result straight away; the list is fetched again once the server has answered.
        onMutate: async (changes) => {
            await queryClient.cancelQueries({ queryKey: ADMIN_QUERY });
            const patches = new Map(changes.map(({ item, patch }) => [item.id, patch]));
            queryClient.setQueryData<AdminData>(
                ADMIN_QUERY,
                (data) => data && { ...data, items: data.items.map((item) => ({ ...item, ...patches.get(item.id) })) }
            );
        },
        onError: (cause) => toast.error(httpErrorToHuman(cause)),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['ext-custom-buttons'] }),
    });

    const remove = useMutation({
        mutationFn: (item: AdminItem) => deleteItem(item.id),
        onSuccess: async (_data, item) => {
            await queryClient.invalidateQueries({ queryKey: ['ext-custom-buttons'] });
            toast.success(`Deleted "${item.label}".`);
            setDeleting(null);
        },
        onError: (cause) => toast.error(httpErrorToHuman(cause)),
    });

    const reordering = change.isPending;
    const list = useMemo<ListContextValue>(
        () => ({
            kind,
            meta,
            ordered,
            move(item, direction) {
                // One reorder at a time, so saves cannot land out of order.
                if (reordering) return;
                const from = ordered.findIndex((entry) => entry.id === item.id);
                const next = [...ordered];
                const neighbour = next[from + direction];
                if (from < 0 || !neighbour) return;
                next[from + direction] = item;
                next[from] = neighbour;

                refocus.current = { id: item.id, direction };
                setAnnouncement(`Moved ${item.label} ${direction < 0 ? 'up' : 'down'}.`);
                // Number the whole list, saving only the entries whose number changed.
                change.mutate(next.flatMap((entry, sort) => (entry.sort === sort ? [] : [{ item: entry, patch: { sort } }])));
            },
            setActive(item, active) {
                setAnnouncement(`${item.label} is now ${active ? 'active' : 'hidden'}.`);
                change.mutate([{ item, patch: { is_active: active } }]);
            },
            edit: setEditing,
            remove: setDeleting,
        }),
        // `change.mutate` keeps its identity; `reordering` stands for the mutation's state.
        [kind, meta, ordered, reordering]
    );

    // Keep keyboard focus on the entry that was moved. At the end of its group the button
    // that was pressed is disabled, so the opposite one takes the focus.
    useEffect(() => {
        const target = refocus.current;
        if (!target) return;
        refocus.current = null;
        const find = (direction: -1 | 1) =>
            document.querySelector<HTMLButtonElement>(
                `[data-custom-buttons-move="${moveTarget(target.id, direction)}"]:not(:disabled)`
            );
        (find(target.direction) ?? find(target.direction < 0 ? 1 : -1))?.focus();
    }, [ordered]);

    const columns = useMemo<TableColumn<AdminItem>[]>(
        () => [
            { id: 'order', label: hidden('Order'), cell: (row) => <OrderCell row={row} /> },
            { id: 'item', label: COPY[kind].column, cell: (row) => <ItemCell row={row} /> },
            { id: 'shown', label: 'Shown on', cell: (row) => <ShownOnCell row={row} /> },
            { id: 'active', label: 'Active', cell: (row) => <ActiveCell row={row} /> },
            { id: 'actions', label: hidden('Actions'), cell: (row) => <ActionsCell row={row} /> },
        ],
        [kind]
    );

    const nextSort = items.reduce((highest, item) => Math.max(highest, item.sort + 1), 0);

    return (
        <section aria-labelledby={headingId}>
            <div className={'cb:mb-3 cb:flex cb:flex-col cb:gap-3 cb:sm:flex-row cb:sm:items-end cb:sm:justify-between'}>
                <div className={'cb:min-w-0'}>
                    <h2 id={headingId} className={'cb:m-0 cb:font-header cb:text-lg cb:font-semibold cb:text-foreground'}>
                        {copy.title}
                    </h2>
                    <p className={'cb:m-0 cb:mt-1 cb:text-sm cb:leading-relaxed cb:text-foreground/70'}>{copy.about}</p>
                </div>
                {items.length > 0 && (
                    <div className={'cb:shrink-0'}>
                        <NewButton kind={kind} onClick={() => setEditing('new')} />
                    </div>
                )}
            </div>

            <ListContext.Provider value={list}>
                <Table
                    rows={ordered}
                    columns={columns}
                    isFetching={isFetching}
                    keyOf={(row) => String(row.id)}
                    emptyState={
                        <div className={'cb:mx-auto cb:max-w-md cb:text-center'}>
                            <p className={'cb:m-0 cb:font-header cb:text-base cb:font-semibold cb:text-foreground'}>
                                {copy.emptyTitle}
                            </p>
                            <p className={'cb:m-0 cb:mt-1 cb:mb-4 cb:text-sm cb:leading-relaxed cb:text-muted-foreground'}>
                                {copy.empty}
                            </p>
                            <NewButton kind={kind} onClick={() => setEditing('new')} />
                        </div>
                    }
                />
            </ListContext.Provider>
            <p role={'status'} className={'cb:sr-only'}>
                {announcement}
            </p>

            {dialog.value && (
                <ItemDialog
                    key={dialog.key}
                    open={dialog.open}
                    editing={dialog.value === 'new' ? null : dialog.value}
                    kind={kind}
                    meta={meta}
                    nextSort={nextSort}
                    onClose={() => setEditing(null)}
                />
            )}

            <Dialog.Confirm
                open={confirm.open}
                onClose={() => setDeleting(null)}
                title={`Delete ${copy.noun}`}
                confirm={`Delete ${copy.noun}`}
                onConfirmed={() => deleting && !remove.isPending && remove.mutate(deleting)}
            >
                <p className={'cb:m-0 cb:text-sm cb:leading-relaxed cb:text-muted-foreground'}>
                    This permanently deletes <strong className={'cb:text-foreground'}>{confirm.value?.label}</strong> and
                    removes it from every server page.
                </p>
            </Dialog.Confirm>
        </section>
    );
}

export default function CustomButtonsScreen() {
    const { data, isFetching, error, refetch } = useQuery({
        queryKey: ADMIN_QUERY,
        queryFn: fetchAdminItems,
    });

    return (
        <PageContentBlock title={'Custom Buttons'}>
            <header className={'cb:mb-6'}>
                <h1 className={'cb:m-0 cb:font-header cb:text-2xl cb:font-semibold cb:text-foreground'}>Custom Buttons</h1>
                <p className={'cb:m-0 cb:mt-1 cb:text-sm cb:leading-relaxed cb:text-foreground/70'}>
                    Add your own links to the server console and the server navigation.
                </p>
            </header>

            {error && (
                <Alert type={'danger'} className={'cb:mb-4'}>
                    <div className={'cb:flex cb:flex-wrap cb:items-center cb:justify-between cb:gap-3'}>
                        <span>{httpErrorToHuman(error)}</span>
                        <Button.Text type={'button'} size={'xsmall'} onClick={() => void refetch()}>
                            Try again
                        </Button.Text>
                    </div>
                </Alert>
            )}

            {data ? (
                <div className={'cb:grid cb:gap-10'}>
                    {(['button', 'sidebar'] as const).map((kind) => (
                        <ItemsSection
                            key={kind}
                            kind={kind}
                            data={data}
                            isFetching={isFetching}
                        />
                    ))}
                </div>
            ) : (
                !error && <Spinner size={'large'} centered />
            )}
        </PageContentBlock>
    );
}
