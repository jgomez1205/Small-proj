<?php
require_once 'common.php';

$inData = getRequestInfo();

// Validate required fields
if (!isset($inData["login"]) || !isset($inData["password"]) || !isset($inData["firstName"]) || !isset($inData["lastName"])) {
    returnWithError("Missing required fields");
    exit();
}

$login = $inData["login"];
$password = $inData["password"];
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];

$conn = getDB();

// Check if username already exists
$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
$stmt->bind_param("s", $login);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    $conn->close();
    returnWithError("Username already taken");
    exit();
}
$stmt->close();

// Insert new user (plain password)
$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    returnWithInfo($firstName, $lastName, $newId);
} else {
    returnWithError("Registration failed");
}

$stmt->close();
$conn->close();
?>