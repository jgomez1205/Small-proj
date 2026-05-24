<?php
require_once 'common.php';

$inData = getRequestInfo();

if (!isset($inData["userId"]) || !isset($inData["firstName"]) || !isset($inData["lastName"]) || !isset($inData["phone"]) || !isset($inData["email"])) {
    returnWithError("Missing contact fields");
    exit();
}

$userId = $inData["userId"];
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phone = $inData["phone"];
$email = $inData["email"];

$conn = getDB();
$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);

if ($stmt->execute()) {
    $contactId = $stmt->insert_id;
    sendJson(["success" => true, "contactId" => $contactId], 200);
} else {
    returnWithError("Failed to add contact");
}

$stmt->close();
$conn->close();
?>