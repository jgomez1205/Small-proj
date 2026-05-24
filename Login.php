<?php
require_once 'common.php';

$inData = getRequestInfo();

$conn = getDB();
$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login=? AND Password=?");
$stmt->bind_param("ss", $inData["login"], $inData["password"]);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    returnWithInfo($row['FirstName'], $row['LastName'], $row['ID']);
} else {
    returnWithError("No Records Found");
}

$stmt->close();
$conn->close();
?>