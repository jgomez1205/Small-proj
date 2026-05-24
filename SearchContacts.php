<?php
require_once 'common.php';

if (!isset($_GET['userId']) || !isset($_GET['search'])) {
    returnWithError("Missing userId or search term");
    exit();
}

$userId = $_GET['userId'];
$search = "%" . $_GET['search'] . "%";

$conn = getDB();
$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID=? AND (FirstName LIKE ? OR LastName LIKE ?)");
$stmt->bind_param("iss", $userId, $search, $search);
$stmt->execute();
$result = $stmt->get_result();

$results = [];
while ($row = $result->fetch_assoc()) {
    $results[] = $row;
}

sendJson(["success" => true, "results" => $results], 200);

$stmt->close();
$conn->close();
?>