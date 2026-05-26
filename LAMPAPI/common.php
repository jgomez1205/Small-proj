<?php
// common.php - shared helpers for all endpoints

// Get JSON input from request body
function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
}

// Send JSON response with optional HTTP status code
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Error response 
function returnWithError($err) {
    sendJson(["id" => 0, "firstName" => "", "lastName" => "", "error" => $err], 200);
}

// Success response for login / user info
function returnWithInfo($firstName, $lastName, $id) {
    sendJson(["id" => $id, "firstName" => $firstName, "lastName" => $lastName, "error" => ""], 200);
}

// Generic success for contacts
function returnSuccess($message = "") {
    sendJson(["success" => true, "message" => $message], 200);
}

// Database connection (hardcoded)
function getDB() {
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
        exit();
    }
    return $conn;
}
?>