<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getJWTSecret() {
    return getenv('JWT_SECRET') ?: 'inventory_secret';
}

function generateToken($userId, $email, $role) {
    return JWT::encode([
        'iat'    => time(),
        'exp'    => time() + 86400,
        'userId' => (string) $userId,
        'email'  => $email,
        'role'   => $role,
    ], getJWTSecret(), 'HS256');
}

function requireAuth() {
    $auth = getallheaders()['Authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) {
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); exit;
    }
    try {
        return (array) JWT::decode(substr($auth, 7), new Key(getJWTSecret(), 'HS256'));
    } catch (Exception $e) {
        http_response_code(401); echo json_encode(['error' => 'Invalid token']); exit;
    }
}
