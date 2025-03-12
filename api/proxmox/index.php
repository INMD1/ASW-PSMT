<?php
//모듈 폴더 path정의
require(__DIR__ . '/../../vendor/autoload.php');
use Proxmox\Request;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$configure = [
    'hostname' => $_ENV["Proxmox_ip"],
    'username' => $_ENV["Proxmox_id"],
    'password' => $_ENV["Proxmox_Password"],
    // 'realm'     => 'pam',
    'port' => $_ENV["Proxmox_port"]
];

//파라미터 사전 설정
$parameter = isset($_GET["mode"]) ? $_GET["mode"] : null;

//VM을 조회시 어떤 VM을 조회할지 가져오기 
$Search_VM = isset($_GET["vmid"]) ? $_GET["vmid"] : null;

//실시간 데이터조회를 위한
$node = isset($_GET["node"]) ? $_GET["node"] : null;
$type = isset($_GET["type"]) ? $_GET["type"] : null;


//내부에서 Department에서 토큰의 정보를 해석하게 한다. (필요 데이터 토큰)
//내부 에서 돌아가는 코드 이기 때문에 외부에서는 작동이 안된다.
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
        if (isset($data['Admin']) == 1) {
            return "true";
        } else {
            return "false";
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
            $ID = isset($_GET["id"]) ? $_GET["id"] : null;
            //{node}/qemu/{vmid}/status/current
            $nodes = Request::Request('/nodes/computer6/qemu/' . $ID . '/status/current', null, 'GET');
            echo json_encode($nodes);
            break;

        //VM생성하는 코드
        case 'createvm':
            //토큰으로 권한 확인한다.
            $asdads = Auth($_GET["token"]);
            if ($asdads == "true") {
                //사전에 필요한 정보 삽입
                $sourceVmid = isset($_GET["sourceVmid"]) ? $_GET["sourceVmid"] : null;
                $newVmid = isset($_GET["newVmid"]) ? $_GET["newVmid"] : null;
                $newVmName = isset($_GET["newVmName"]) ? $_GET["newVmName"] : null;
                $ciUser = isset($_GET["ciUser"]) ? $_GET["ciUser"] : null;
                $ciPassword = isset($_GET["ciPassword"]) ? $_GET["ciPassword"] : null;
                $ipAddress = isset($_GET["ipAddress"]) ? $_GET["ipAddress"] : null;

                // 3개 정보중 하나라도 없으면 오류 반환
                if (!$sourceVmid || !$newVmid || !$newVmName || !$ciUser || !$ciPassword || !$ipAddress) {
                    http_response_code(400);
                    echo json_encode(['error' => "Missing required parameters for VM creation"]);
                    break;
                }

                //서버 생성을 위환 기본 설정
                $cloneParams = [
                    'newid' => $newVmid,
                    'name' => $newVmName,
                    'full' => 1,
                    'target' => 'computer6',
                    'storage' => 'Storage', //다른 저장소로 변경이 가능하다.
                ];

                // 클론하기
                $result = Request::Request("/nodes/computer6/qemu/{$sourceVmid}/clone", $cloneParams, 'POST');
                $array = get_object_vars($result);
                if ($array["data"] != null) {
                    while (true) {
                        $counting = Request::Request('/nodes/computer6/qemu/' . $newVmid . '/status/current', null, 'GET');
                        $array = get_object_vars($counting);
                        if ($array["data"] != null) {

                            // ipconfig0 파라미터 생성
                            $ipConfig = "ip={$ipAddress}/16,gw=172.10.1.1";

                            $cloudInitParams = [
                                'ciuser' => $ciUser,
                                'cipassword' => $ciPassword,
                                'ipconfig0' => $ipConfig,
                            ];

                            // Proxmox API 요청
                            $cloudInitResult = Request::Request("/nodes/computer6/qemu/{$newVmid}/config", $cloudInitParams, 'POST');

                            if (isset($cloudInitResult->data)) {
                                http_response_code(201);
                                echo json_encode(['Success' => "Create Vm and Cloud-init configuration applied successfully"]);
                            } else {
                                http_response_code(500);
                                echo json_encode([
                                    'Error' => "Failed to apply Cloud-init configuration",
                                    'details' => json_encode($cloudInitResult)
                                ]);
                            }
                            break;
                        }
                        sleep(3);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(['Error' => "Fail creative VM"]);
                }

            } else {
                http_response_code(400);
                echo json_encode(['error' => "No permission"]);
            }
            break;

        //VM 서버 시작
        case "power_on":
            //토큰으로 권한 확인한다.
            $vmid = isset($_GET["vmid"]) ? $_GET["vmid"] : null;
            $startResult = Request::Request("/nodes/computer6/qemu/{$vmid}/status/start", null, 'POST');
            $array = get_object_vars($startResult);
            if ($array["data"] != null) {
                http_response_code(200);
                echo json_encode(['success' => "VM cloned, configured, and started successfully", 'vmid' => $vmid]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => "Failed to start VM", 'details' => $startResult]);
            }
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
