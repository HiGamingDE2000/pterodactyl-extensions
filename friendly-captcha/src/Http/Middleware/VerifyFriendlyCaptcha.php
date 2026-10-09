<?php

declare(strict_types=1);

namespace FriendlyCaptcha\\Http\\Middleware;

use Closure;
use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\GuzzleException;
use Illuminate\\Contracts\\Events\\Dispatcher;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\Response;
use Pterodactyl\\Events\\Auth\\FailedCaptcha;
use Pterodactyl\\Services\\Extensions\\ExtensionManager;
use Symfony\\Component\\HttpKernel\\Exception\\HttpException;

class VerifyFriendlyCaptcha
{
    private const array ENDPOINTS = [
        'global' => 'https://global.frcapi.com/api/v2/captcha/siteverify',
        'eu' => 'https://eu.frcapi.com/api/v2/captcha/siteverify',
    ];

    public function __construct(
        private readonly Dispatcher $dispatcher,
        private readonly ExtensionManager $extensions,
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): \\Symfony\\Component\\HttpFoundation\\Response  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $settings = $this->extensions->settings('friendly-captcha');

        if (! $settings->get('enabled', false)) {
            return $next($request);
        }

        $verified = $this->verify(
            sitekey: (string) $settings->get('sitekey', ''),
            apiKey: (string) $settings->get('api_key', ''),
            solution: $this->solution($request),
            endpoint: (string) $settings->get('endpoint', 'global'),
        );

        if ($verified !== false) {
            return $next($request);
        }

        $this->dispatcher->dispatch(
            new FailedCaptcha($request->ip() ?? 'unknown', 'friendlycaptcha')
        );

        throw new HttpException(Response::HTTP_BAD_REQUEST, 'Failed to validate the captcha.');
    }

    /**
     * The submitted solution: `frc-captcha-response` from our widget, with
     * `g-recaptcha-response` as a fallback for clients still sending it.
     */
    private function solution(Request $request): string
    {
        foreach (['frc-captcha-response', 'g-recaptcha-response'] as $field) {
            $value = $request->input($field);
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return '';
    }

    /**
     * True when the solution verified, false when it is missing or invalid, and
     * null when Friendly Captcha could not be reached. The siteverify docs
     * recommend accepting requests in that case rather than locking every user
     * out during an outage, so null lets the request continue.
     *
     * @phpstan-return bool|null
     */
    private function verify(string $sitekey, string $apiKey, string $solution, string $endpoint): ?bool
    {
        if ($solution === '' || $apiKey === '') {
            return false;
        }

        try {
            $client = new Client(['timeout' => 5, 'connect_timeout' => 2]);
            $response = $client->post(self::ENDPOINTS[$endpoint] ?? self::ENDPOINTS['global'], [
                'headers' => [
                    'X-API-Key' => $apiKey,
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'response' => $solution,
                    'sitekey' => $sitekey,
                ],
            ]);
        } catch (GuzzleException) {
            return null;
        }

        if ($response->getStatusCode() !== 200) {
            return null;
        }

        $decoded = json_decode($response->getBody()->__toString(), true);

        return is_array($decoded) && ($decoded['success'] ?? false) === true;
    }
}
