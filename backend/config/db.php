<?php
require_once __DIR__ . '/../vendor/autoload.php';

function getDB() {
    $client = new MongoDB\Client(getenv('MONGO_URI') ?: 'mongodb://localhost:27017');
    return $client->selectDatabase(getenv('MONGO_DB') ?: 'inventory');
}
