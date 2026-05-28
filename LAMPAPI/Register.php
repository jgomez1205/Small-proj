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
$login = $input["login"] ?? "";
$password = $input["password"] ?? "";

if ($firstName === "" || $lastName === "" || $login === "" || $password === "")
{
    sendJson(["error" => "All fields are required"]);
}

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
}

// Check if username already exists
$check = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
$check->bind_param("s", $login);
$check->execute();
$existing = $check->get_result();
if ($existing->num_rows > 0)
{
    $check->close();
    $conn->close();
    sendJson(["error" => "Username already exists"]);
}
$check->close();

$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
if ($stmt->execute())
{
    sendJson(["error" => ""]);
}
else
{
    sendJson(["error" => "Signup failed"]);
}

$stmt->close();
$conn->close();
?>