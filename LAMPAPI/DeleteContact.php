<?php
require_once "common.php";

$input = getRequestInfo();

$id = $input["id"] ?? 0;
$userId = $input["userId"] ?? 0;

if ($id == 0 || $userId == 0)
{
    sendJson(["error" => "Contact ID and user ID are required"]);
    exit();
}

$conn = getConnection();

if ($conn->connect_error)
{
    sendJson(["error" => "Database connection failed"]);
    exit();
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
