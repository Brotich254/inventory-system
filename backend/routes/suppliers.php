<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$suppliers = getDB()->suppliers;

function formatSupplier($s) {
    $a = (array) $s;
    $a['_id'] = (string) $s->_id;
    return $a;
}

if ($method === 'GET' && $action === 'suppliers') {
    requireAuth();
    $cursor = $suppliers->find([], ['sort' => ['name' => 1]]);
    echo json_encode(array_map('formatSupplier', iterator_to_array($cursor, false)));
}

if ($method === 'POST' && $action === 'suppliers') {
    requireAuth();
    $d = json_decode(file_get_contents('php://input'), true);
    if (empty($d['name']) || empty($d['email'])) {
        http_response_code(400); echo json_encode(['error' => 'Name and email required']); exit;
    }
    $res = $suppliers->insertOne([
        'name'      => $d['name'],
        'email'     => $d['email'],
        'phone'     => $d['phone'] ?? '',
        'address'   => $d['address'] ?? '',
        'createdAt' => new MongoDB\BSON\UTCDateTime(),
    ]);
    echo json_encode(['id' => (string) $res->getInsertedId()]);
}

if ($method === 'DELETE' && $action === 'supplier') {
    requireAuth();
    try {
        $suppliers->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) { http_response_code(400); echo json_encode(['error' => 'Invalid ID']); }
}
