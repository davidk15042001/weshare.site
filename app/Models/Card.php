<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Card extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'identifier',
        'firstname',
        'lastname',
        'cover',
        'cover_thumbnail',
        'cover_type',
        'job',
        'company',
        'phone',
        'mobile',
        'email',
        'address'
    ];

    public function getSocialsAttribute($value)
    {
        return json_decode($value);
    }

    public function getSettingsAttribute($value)
    {
        return json_decode($value);
    }
    public function getCoverAttribute($value)
    {
        if(empty($value)){
            return '';
        }else{
            return $value;
        }

    }

    public function callbacks()
    {
        return $this->hasMany(CallBack::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
