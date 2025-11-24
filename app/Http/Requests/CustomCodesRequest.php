<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomCodesRequest extends FormRequest
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
        $rules = [
            'codes' => 'required|string',
            'source' => 'required|string',
        ];
        if($this->has('card_id')){
            $rules['card_id'] = 'required|exists:cards,id';
        }

        return $rules;
    }
}
