<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

function getRequestInfo()
{
    return json_decode(file_get_contents("php://input"), true);
}

function sendJson($data)
{
    echo json_encode($data);
    exit();
}

$input = getRequestInfo();
$login = $input["login"] ?? "";
$password = $input["password"] ?? "";

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error)
{
    sendJson(["id" => 0, "firstName" => "", "lastName" => "", "error" => "Database connection failed"]);
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