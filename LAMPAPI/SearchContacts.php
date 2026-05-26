<?php
require_once "common.php";

$input = getRequestInfo();

$search = "%" . ($input["search"] ?? "") . "%";
$userId = $input["userId"] ?? 0;

$conn = getConnection();

if ($conn->connect_error)
{
    sendJson(["results" => [], "error" => "Database connection failed"]);
    exit();
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
