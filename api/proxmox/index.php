<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');
//모듈 폴더 path정의
require(__DIR__ . '/../../vendor/autoload.php');

use Proxmox\Request;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$Proxmox_id = $_ENV["Proxmox_id"];
$Proxmox_Password = $_ENV["Proxmox_Password"];
$Proxmox_ip = $_ENV["Proxmox_ip"];
$Proxmox_port = $_ENV["Proxmox_port"];

$configure = [
    'hostname' => $Proxmox_ip,
    'username' => $Proxmox_id,
    'password' => $Proxmox_Password,
    // 'realm'     => 'pam',
    'port' => $Proxmox_port
];

//파라미터 사전 설정
$parameter = $_GET["search"] ?? null;

//VM을 조회시 어떤 VM을 조회할지 가져오기 
$Search_VM = $_GET["vmid"] ?? null;

//실시간 데이터조회를 위한
$node = $_GET["node"] ?? null;
$type = $_GET["type"] ?? null;

//내부에서 Department에서 토큰의 정보를 해석하게 한다. (필요 데이터 토큰)
function Auth($token)
{
    $url = "localhost:8833/api/department?type=infoUser";

    // 요청에 사용할 데이터
    $data = [
        "token" => $token
    ];

    // cURL 초기화
    $ch = curl_init();

    // cURL 옵션 설정
    curl_setopt($ch, CURLOPT_URL, $url); // 요청 URL
    curl_setopt($ch, CURLOPT_POST, true); // POST 요청 설정
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data)); // 요청 데이터 설정 (JSON 형식으로 변환)
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 응답을 반환하도록 설정

    // 요청 실행
    $response = curl_exec($ch);

    // 오류 확인
    if (curl_errno($ch)) {
        echo "cURL Error: " . curl_error($ch);
    } else {
        $data = json_decode($response, true);

        // Admin 값 추출
        if (isset($data['Admin'])) {
            echo $data['Admin'];
        }
    }

    // cURL 종료
    curl_close($ch);
}

try {
    Request::Login($configure);
    switch ($parameter) {
        //노드 시스템 현황 보여주는 코드
        case 'nodes':
            http_response_code(200);
            $response = Request::Request('/nodes', null, 'GET');
            echo json_encode($response);
            break;

        //실시간 정보 수집
        case 'livedata':
            $ID = $_GET["id"] ?? null;
            //{node}/qemu/{vmid}/status/current
            $nodes = Request::Request('/nodes/' . $node . '/' . $type . '/' . $ID . '/status/current', null, 'GET');
            echo json_encode($nodes);
            break;

        //VM생성하는 코드
        case 'createvm':
            //토큰으로 권한 확인한다.
            if (Auth($_GET["token"]) == 1) {

                //사전에 필요한 정보 삽입
                $sourceVmid = $_GET["sourceVmid"] ?? null;
                $newVmid = $_GET["newVmid"] ?? null;
                $newVmName = $_GET["newVmName"] ?? null;
                $targetNode = $_GET["targetNode"] ?? null;
                $ciUser = $_GET["ciUser"] ?? null;
                $ciPassword = $_GET["ciPassword"] ?? null;
                $ipConfig = $_GET["ipConfig"] ?? null;  //예시: "ip=192.168.1.100/24,gw=192.168.1.1" 적어서 제출한다.

                // 7개 정보중 하나라도 없으면 오류 반환
                if (!$sourceVmid || !$newVmid || !$newVmName || !$targetNode || !$ciUser || !$ciPassword || !$ipConfig) {
                    http_response_code(400);
                    echo json_encode(['error' => "Missing required parameters for VM creation"]);
                    break;
                }

                //서버 생성을 위환 기본 설정
                $cloneParams = [
                    'newid' => $newVmid,
                    'name' => $newVmName,
                    'full' => 1,
                    'target' => $targetNode,
                    'storage' => 'Template', //다른 저장소로 변경이 가능하다.
                ];

                // 클론하기
                $result = Request::Request("/nodes/{$targetNode}/qemu/{$sourceVmid}/clone", $cloneParams, 'POST');

                if (isset($result['data'])) {
                    // VM 클론 성공 후 cloud-init 설정
                    $cloudInitParams = [
                        'ciuser' => $ciUser,
                        'cipassword' => $ciPassword,
                        'ipconfig0' => $ipConfig,
                    ];

                    $cloudInitResult = Request::Request("/nodes/{$targetNode}/qemu/{$newVmid}/config", $cloudInitParams, 'POST');

                    if (isset($cloudInitResult['data'])) {
                        http_response_code(200);
                        echo json_encode(['success' => "VM successfully cloned and cloud-init configured", 'data' => $cloudInitResult['data']]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['error' => "Failed to configure cloud-init", 'data' => $cloudInitResult]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => "Failed to clone VM", 'data' => $result]);
                }
            } else {
                http_response_code(500);
                echo json_encode(['error' => "No permission"]);
            }
            break;
            
        //VM 서버 시작
        case "power_on":
            break;

        //다른 상황이 입력되는 경우
        default:
            http_response_code(400);
            echo json_encode(['error' => "No valid parameter provided!"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
