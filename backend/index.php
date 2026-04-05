<?php
header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$parts  = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$action = $parts[1] ?? '';
$id     = $parts[2] ?? null;

match (true) {
    in_array($action, ['register', 'login'])              => require __DIR__ . '/routes/auth.php',
    in_array($action, ['products', 'product'])            => require __DIR__ . '/routes/products.php',
    in_array($action, ['suppliers', 'supplier'])          => require __DIR__ . '/routes/suppliers.php',
    in_array($action, ['transactions', 'transaction'])    => require __DIR__ . '/routes/transactions.php',
    default => (function() { http_response_code(404); echo json_encode(['error' => 'Not found']); })()
};
