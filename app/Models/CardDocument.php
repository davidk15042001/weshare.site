<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardDocument extends Model
{
    use HasFactory;
    
    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return asset('storage/'.$this->path);
    }
}
