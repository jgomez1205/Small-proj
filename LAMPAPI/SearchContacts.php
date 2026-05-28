<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

function getRequestInfo()
{
    return json_decode(file_get_contents("php://input"), true);
}

function sendJson($data)
{
    echo json_encode($data);
    exit();
}

$input = getRequestInfo();
$search = "%" . ($input["search"] ?? "") . "%";
$userId = $input["userId"] ?? 0;

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    sendJson(["results" => [], "error" => "Database connection failed"]);
}

$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?) ORDER BY LastName, FirstName");
$stmt->bind_param("issss", $userId, $search, $search, $search, $search);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc())
{
    $contacts[] = $row;
}

sendJson(["results" => $contacts, "error" => ""]);

$stmt->close();
$conn->close();
?>