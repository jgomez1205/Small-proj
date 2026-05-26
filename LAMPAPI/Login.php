<?php
require_once "common.php";

$input = getRequestInfo();

$login = $input["login"] ?? "";
$password = $input["password"] ?? "";

$conn = getConnection();

if ($conn->connect_error)
{
    sendJson(["id" => 0, "firstName" => "", "lastName" => "", "error" => "Database connection failed"]);
    exit();
}

$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login = ? AND Password = ?");
$stmt->bind_param("ss", $login, $password);
$stmt->execute();

$result = $stmt->get_result();

if ($row = $result->fetch_assoc())
{
    sendJson(["id" => $row["ID"], "firstName" => $row["FirstName"], "lastName" => $row["LastName"], "error" => ""]);
}
else
{
    sendJson(["id" => 0, "firstName" => "", "lastName" => "", "error" => "Invalid username or password"]);
}

$stmt->close();
$conn->close();
?>
