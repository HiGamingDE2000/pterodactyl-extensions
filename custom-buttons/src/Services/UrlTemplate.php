<?php

namespace CustomButtons\Services;

use Pterodactyl\Models\Server;

class UrlTemplate
{
    /** Placeholders available in a URL template (the same set the original plugin offered). */
    public const PLACEHOLDERS = [
        '{{env.P_SERVER_UUID}}',
        '{{env.P_SERVER_UUID_SHORT}}',
        '{{env.P_SERVER_NAME}}',
        '{{env.P_SERVER_ID}}',
        '{{env.P_SERVER_ALLOCATION_IP}}',
        '{{env.P_SERVER_ALLOCATION_PORT}}',
        '{{env.P_SERVER_NODE}}',
        '{{env.P_SERVER_OWNER}}',
    ];

    /**
     * Substitute placeholders with URL-encoded server values, then return the
     * result only when it is a safe link (http/https or a same-site relative path).
     */
    public static function resolve(string $template, Server $server): ?string
    {
        $server->loadMissing(['allocation', 'node', 'user']);

        $values = [
            '{{env.P_SERVER_UUID}}' => $server->uuid,
            '{{env.P_SERVER_UUID_SHORT}}' => $server->uuidShort,
            '{{env.P_SERVER_NAME}}' => $server->name,
            '{{env.P_SERVER_ID}}' => $server->id,
            '{{env.P_SERVER_ALLOCATION_IP}}' => $server->allocation?->ip ?? '',
            '{{env.P_SERVER_ALLOCATION_PORT}}' => $server->allocation?->port ?? '',
            '{{env.P_SERVER_NODE}}' => $server->node?->name ?? '',
            '{{env.P_SERVER_OWNER}}' => $server->user?->username ?? '',
        ];

        $replacements = [];
        foreach ($values as $placeholder => $value) {
            $replacements[$placeholder] = rawurlencode((string) $value);
        }

        $url = trim(strtr($template, $replacements));

        return self::isSafe($url) ? $url : null;
    }

    /** Only http(s) URLs and relative paths starting with a single slash are allowed. */
    public static function isSafe(string $url): bool
    {
        if ($url === '' || preg_match('/[\x00-\x20\x7f]/', $url) === 1) {
            return false;
        }

        if (preg_match('#^https?://[^/]+#i', $url) === 1) {
            return true;
        }

        // Relative path: one leading slash, not protocol-relative ("//host") or "/\host".
        return preg_match('#^/(?![/\\\\])#', $url) === 1;
    }

    /** Validate a template when the admin saves it, with placeholders replaced by a dummy token. */
    public static function templateIsSafe(string $template): bool
    {
        return self::isSafe(trim(str_replace(self::PLACEHOLDERS, 'x', $template)));
    }
}
