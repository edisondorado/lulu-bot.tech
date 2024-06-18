import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@nextui-org/skeleton";
import { Select, SelectItem } from "@nextui-org/select";
import { Calendar } from "@nextui-org/calendar";
import { Button } from "@nextui-org/button";
import { Pagination } from "@nextui-org/pagination";
import toast from "react-hot-toast";

import { FaChartSimple } from "react-icons/fa6";

import LogStylize from "./LogStylize";
import ActionLog from "./ActionLog";
import CustomModal from "../Modal";
import instance from "../../axios";

interface SortOption {
    label: string;
    value: string;
}

interface SortTypes {
    [key: string]: SortOption[];
}

const typesOfSort: SortTypes  = {
    "admin": [
        { label: "Уровень", value: "lvl" },
        { label: "Выговоры", value: "warn" },
        { label: "Доп.Должность", value: "additional_job_title" },
        { label: "Дни", value: "days" },
        { label: "Репутация", value: "reputation" },
        { label: "Обмен дней", value: "exchange_days" },
        { label: "Обмен репутации", value: "exchange_reputation" },
        { label: "Блат.дни", value: "free_days" },
    ],
    "leader": [
        { label: "Фракция", value: "fraction" },
        { label: "Строгие выговоры", value: "hard_warn" },
        { label: "Устные выговоры", value: "easy_warn" },
    ],
    "all": [
        { label: "Никнейм", value: "nickname" },
        { label: "ID Discord", value: "id_discord" },
        { label: "Тип назначения", value: "reason" },
        { label: "Должность", value: "job_title" },
        { label: "Снятие", value: "dismiss_reason" },
        { label: "Смена форума", value: "forum" },
        { label: "Смена VK", value: "vkontakte" },
        { label: "Неактив", value: "inactive" },
        { label: "Заметки", value: "notion" },
    ]
}

interface LogWindowProps{
    isLoading: boolean;
    profile: any;
}

interface CursorPosition{
    x: number;
    y: number;
}

interface InactiveInfo {
    from: string;
    to: string;
}

