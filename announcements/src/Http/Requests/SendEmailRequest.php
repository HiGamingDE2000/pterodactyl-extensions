<?php

namespace Announcements\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_ids' => ['nullable', 'array', 'max:500'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
