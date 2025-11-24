<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'title',
        'description',
        'company',
        'attachment',
        'link',
        'month',
        'year'
    ];

    // public function getLinkAttribute($value) {
    //     if (strpos($value, 'https://') == -1 && strpos($value, 'http://') == -1) {
    //         return "https://".$value;
    //     }
    //     return $value;
    // }
}
