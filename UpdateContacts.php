<?php
require_once 'common.php';

$inData = getRequestInfo();

if (!isset($inData["contactId"]) || !isset($inData["firstName"]) || !isset($inData["lastName"]) || !isset($inData["phone"]) || !isset($inData["email"])) {
    returnWithError("Missing fields");
    exit();
}

$contactId = $inData["contactId"];
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phone = $inData["phone"];
$email = $inData["email"];

$conn = getDB();
$stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=?");
$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $contactId);

if ($stmt->execute() && $stmt->affected_rows >= 0) {
    sendJson(["success" => true, "message" => "Contact updated"], 200);
} else {
    returnWithError("Update failed");
}

$stmt->close();
$conn->close();
