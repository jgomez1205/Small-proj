<?php
require_once "common.php";

$input = getRequestInfo();

$firstName = $input["firstName"] ?? "";
$lastName = $input["lastName"] ?? "";
$phone = $input["phone"] ?? "";
$email = $input["email"] ?? "";
$userId = $input["userId"] ?? 0;

if ($firstName === "" || $lastName === "" || $phone === "" || $email === "" || $userId == 0)
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
