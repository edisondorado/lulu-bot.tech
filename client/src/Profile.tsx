import { useEffect, useState } from "react";
import instance from "./axios";
import axios from "axios";
import { Skeleton } from "@nextui-org/skeleton";
import toast, { Toaster } from "react-hot-toast";
import { DateRangePicker, DateValue, Input, RangeValue } from "@nextui-org/react";
import { useParams } from "react-router-dom";

import NavBar from "./systems/NavBar";
import LogWindow from "./systems/Profile/LogWindow";
import ProfileDetails from "./systems/Profile/ProfileDetails";

import { FaRegEdit } from "react-icons/fa";
import { MdOutlineForum, MdFreeBreakfast } from "react-icons/md";
import { SlSocialVkontakte } from "react-icons/sl";
import { LuClipboardList } from "react-icons/lu";
import { TfiReload } from "react-icons/tfi";

import EditWindow from "./systems/Profile/EditWindow";
import ExchangeWindow from "./systems/Profile/ExchangeWindow";
import IconButton from "./systems/IconButton";
import CustomModal from "./systems/Modal";
import { TbStatusChange } from "react-icons/tb";


interface LevelDescriptions {
    [key: number]: LevelDescription;
}

interface LevelDescription {
    name: string;
    color: string;
}

const levelDescriptions: LevelDescriptions = {
    1: { name: "Младший модератор", color: "bg-[#0be4f5]" },
    2: { name: "Модератор", color: "bg-[#029eb4]" },
    3: { name: "Старший модератор", color: "bg-[#ffa500]" },
    4: { name: "Администратор", color: "bg-[#4040fd]" },
    5: { name: "Куратор", color: "bg-[#7900ff]" },
    6: { name: "Заместитель ГА", color: "bg-[#009b0e]" },
    7: { name: "Главный Администратор", color: "bg-[#009b0e]" },
    8: { name: "Спец.Администратор", color: "bg-[#ff0000]" },
}

interface InactiveDetails{
    start: Date | null;
    end: Date | null;
}

