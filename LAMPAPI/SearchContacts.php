<?php
// Set response headers for JSON and allow Cross-Origin requests (CORS)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight OPTIONS requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Helper function to read incoming JSON payload
function getRequestInfo()
{
    $rawInput = file_get_contents("php://input");
    return json_decode($rawInput, true) ?? [];
}

// Helper function to send JSON responses with proper HTTP status codes
function sendJson($data, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

$input = getRequestInfo();

// Force UserID to be an integer and check validity
$userId = isset($input["userId"]) ? (int)$input["userId"] : 0;
if ($userId <= 0) {
    sendJson(["results" => [], "error" => "Invalid or missing User ID"], 400);
}

// Grab the search string
$searchParam = trim($input["search"] ?? "");

if (strlen($searchParam) > 0) {
    // This forces MySQL to match ONLY strings that start with this sequence.
    $search = $searchParam . "%";
} else {
    $search = "%"; // If empty, it will match all contacts for this user
}

mysqli_report(MYSQLI_REPORT_OFF);
$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    sendJson(["results" => [], "error" => "Database connection failed"], 500);
}

// Strictly matching the beginning of the fields using LIKE with no leading %
$query = "SELECT ID, FirstName, LastName, Phone, Email 
          FROM Contacts 
          WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?) 
          ORDER BY LastName, FirstName";

$stmt = $conn->prepare($query);

if (!$stmt) {
    error_log("Statement preparation failed: " . $conn->error);
    sendJson(["results" => [], "error" => "Internal server error"], 500);
}

// Bind variables and execute
$stmt->bind_param("issss", $userId, $search, $search, $search, $search);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

// Clean up database resources
$stmt->close();
$conn->close();

// Return the strictly matched contacts
sendJson(["results" => $contacts, "error" => ""], 200);
?>