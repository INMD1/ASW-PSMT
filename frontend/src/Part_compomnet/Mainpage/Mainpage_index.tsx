import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Topnav from "../common parts/Nav"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Mainpage_part_Board from "./part/notice"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
function Mainpage_index() {
    const navigate = useNavigate();
    const [statuses, setStatuses] = useState({
        Computer1: "🟡 Checking",
        Computer2: "🟡 Checking",
        Computer3: "🟡 Checking",
        Computer4: "🟡 Checking",
        Computer5: "🟡 Checking",
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/proxmox?search=nodes");
                const data = await response.json();

                // 데이터 기반으로 상태 업데이트
                const updatedStatuses = { ...statuses };
                data.data.forEach((node: { status: string }, index: number) => {
                    const computerKey = `Computer${index + 1}`;
                    // @ts-ignore
                    if (updatedStatuses[computerKey] !== undefined) {
                        // @ts-ignore
                        updatedStatuses[computerKey] =
                            node.status === "online" ? "🟢 Online" : "🔴 Error";
                    }
                });

                setStatuses(updatedStatuses);
            } catch (error) {
                console.error("데이터 가져오기 중 오류 발생:", error);

                // 모든 상태를 Error로 설정
                // @ts-ignore
                setStatuses(prevStatuses =>
                    Object.fromEntries(
                        Object.keys(prevStatuses).map(key => [key, "🔴 Error"])
                    )
                );
            }
        }
        fetchData();
    }, []);
    return (

        <div className="p-5 md:p-20">
            <Topnav />
            <div className="mobile_none mt-20"></div>
            <div className="xl:flex md:grid  justify-center  items-center flex-nowrap gap-20 " >
                <div className="grid custon-with mt-10">
                    <div className="m-5 xl:m-20">
                        <p className="mianpage_header">동의대학교</p>
                        <p className="mianpage_header">응용소프트웨어공학과 실습VM관리</p>
                        <p className="mianpage_header">플랫폼에 오신걸 환영합니다.</p>
                        <div className="lg:h-10 h-5"></div>
                        <p className="mianpage_sidheader ">프로젝트를 하는데 서버 비용이 문제라면 저희 서버를 한번 이용해보세요.</p>
                        <div className="flex lg:justify-end mt-3 lg:mt-5 ">
                            <Button className="h-10 w-20 lg:h-16 lg:w-40" onClick={() => {
                                navigate("/site/server/subscription");
                            }} >
                                <p className="mainpage_button">서버 신청</p>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="">
                    <div className="mobile_none ">
                        <p className="title">서버 현황</p>
                        <p>서버에서 백업을 하고 있는 경우 Error가 표시가 될수 있습니다.</p>
                        <div className="lg:h-7 h-5"></div>
                        <div className="grid grid-cols-3 grid-rows-2 2xl:flex gap-5  lg:m-0 content-start">
                            {/*서버 현황을 보여주는 컴포넌트*/}
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>실습 전용 서버</CardTitle>
                                        <CardDescription>{statuses.Computer1}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                        <br />
                        <p>업데이트 시각: {Date()}</p>
                    </div>

                    <br />

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <p className="title">공지사항ㅤ</p>
                        <Button className="self-end mb-2.5" onClick={() => { navigate("/site/board"); }}>게시판 이동</Button>
                    </div>

                    <div className="lg:h-7 h-5"></div>

                    <div className="m-2 lg:m-0">
                        <Mainpage_part_Board />
                    </div>

                    <div className="pc_none" >
                        <p className="title">서버 현황</p>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>서버</TableHead>
                                        <TableHead>현재상태</TableHead>

                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Compute1</TableCell>
                                        <TableCell>{statuses.Computer1}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Mainpage_index