<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $connection = 'backoffice';
    protected $table = 'contacts';
    protected $primaryKey = 'uid';

    protected $fillable = [
        'email', 'password', 'invoice_email', 'active', 'buid',
        'customer', 'branch', 'archive', 'registered'
    ];

    public function groups()
    {
        return $this->belongsToMany(ContactGroup::class, 'con_group', 'cuid', 'groupuid');
    }

    public function enterpriseLinks()
    {
        return $this->hasMany(C2C::class, 'cuid2');
    }
}
