<?php

use App\Models\Translation;

function translate($text, $data = []){
    if(empty($text)) return $text;

    $lang = !empty($_COOKIE['locale']) ?$_COOKIE['locale']: 'en';
    $translations = null;

    //dd(config('translations.content'));

    if(!empty(config('translations.content'))){
        $translations = json_decode(config('translations.content'), true);
    }

    if(!empty($translations[$text])){
        if(!empty($translations[$text][$lang])){
            $translated = $translations[$text][$lang];
        }
    }else{
        if(!empty($_COOKIE['translator'])){
            $translation = Translation::where('default', $text)->first();
            if(!$translation){
                $translation = new Translation();
                $translation->default = $text;
                $translation->save();
            }
        }
    }

    if(empty($translated)) $translated = $text;

    if(!empty($data)){
        $keys = [];
        foreach(array_keys($data) as $key){
            $keys[] = sprintf('[:%s]', $key);
        }
        $translated = str_replace($keys,array_values($data),$translated);
    }

    return $translated;
}

function text($obj, $lang = '')
{
    if (empty($lang) && !empty($_COOKIE['locale']))  $lang = $_COOKIE['locale'];
    if (empty($lang)) $lang = 'def';

    if (empty($obj) || !is_object($obj)) return '';
    if (!empty($obj->{$lang})) return trim($obj->{$lang});
    else{
        if(!empty($obj->def)) return trim($obj->def);
        if(!empty($obj->default)) return trim($obj->default);
    }
}
function price($obj, $lang = '')
{
    if (empty($lang) && !empty($_COOKIE['locale']))  $lang = $_COOKIE['locale'];
    if (empty($lang)) $lang = 'def';

    $currency = [
        'def' => 'EUR',
        'de' => 'EUR',
        'en' => 'USD'
    ];

    if (empty($obj) || !is_object($obj)) return 0;
    if (!empty($obj->{$currency[$lang]})) return trim($obj->{$currency[$lang]});
    else{
        if(!empty($obj->{$currency['def']})) return trim($obj->{$currency['def']});
    }
    return 0;
}


function generateTransactionCode()
{
    return 'TXN-' . strtoupper(uniqid()) . '-' . mt_rand(1000, 9999);
}
