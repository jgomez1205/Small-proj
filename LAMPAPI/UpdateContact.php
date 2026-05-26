<?php
require_once "common.php";

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
    exit();
}

$conn = getConnection();

if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
    exit();
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
