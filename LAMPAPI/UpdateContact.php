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
$firstName = $input["firstName"] ?? "";
$lastName = $input["lastName"] ?? "";
$phone = $input["phone"] ?? "";
$email = $input["email"] ?? "";
$userId = $input["userId"] ?? 0;

if ($id == 0 || $firstName === "" || $lastName === "" || $phone === "" || $email === "" || $userId == 0)
{
    sendJson(["error" => "All fields are required"]);
}

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
}

$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ? AND UserID = ?");
$stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $id, $userId);
if ($stmt->execute())
{
    sendJson(["error" => ""]);
}
else
{
    sendJson(["error" => "Contact was not updated"]);
}

$stmt->close();
$conn->close();
?>