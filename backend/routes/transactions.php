<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$db           = getDB();
$transactions = $db->transactions;
$products     = $db->products;

function formatTx($t) {
    $a = (array) $t;
    $a['_id'] = (string) $t->_id;
    $a['createdAt'] = $t->createdAt instanceof MongoDB\BSON\UTCDateTime
        ? $t->createdAt->toDateTime()->format('Y-m-d H:i')
        : '';
    return $a;
}

// GET all transactions (optionally filter by productId)
if ($method === 'GET' && $action === 'transactions') {
    requireAuth();
    $filter = [];
    if (!empty($_GET['productId'])) $filter['productId'] = $_GET['productId'];
    $cursor = $transactions->find($filter, ['sort' => ['createdAt' => -1], 'limit' => 100]);
    echo json_encode(array_map('formatTx', iterator_to_array($cursor, false)));
}

// POST stock-in or stock-out
if ($method === 'POST' && $action === 'transactions') {
    $user = requireAuth();
    $d = json_decode(file_get_contents('php://input'), true);
    $type = $d['type'] ?? ''; // 'in' or 'out'
    $qty  = (int) ($d['quantity'] ?? 0);
    $pid  = $d['productId'] ?? '';

    if (!in_array($type, ['in', 'out']) || $qty <= 0 || !$pid) {
        http_response_code(400); echo json_encode(['error' => 'type (in/out), quantity, productId required']); exit;
    }

    try {
        $oid     = new MongoDB\BSON\ObjectId($pid);
        $product = $products->findOne(['_id' => $oid]);
        if (!$product) { http_response_code(404); echo json_encode(['error' => 'Product not found']); exit; }

        $newStock = $type === 'in' ? $product->stock + $qty : $product->stock - $qty;
        if ($newStock < 0) { http_response_code(400); echo json_encode(['error' => 'Insufficient stock']); exit; }

        $products->updateOne(['_id' => $oid], ['$set' => ['stock' => $newStock]]);
        $transactions->insertOne([
            'productId'   => $pid,
            'productName' => $product->name,
            'type'        => $type,
            'quantity'    => $qty,
            'stockAfter'  => $newStock,
            'note'        => $d['note'] ?? '',
            'userId'      => $user['userId'],
            'createdAt'   => new MongoDB\BSON\UTCDateTime(),
        ]);
        echo json_encode(['success' => true, 'newStock' => $newStock]);
    } catch (Exception $e) { http_response_code(400); echo json_encode(['error' => 'Invalid productId']); }
}
