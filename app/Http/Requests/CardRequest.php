<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CardRequest extends FormRequest
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
        // $rules = [
        //     'firstname' => 'required|string',
        //     'lastname' => 'required|string',
        //     'email' => 'required|email',
        // ];

        // if($this->has('user_id')){
        //     $rules['user_id'] = 'required|exists:users,id';
        // }
        // return $rules;
    }
}
