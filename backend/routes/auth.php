<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/auth.php';

$users = getDB()->users;

if ($method === 'POST' && $action === 'register') {
    $d = json_decode(file_get_contents('php://input'), true);
    if (empty($d['name']) || empty($d['email']) || empty($d['password'])) {
        http_response_code(400); echo json_encode(['error' => 'All fields required']); exit;
    }
    if ($users->findOne(['email' => $d['email']])) {
        http_response_code(409); echo json_encode(['error' => 'Email already registered']); exit;
    }
    $res = $users->insertOne([
        'name'      => $d['name'],
        'email'     => $d['email'],
        'password'  => password_hash($d['password'], PASSWORD_BCRYPT),
        'role'      => 'admin', // first user is admin for demo
        'createdAt' => new MongoDB\BSON\UTCDateTime(),
    ]);
    $token = generateToken($res->getInsertedId(), $d['email'], 'admin');
    echo json_encode(['token' => $token, 'name' => $d['name'], 'email' => $d['email'], 'role' => 'admin']);
}

if ($method === 'POST' && $action === 'login') {
    $d = json_decode(file_get_contents('php://input'), true);
    $user = $users->findOne(['email' => $d['email'] ?? '']);
    if (!$user || !password_verify($d['password'] ?? '', $user->password)) {
        http_response_code(401); echo json_encode(['error' => 'Invalid credentials']); exit;
    }
    $token = generateToken($user->_id, $user->email, $user->role);
    echo json_encode(['token' => $token, 'name' => $user->name, 'email' => $user->email, 'role' => $user->role]);
}
