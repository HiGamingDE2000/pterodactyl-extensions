<?php

namespace Announcements\Http\Controllers;

use Announcements\Http\Requests\AnnouncementRequest;
use Announcements\Http\Requests\SendEmailRequest;
use Announcements\Models\Announcement;
use Announcements\Notifications\AnnouncementCreated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Notification;
use Pterodactyl\Models\User;

class AdminAnnouncementController
{
    public function index(): JsonResponse
    {
        return new JsonResponse([
            'data' => Announcement::query()->orderByDesc('id')->get()->map(fn (Announcement $a) => $this->present($a))->all(),
            // Lets the admin screen say how many users "email to all users" reaches.
            'meta' => ['user_count' => User::query()->count()],
        ]);
    }

    public function store(AnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::query()->create($this->attributes($request));

        return new JsonResponse(['data' => $this->present($announcement)], 201);
    }

    public function update(AnnouncementRequest $request, int $id): JsonResponse
    {
        $announcement = Announcement::query()->findOrFail($id);
        $announcement->update($this->attributes($request));

        return new JsonResponse(['data' => $this->present($announcement->refresh())]);
    }

    public function destroy(int $id): Response
    {
        Announcement::query()->findOrFail($id)->delete();

        return new Response('', 204);
    }

    /** Queue the announcement as an email to the chosen users (all users when none are given). */
    public function email(SendEmailRequest $request, int $id): JsonResponse
    {
        $announcement = Announcement::query()->findOrFail($id);
        $ids = $request->validated('user_ids') ?? [];

        $users = User::query()->when(count($ids) > 0, fn ($query) => $query->whereIn('id', $ids))->get();
        Notification::send($users, new AnnouncementCreated($announcement));

        return new JsonResponse(['recipients' => $users->count()]);
    }

    /** @return array<string, mixed> */
    private function attributes(AnnouncementRequest $request): array
    {
        $data = $request->validated();
        $data['panels'] = array_values(array_unique($data['panels'] ?? []));

        return $data;
    }

    /** @return array<string, mixed> */
    private function present(Announcement $announcement): array
    {
        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'type' => $announcement->type,
            'icon' => $announcement->icon,
            'url_label' => $announcement->url_label,
            'url_link' => $announcement->url_link,
            'panels' => $announcement->panels ?? [],
            'dismissible' => $announcement->dismissible,
            'valid_from' => $announcement->valid_from?->toIso8601String(),
            'valid_to' => $announcement->valid_to?->toIso8601String(),
            'created_at' => $announcement->created_at->toIso8601String(),
        ];
    }
}
