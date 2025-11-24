<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoogleReview extends Model
{
    use HasFactory;

    protected $fillable = ["place_id", "reviews"];

    public function getReviewsAttribute($value)
    {
        return json_decode($value);
    }
}
