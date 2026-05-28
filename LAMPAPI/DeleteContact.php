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
$id = $input["id"] ?? 0;
$userId = $input["userId"] ?? 0;

if ($id == 0 || $userId == 0)
{
    sendJson(["error" => "Contact ID and user ID are required"]);
}

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
}

$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
$stmt->bind_param("ii", $id, $userId);
if ($stmt->execute())
{
    sendJson(["error" => ""]);
}
else
{
    sendJson(["error" => "Contact was not deleted"]);
}

$stmt->close();
$conn->close();
?>