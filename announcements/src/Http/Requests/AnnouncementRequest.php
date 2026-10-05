<?php

namespace Announcements\Http\Requests;

use Announcements\Models\Announcement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Access is enforced by the admin-api middleware group (root admins only).
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:191'],
            'body' => ['nullable', 'string', 'max:5000'],
            'type' => ['required', Rule::in(Announcement::TYPES)],
            'icon' => ['nullable', 'string', 'max:64', 'regex:/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/'],
            'url_label' => ['nullable', 'string', 'max:191', 'required_with:url_link'],
            'url_link' => ['nullable', 'string', 'url:http,https', 'max:2048', 'required_with:url_label'],
            'panels' => ['nullable', 'array'],
            'panels.*' => ['string', Rule::in(Announcement::AREAS)],
            'dismissible' => ['required', 'boolean'],
            'valid_from' => ['nullable', 'date'],
            'valid_to' => ['nullable', 'date', 'after:valid_from'],
        ];
    }
}
