<?php

namespace Lib;

use Exception;
use PDO;
use PDOException;

class Connect
{

    public $db;
    public function __construct()
    {
        try {
            $dbname = env('DB_DATABASE');
            $user = env('DB_USERNAME');
            $password = env('DB_PASSWORD');
            $host = env('DB_HOST', '127.0.0.1');
            $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
            $this->db = $conn;
        } catch (PDOException $e) {
            return false;
        }
    }
}
