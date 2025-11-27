<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class C2C extends Model
{
    protected $connection = 'backoffice';
    protected $table = 'c2c';

    protected $fillable = ['cuid', 'cuid2'];

    public function company()
    {
        return $this->belongsTo(Contact::class, 'cuid');
    }

    public function user()
    {
        return $this->belongsTo(Contact::class, 'cuid2');
    }
}
