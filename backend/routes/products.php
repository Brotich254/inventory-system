<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$db       = getDB();
$products = $db->products;

function formatProduct($p) {
    $a = (array) $p;
    $a['_id'] = (string) $p->_id;
    return $a;
}

// GET all products
if ($method === 'GET' && $action === 'products') {
    requireAuth();
    $cursor = $products->find([], ['sort' => ['name' => 1]]);
    echo json_encode(array_map('formatProduct', iterator_to_array($cursor, false)));
}

// GET single product
if ($method === 'GET' && $action === 'product') {
    requireAuth();
    try {
        $p = $products->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        if (!$p) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }
        echo json_encode(formatProduct($p));
    } catch (Exception $e) { http_response_code(400); echo json_encode(['error' => 'Invalid ID']); }
}

// POST create product
if ($method === 'POST' && $action === 'products') {
    requireAuth();
    $d = json_decode(file_get_contents('php://input'), true);
    foreach (['name', 'sku', 'category', 'price', 'stock', 'supplier'] as $f) {
        if (!isset($d[$f]) || $d[$f] === '') {
            http_response_code(400); echo json_encode(['error' => "$f is required"]); exit;
        }
    }
    if ($products->findOne(['sku' => $d['sku']])) {
        http_response_code(409); echo json_encode(['error' => 'SKU already exists']); exit;
    }
    $res = $products->insertOne([
        'name'        => $d['name'],
        'sku'         => strtoupper($d['sku']),
        'category'    => $d['category'],
        'price'       => (float) $d['price'],
        'stock'       => (int) $d['stock'],
        'lowStockAt'  => (int) ($d['lowStockAt'] ?? 10),
        'supplier'    => $d['supplier'],
        'description' => $d['description'] ?? '',
        'createdAt'   => new MongoDB\BSON\UTCDateTime(),
    ]);
    echo json_encode(['id' => (string) $res->getInsertedId()]);
}

// PUT update product
if ($method === 'PUT' && $action === 'product') {
    requireAuth();
    $d = json_decode(file_get_contents('php://input'), true);
    try {
        $update = array_filter([
            'name'        => $d['name'] ?? null,
            'category'    => $d['category'] ?? null,
            'price'       => isset($d['price']) ? (float) $d['price'] : null,
            'stock'       => isset($d['stock']) ? (int) $d['stock'] : null,
            'lowStockAt'  => isset($d['lowStockAt']) ? (int) $d['lowStockAt'] : null,
            'supplier'    => $d['supplier'] ?? null,
            'description' => $d['description'] ?? null,
        ], fn($v) => $v !== null);
        $products->updateOne(['_id' => new MongoDB\BSON\ObjectId($id)], ['$set' => $update]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) { http_response_code(400); echo json_encode(['error' => 'Invalid ID']); }
}

// DELETE product
if ($method === 'DELETE' && $action === 'product') {
    requireAuth();
    try {
        $products->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) { http_response_code(400); echo json_encode(['error' => 'Invalid ID']); }
}
