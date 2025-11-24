<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeamRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'jobTitle' => 'required|string',
            'email' => 'required|string|email|max:255|unique:users',
            // 'company' => 'string',
            // 'phone' => 'string',
            // 'mobile' => 'string',
            // 'address' => 'string',
            // 'facebook' => 'string',
            // 'linkedin' => 'string',
            // 'whatsapp' => 'string',
        ];
    }
}
