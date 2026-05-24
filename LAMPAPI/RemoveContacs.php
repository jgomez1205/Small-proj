<?php
require_once 'common.php';

if (!isset($_GET['userId'])) {
    returnWithError("Missing userId");
    exit();
}

$userId = $_GET['userId'];
$conn = getDB();

$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID=?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

sendJson(["success" => true, "contacts" => $contacts], 200);

$stmt->close();
$conn->close();
?>