function Profile() {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [view, setView] = useState<"log" | "edit" | "reload">("log");
    const [selInactive, setSelInactive] = useState<InactiveDetails>({
        start: null,
        end: null
    });
    const [selReasonInactive, setSelReasonInactive] = useState("");
    const { uid } = useParams<{ uid: string }>();

    const fetchProfile = async () => {
        try {
            if (uid === undefined){
                const res = await instance.get("/profile", { withCredentials: true });
                setProfile(res.data);
            } else {
                const res = await instance.get(`/profile/${uid}`, { withCredentials: true });
                setProfile(res.data);
                if (res.data.id === res.data.data.userId) window.location.href = "/profile"
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data.message === "Not Authorized") {
                    window.location.href = "/";
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile()
    }, [uid])

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleChangeView = async (type: "Edit" | "Reload") => {
        const transitionMap: { [key in typeof view]: { [key in typeof type]: typeof view } } = {
            log: { Edit: "edit", Reload: "reload" },
            edit: { Edit: "log", Reload: "reload" },
            reload: { Edit: "edit", Reload: "log" }
        };
    
        const nextView = transitionMap[view]?.[type];
        if (nextView) {
            setView(nextView);
        }
    };

    const handleOpenModal = () => {
        setIsOpenModal(!isOpenModal);
    }

    const handleDataChange = (dates: RangeValue<DateValue>) => {
        setSelInactive({
            start: dates.start ? dates.start.toDate("UTC") : null,
            end: dates.end ? dates.end.toDate("UTC") : null,
        });
    };

    const handleInactive = async () => {
        const toast_loading = toast.loading("Обработка запроса..")
        const data = {
            id_discord: profile.id,
            start: selInactive.start,
            end: selInactive.end,
            reason: selReasonInactive,
        }
        try{
            await instance.post("/profile/inactive", data, { withCredentials: true });
            toast.success("Запрос успешно отправлен")
        } catch(error){
            toast.error("Не удалось обработать запрос")
        } finally {
            toast.dismiss(toast_loading);
        }
    }

    const changeType = () => {
        toast.success("Переключение статуса профиля");
        setProfile({
            ...profile,
            type: profile.type === "admin" ? "leader" : "admin"
        })
    }

    return (
        <div className="w-full h-full md:h-screen m-0 p-0 bg-[#18181B] text-white">
            <NavBar />
            <Toaster
                position="bottom-center"
                toastOptions={{
                    className: "bg-[#333] text-[#fff] rounded-md",
                    duration: 5000,
                }}
            />
            <div className="flex flex-col h-full md:flex-row">
                <div className="flex flex-col w-full pb-6 h-[100%] md:w-[50%] items-center md:items-start md:pl-28">
                    <div className="h-auto w-[90%] md:w-full shadow-lg mt-24 md:mt-5 bg-[#27272A]">
                        <div className="flex flex-col m-6 items-center text-center">
                            <div className="flex w-full justify-around">
                                <div>
                                    <IconButton href={profile ? profile.data.url.forum : null} Icon={MdOutlineForum} isLoading={isLoading} />
                                    <IconButton href={profile ? profile.data.url.vk : null} Icon={SlSocialVkontakte} isLoading={isLoading} />
                                    {profile && profile.data.admin.appointment_date && profile.data.leader.appointment_date && (
                                        <IconButton Icon={TbStatusChange} onClick={changeType} isLoading={isLoading} />
                                    )}
                                </div>
                                <Skeleton isLoaded={!isLoading} className="rounded-full w-36 h-36">
                                {profile ? (
                                    <img src={profile.data.avatar} alt={profile.data.username} className="rounded-full w-36 h-36" /> 
                                ) : (<></>)}
                                </Skeleton>
                                <div>
                                    {(profile && profile.full_access || isLoading) && (
                                        <IconButton onClick={() => handleChangeView("Edit")} Icon={view !== "edit" ? FaRegEdit : LuClipboardList} isLoading={isLoading} />
                                    )}
                                    {(profile && profile.id === profile.data.userId || isLoading) && (
                                        <>
                                            <IconButton onClick={() => handleChangeView("Reload")} Icon={view !== "reload" ? TfiReload : LuClipboardList} isLoading={isLoading} />    
                                            <IconButton onClick={handleOpenModal} Icon={MdFreeBreakfast} isLoading={isLoading} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <Skeleton isLoaded={!isLoading} className="w-96 h-9 rounded-full">
                                {profile && (
                                    <p className="font-bold text-2xl ">{profile.data.nickname}</p>
                                )}
                            </Skeleton>
                            <Skeleton isLoaded={!isLoading} className="w-80 h-10 text-nowrap rounded-full">
                                {profile && profile.type === "admin" ? (
                                    <div className={`w-auto h-auto p-1 rounded-full flex justify-center text-center ${levelDescriptions[profile.data.admin.lvl].color}`}>
                                        <p className="font-bold text-2xl">{levelDescriptions[profile.data.admin.lvl].name}</p>
                                    </div>
                                ) : profile && profile.type === "leader" ? (
                                    <div className={`w-auto h-auto p-1 rounded-full flex justify-center text-center bg-[#16A34A]`}>
                                        <p className="font-bold text-2xl">{profile.data.leader.job_title}</p>
                                    </div>
                                ) : (<></>)}
                            </Skeleton>
                        </div>
                    </div>
                    <div className="mt-6 w-[90%] md:w-full h-[100%] shadow-lg bg-[#27272A]">
                        <ProfileDetails key={profile ? profile.id : null} isLoading={isLoading} profile={profile ? profile.data[profile.type] : null} role={profile ? profile.type : null} />
                    </div>
                </div>
                <div className="w-full">
                    {view === "log" ? (
                        <LogWindow isLoading={isLoading} profile={profile} />
                    ) : view === "edit" ? (
                        <EditWindow 
                            admin_job_title={profile.data.admin.job_title} 
                            admin_additional_job_title={profile.data.admin.additional_job_title}
                            leader_job_title={profile.data.leader.job_title}
                            lvl={profile.data.admin.lvl} 
                            admin_type_appointment={profile.data.admin.reason}
                            leader_type_appointment={profile.data.leader.reason}
                            fraction={profile.data.leader.fraction}
                            nickname={profile.data.nickname}
                            id_discord={profile.id}
                            full_access={profile.data.full_access}
                            forum={profile.data.url.forum}
                            vkontakte={profile.data.url.vk}
                            active_type={profile.type}
                        />
                    ) : (
                        <ExchangeWindow reputation={profile.data.admin.reputation} days={profile.data.admin.day} />
                    )}
                </div>
            </div>
            {isOpenModal && (
                <CustomModal 
                    isOpen={isOpenModal} 
                    onClose={handleOpenModal} 
                    size="md" 
                    backdrop="blur"
                    header="Заявка на неактив"
                    acceptButton="Принять"
                    onAccept={() => handleInactive()}
                    body={
                        <> 
                            <p>Выберите промежуток неактива:</p>
                            <DateRangePicker 
                                label="Выберите промежуток"
                                className="w-full rounded-lg border-2 border-white mt-2"
                                size="sm"
                                onChange={handleDataChange}
                            />
                            <p>Введите причину:</p>
                            <Input 
                                className="w-auto rounded-lg border-2 border-white mt-2 h-[55%]"
                                type="input" 
                                label="Причина"
                                value={selReasonInactive}
                                onChange={(event) => setSelReasonInactive(event.target.value)}
                            />
                        </>
                    }
                />
            )}
        </div>
    )
}

export default Profile;