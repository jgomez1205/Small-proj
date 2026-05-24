<?php
require_once 'common.php';

$inData = getRequestInfo();

if (!isset($inData["contactId"])) {
    returnWithError("Missing contactId");
    exit();
}

$contactId = $inData["contactId"];

$conn = getDB();
$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=?");
$stmt->bind_param("i", $contactId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    sendJson(["success" => true, "message" => "Contact deleted"], 200);
} else {
    returnWithError("Contact not found");
}

$stmt->close();
$conn->close();
?>