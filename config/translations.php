<?php

$translations = json_encode([]);
if(file_exists(storage_path('/app/translations.json'))){
    $translations = file_get_contents(storage_path('/app/translations.json'));
}

return [
    'content' => $translations
];