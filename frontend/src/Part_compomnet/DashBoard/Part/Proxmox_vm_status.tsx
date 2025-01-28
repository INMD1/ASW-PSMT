import { useAtom } from "jotai";
import { User_info } from "@/store/strore_data";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cpu, HardDrive, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";

function Proxmox_vm_status({ VMID }: { VMID: string }): JSX.Element {
  const [userinfo] = useAtom(User_info);
  const [vminfo, setVminfo] = useState<any>({});
  const [data, setData] = useState<any>({});
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  async function Getinfo() {
    try {
      const response = await fetch(
        //@ts-ignore
        `/api/server_application?type=personal&username=${userinfo.name}&id=${VMID}`
      );
      const restApi = await response.json();
      setVminfo(JSON.parse(restApi[0].content));
    } catch (error) {
      console.error("API 호출 오류:", error);
    }
  }

  const fetchData = async () => {
    if (!vminfo.region || !vminfo.servertype || !vminfo.vmId) return;
    try {
      const response = await fetch(
        `/api/proxmox/?mode=livedata&node=computer6&type=qemu&id=${vminfo.vmId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData.data);
      setHistoricalData((prevData) =>
        [
          ...prevData,
          {
            time: new Date().toLocaleTimeString(),
            ...jsonData.data,
            mem: (jsonData.data.mem / (1024 * 1024)).toFixed(2), // MB로 변환
            maxmem: (jsonData.data.maxmem / (1024 * 1024)).toFixed(2), // MB로 변환
          },
        ].slice(-20)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  async function StartVM() {
    try {
      const response = await fetch(
        //@ts-ignore
        `/api/proxmox/?mode=power_on&vmid=${VMID}`
      );
      if (response.status === 200) {
        toast.success("서버가 시작 되었습니다. 새로고침을 해주세요.", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      } else {
        toast.error("서버를 시작 하지 못했습니다.", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("오류가 발생했습니다. 관리자에게 문의해주세요.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }
  }

  useEffect(() => {
    Getinfo();
  }, [userinfo, VMID]);

  useEffect(() => {
    if (vminfo.region && vminfo.servertype && vminfo.vmId) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [vminfo]);

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        VM Monitor - 고유 ID: {vminfo.vmId}
      </h2>

      {/* Status and Summary */}
      <div className="flex justify-between">
        <p className="title">서버 정보</p>
        <Button
          className=""
          onClick={() => {
            StartVM();
          }}
        >
          서버 시작하기
        </Button>
      </div>
      <br />
      <div className="gird md:flex gap-5">
        <div className=" mb-8 md:mb-0 ">
          <Card className="p-4">
            <div className="gird md:flex ">
              <div className=" min-w-[20vw]">
                <p>서버 정보</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Invoice</TableHead>
                      <TableHead className="text-center">값</TableHead>
                      <TableHead className="text-left">|</TableHead>
                      <TableHead className="">Invoice</TableHead>
                      <TableHead className="text-center">값</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">생성자</TableCell>
                      <TableCell className="text-left">{vminfo.name}</TableCell>
                      <TableCell className="text-left">|</TableCell>
                      <TableCell className="font-medium">리전</TableCell>
                      <TableCell className="text-left">computer6</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">서버 이름</TableCell>
                      <TableCell className="text-left">
                        {vminfo.Servername}
                      </TableCell>
                      <TableCell className="text-left">|</TableCell>
                      <TableCell className="font-medium">서버 타입</TableCell>
                      <TableCell className="text-left"></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">유저 이름</TableCell>
                      <TableCell className="text-left">
                        {vminfo.Username}
                      </TableCell>
                      <TableCell className="text-left">|</TableCell>
                      <TableCell className="font-medium">유저 PW</TableCell>
                      <TableCell className="text-left">
                        {vminfo.User_pw}
                      </TableCell>
                    </TableRow>
                    <hr />
                  </TableBody>
                </Table>
              </div>
              <div className="min-w-[20vw] p-5">
                <p>[네트워크 추가 설정 안내]</p>
                <div className="p-3">
                  {vminfo.NetworkInfo == ""
                    ? "전달된 값이 없습니다."
                    : vminfo.NetworkInfo}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <div className=" mb-8 md:mb-0 ">
            <Card className="p-4">
              <div className="grid">
                <p>서버 정보</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Invoice</TableHead>
                      <TableHead className="text-center">값</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">외부 IP</TableCell>
                      <TableCell className="text-left">
                        113.198.229.158
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">내부 IP</TableCell>
                      <TableCell className="text-left">{vminfo.vmip}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SSH 포트</TableCell>
                      <TableCell className="text-left">Test Port</TableCell>
                    </TableRow>
                    <hr />
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 w-full pt-10  md:flex lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cpu?.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.mem || 0) / 1024 / 1024).toFixed(2)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {((data.maxmem || 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.disk || 0) / 1024 / 1024).toFixed(2)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Max: {((data.maxdisk || 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.netin || 0) / 1024 / 1024).toFixed(2)} MB/s
            </div>
            <p className="text-xs text-muted-foreground">
              Out: {((data.netout || 0) / 1024 / 1024).toFixed(2)} MB/s
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#8884d8"
                  name="CPU Usage (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mem"
                  stroke="#82ca9d"
                  name="Memory Usage (MB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Proxmox_vm_status;
