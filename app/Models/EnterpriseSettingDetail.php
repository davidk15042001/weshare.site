<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnterpriseSettingDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        "enterprise_id",
        "cover",
        "avatar",
        "logo",
        "services",
        "socials",
        "galleries",
        "projects",
        "documents",
        "custom_codes",
        "settings"
    ];

    public function getCoverAttribute($value)
    {
        return json_decode($value);
    }

    public function getServicesAttribute($value)
    {
        $values = json_decode($value);
        usort($values,function($a, $b) { return (int)$a->id < (int)$b->id; });
        return $values;
    }

    public function getSocialsAttribute($value)
    {
        return json_decode($value);
    }

    public function getGalleriesAttribute($value)
    {
        $values = json_decode($value);
        usort($values,function($a, $b) { return (int)$a->id < (int)$b->id; });
        return $values;
    }

    public function getProjectsAttribute($value)
    {
        $values = json_decode($value);
        usort($values,function($a, $b) { return (int)$a->id < (int)$b->id; });
        return $values;
    }

    public function getDocumentsAttribute($value)
    {
        $values = json_decode($value);
        usort($values,function($a, $b) { return (int)$a->id < (int)$b->id; });
        return $values;
    }

    public function getCustomCodesAttribute($value)
    {
        $values = json_decode($value);
        usort($values,function($a, $b) { return (int)$a->id < (int)$b->id; });
        return $values;
    }

    public function getSettingsAttribute($value)
    {
        if(is_null($value)) return ["button" => ["color" => null, "background" => null]];
        return json_decode($value);
    }
}