const LogWindow = ({ isLoading, profile }: LogWindowProps) => {
    const [selectedSort, setSelectedSort] = useState("");
    const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
    const [isActionDeleteModalOpen, setIsActionDeleteModalOpen] = useState(false);
    const [activeLog, setActiveLog] = useState<any>(null);
    const [activeLogIndex, setActiveLogIndex] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, _] = useState<number>(18);

    const cursorRef = useRef<CursorPosition>({ x: 0, y: 0 });
    const actionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionRef.current && !(actionRef.current as any).contains(event.target)) {
                setActiveLogIndex(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [])

    const handleOpenModal = (type: "Delete" | "Action" | "Inactive", log?: any) => {
        if (type === "Delete") {
            setIsActionDeleteModalOpen(true);
            setActiveLogIndex(null);
            setActiveLog(log);
        }
        else if (type === "Action") {
            setIsActionModalOpen(true);
            setActiveLogIndex(null);
            setActiveLog(log);
        }
        else if (type === "Inactive") setIsInactiveModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsActionDeleteModalOpen(false);
        setIsActionModalOpen(false);
        setIsInactiveModalOpen(false);
    }

    const handleDeleteLog = async () => {
        setIsActionDeleteModalOpen(false);
        const toast_loading = toast.loading("Ожидайте..");

        const data = { 
            logId: activeLog._id,
            id: profile.id,
            nickname: profile.nickname
        }
        await instance.post("/log/delete", data, { withCredentials: true })
            .then( async () => {
                toast.dismiss(toast_loading);
                toast.success("Лог успешно удален");
                await new Promise(resolve => setTimeout(resolve, 3000));
    
                window.location.reload();
            })
            .catch(async () => {
                toast.dismiss(toast_loading);
                toast.error("Ошибка при удалении лога");
                await new Promise(resolve => setTimeout(resolve, 3000));
    
                window.location.reload();
            })
    }

    const displayLogItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
    
        var logs = [...profile.log].reverse();
        logs = logs.filter(item => profile.type == item.status)
    
        if (selectedSort === "") {
            logs = logs.slice(startIndex, endIndex);
        } else {
            logs = logs.filter(item => item.action === selectedSort);
        }

        return logs.map((item: any, index: number) => {
            console.log("LogWindow.Status:", item.status)
            return (
                <div 
                    key={`profilelog-${index}`}
                >
                    <LogStylize 
                        key={`${new Date(item.timestamp).toISOString()}-${index}`}
                        sort={selectedSort}
                        timestamp={item.timestamp}
                        action={item.action}
                        issuedBy={item.issuedBy}
                        targetUser={item.targetUser}
                        active_status={profile.type}
                        status={item.status}
                        reason={item.reason}
                        additionalInfo={item.additionalInfo}
                        previousValue={item.previousValue}
                        new_value={item.new_value}
                        hidden={item.hidden}
                        className="leading-10 cursor-pointer"
                        full_access={profile.full_access}
                        onClick={(event) => handleClickLog(index, event)} 
                    />
                    {activeLogIndex === index && (
                        <ActionLog key={`actionlog-${index}`} disabledKeys={profile.full_access ? [""] : ["delete"]} log={item} cursor={cursorPosition} ref={actionRef} onOpenDelete={(log) => handleOpenModal("Delete", log)} onOpenInfo={(log) => handleOpenModal("Action", log)} />
                    )}
                </div>
            )
        })
    }    

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    }

    const handleClickLog = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
        cursorRef.current = { x: event.clientX, y: event.clientY };
        setCursorPosition(cursorRef.current);
        if (activeLogIndex === index){
            setActiveLogIndex(null);
        } else {
            setActiveLogIndex(index);
        }
    }

    return (
        <div className="flex flex-col h-full mx-6 pb-6 pt-5 md:pr-10">
            <div className="flex justify-between items-center pb-4">
                <div className="text-gray-300 w-[50%]">
                    <Skeleton isLoaded={!isLoading} className="w-[60%] h-5">
                        Результатов: {profile && profile.log && LengthLogs(profile.type, profile.log, selectedSort, profile)}
                    </Skeleton>
                </div>
                <div className="text-gray-300 flex flex-row w-[50%] items-center">
                    <Select 
                        label="Сортировка" 
                        showScrollIndicators
                        className="relative z-0"
                        selectedKeys={[selectedSort]}
                        onChange={(event) => {
                            setSelectedSort(event.target.value)
                            setCurrentPage(1)
                        }}
                        size="sm"
                    >
                        {[
                            ...typesOfSort["all"],
                            ...typesOfSort[profile ? profile.type : "all"]
                        ].map((sort) => (
                            <SelectItem 
                                key={sort.value} 
                                value={sort.value}
                            >
                                {sort.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
            <div className="shadow-lg p-4 h-full bg-[#27272A]">
                {profile && 
                    <div className="flex flex-col h-full">
                        <div className="w-full flex-grow text-gray-300 hover:text-white transition-all duration-300 ease-in-out">
                            {displayLogItems()}
                        </div>
                        <div className="w-full">
                            {selectedSort === "inactive" && (
                                <>
                                    <Button onClick={() => handleOpenModal("Inactive")} startContent={<FaChartSimple />} className="justify-start ml-4">
                                        Статистика
                                    </Button>
                                    <CustomModal 
                                        isOpen={isInactiveModalOpen} 
                                        onClose={handleCloseModal} 
                                        size="md" 
                                        backdrop="blur"
                                        hideAcceptButton={true}
                                        header="Статистика по неактивам"
                                        body={
                                            <>
                                                <Calendar 
                                                    aria-label="Дата"
                                                    isReadOnly
                                                    classNames={{
                                                        cellButton: [
                                                            "data-[unavailable=true]:text-red-500"
                                                        ]
                                                    }}
                                                    isDateUnavailable={(date: { year: number, month: number, day: number }) => {
                                                        return profile.type === "admin" ?  profile.data.admin.inactives : profile.data.leader.inactives
                                                        .map((info: InactiveInfo) => {
                                                            const startDate = new Date(info.from);
                                                            const endDate = new Date(info.to);
                                                            const dates = [];
                                                            let currentDate = startDate;
                                                            while (currentDate <= endDate) {
                                                                dates.push(new Date(currentDate));
                                                                currentDate.setDate(currentDate.getDate() + 1);
                                                            }
                                                            return dates;
                                                        })
                                                        .flat()
                                                        .some((inactiveDate: Date) => 
                                                            inactiveDate.getDate() === date.day &&
                                                            inactiveDate.getMonth() === date.month - 1 &&
                                                            inactiveDate.getFullYear() === date.year
                                                        );
                                                    }}
                                                />
                                                <p>Дни отмеченные красным цветом - неактивы</p>
                                            </>
                                        }
                                    />
                                </>
                            )}
                            {LengthLogs(profile.type, profile.log, selectedSort, profile) > 0 && (
                                <Pagination
                                    total={selectedSort !== "" ? Math.ceil(LengthLogs(profile.type, profile.log, selectedSort, profile) / itemsPerPage) : Math.ceil(profile.log.filter((item: any) => item.status === profile.type).length / itemsPerPage)} 
                                    aria-label="Навигация"
                                    isCompact={true}
                                    className="flex justify-end"
                                    color="primary"
                                    page={currentPage}
                                    onChange={handlePageChange}
                                />
                            )} 
                        </div>
                    </div>
                }
                {activeLog && (
                    <>
                        <CustomModal 
                            isOpen={isActionModalOpen} 
                            onClose={handleCloseModal} 
                            size="md" 
                            backdrop="blur"
                            hideAcceptButton={true}
                            header="Информация о логе"
                            body={
                                <> 
                                    Тип: {Object.keys(typesOfSort)
                                            .map(key => typesOfSort[key].find(type => type.value === activeLog.action)?.label)
                                            .filter(label => label)[0] || ""}<br/>
                                    Время: {getFormattedTime(activeLog.timestamp)}<br/>
                                    Выполнено от лица: {activeLog.issuedBy.nickname} ({activeLog.issuedBy.id})<br/>
                                    Сделано в сторону: {activeLog.targetUser.nickname} ({activeLog.targetUser.id})<br/>
                                    Статус: {activeLog.status === "admin" ? "Администратор" : "Лидер"}<br/>
                                    Причина: {activeLog.reason || "Отсутствует"}<br/>
                                    Старое значение: {activeLog.previousValue || "Отсутствует"}<br/>
                                    Новое значение: {activeLog.new_value || "Отсутствует"}<br/>
                                    Дополнительная информация: {activeLog.additionalInfo || "Отсутствует"}
                                </>
                            }
                        />
                        <CustomModal 
                            isOpen={isActionDeleteModalOpen} 
                            onClose={handleCloseModal} 
                            size="md" 
                            backdrop="blur"
                            header="Вы уверены?"
                            onAccept={() => handleDeleteLog()}
                            body={
                                <> 
                                    Вы уверены, что хотите удалить этот лог?
                                    Он будет удален только на сайте.
                                </>
                            }
                        />
                    </>
                )}
                {isLoading && Array.from({ length: 15 }).map((_, index) => (
                    <div key={index} className="pt-2">
                        <Skeleton key={index} isLoaded={!isLoading} className={`mx-2 w-[98%] h-5 mt-3`}>
                        </Skeleton>
                    </div>
                ))}
            </div>
        </div>
    )
}

function getFormattedTime(date: Date) {
    const time = new Date(date);
  
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0'); 
    const day = String(time.getDate()).padStart(2, '0');
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;
}

const LengthLogs = (type: string, log: any, selectedSort: string, profile: any) => {
    let count = 0;
    for(let i = 0; i < log.length; i++){
        if (log[i].status === type){
            if(!log[i].hidden.status && log[i].status === type && (selectedSort !== "" && log[i].action === selectedSort || selectedSort === "") && !(log[i].action === "notion" && !profile.full_access)){
                count++;
            }
        }
    }
    return count;
}

export default LogWindow;