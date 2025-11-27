<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactGroup extends Model
{
    protected $connection = 'backoffice';
    protected $table = 'contactgroups';
    protected $primaryKey = 'uid';

    protected $fillable = ['name'];

    public function contacts()
    {
        return $this->belongsToMany(Contact::class, 'con_group', 'groupuid', 'cuid');
    }
}
