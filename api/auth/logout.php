<?php
//모듈 불려오기기
require(__DIR__ . '/../../vendor/autoload.php');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// 공개되는 프로젝트 이므로 키값 무단 공개 금지
$servername = $_ENV['DB_HOST'];
$name = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];
$dbname = $_ENV['DB_NAME'];
$port = $_ENV['DB_PORT'];
$JWTkey = $_ENV['JWT_KEY'];

$conn = new mysqli($servername, $name, $password, $dbname, $port);
try {
    // 요청 메소드 가져오기
    $request_method = $_SERVER['REQUEST_METHOD'];
    if ($request_method == "POST") {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, TRUE);
        $token = $input["token"];
        $sql = "DELETE  FROM auth_session WHERE jwt_access = '$token'";
        $conn->query($sql);
        http_response_code(200);
        echo json_encode(["Code" => "20005", 'Logout' => true]);
    } else {
        http_response_code(502);
        echo json_encode(["Code" => "51109", 'Error' => "Client Error"]);
    }
} catch (\Throwable $th) {
    http_response_code(500);
    json_encode(["Code" => "50001", 'Error' => "Server ERROR" . $th->getMessage()]);
}
?>