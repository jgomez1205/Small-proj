<?php
require_once "common.php";

$input = getRequestInfo();

$firstName = $input["firstName"] ?? "";
$lastName = $input["lastName"] ?? "";
$login = $input["login"] ?? "";
$password = $input["password"] ?? "";

if ($firstName === "" || $lastName === "" || $login === "" || $password === "")
{
    sendJson(["error" => "All fields are required"]);
    exit();
}

$conn = getConnection();

if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
    exit();
}

$check = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
$check->bind_param("s", $login);
$check->execute();
$existing = $check->get_result();

if ($existing->num_rows > 0)
{
    sendJson(["error" => "Username already exists"]);
    $check->close();
    $conn->close();
    exit();
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
