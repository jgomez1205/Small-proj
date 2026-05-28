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
$firstName = $input["firstName"] ?? "";
$lastName = $input["lastName"] ?? "";
$phone = $input["phone"] ?? "";
$email = $input["email"] ?? "";
$userId = $input["userId"] ?? 0;

if ($firstName === "" || $lastName === "" || $phone === "" || $email === "" || $userId == 0)
{
    sendJson(["error" => "All fields are required"]);
}

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
}

$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
if ($stmt->execute())
{
    sendJson(["error" => ""]);
}
else
{
    sendJson(["error" => "Contact was not added"]);
}

$stmt->close();
$conn->close();
?>