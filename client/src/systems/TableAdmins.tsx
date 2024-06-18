import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import classNames from "classnames";

import instance from "../axios";

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner, User, Input, Select, SelectItem, DatePicker } from "@nextui-org/react";


import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import CustomModal from "./Modal";
import IconButton from "./IconButton";
import { MdOutlineForum } from "react-icons/md";
import { SlSocialVkontakte } from "react-icons/sl";
import ProfileDetails from "./Profile/ProfileDetails";
import toast from "react-hot-toast";

interface Profile {
  active?: boolean;
  lvl: number;
  inactive_days: number;
  days_at_level: number;
  job_title: string;
  additional_job_title: string;
  reason: string,
  active_warns: number;
  appointment_date: string;
  promotion_date: string;
  dayMinus: number;
  reputationPlus: number;
  reputationMinus: number;
  free_days: number;
  fraction: string;
  hard_warn: number;
  easy_warn: number;
  day: number;
  reputation: number;
  inactives: InactivePeriod[];
}

interface InactivePeriod {
  from: Date;
  to: Date;
}

interface ProfileURL {
  forum: string;
  vk: string;
}

interface Admin {
  userId: number;
  nickname: string;
  avatar: string;
  url: ProfileURL;
  admin: Profile;
  leader: Profile;
}

interface TableAdminsProps {
  searchInput: string;
  isCreateUser: boolean;
  setIsCreateUser: React.Dispatch<React.SetStateAction<boolean>>;
}

const job_titles= [
  "Главная Администрация",
  "Куратор Сервера",
  "Технический Администратор",
  "Следящий за Хелперами",
  "ГС Гос",
  "ЗГС Гос",
  "ГС Нелегалов",
  "ГС Пра-во",
  "ГС МЮ",
  "ГС МЗ",
  "ГС МО",
  "ГС СМИ",
  "ГС ТСР",
  "ГС Гетто",
  "ГС Мафии",
  "ЗГС Пра-во",
  "ЗГС МЮ",
  "ЗГС МО",
  "ЗГС МЗ",
  "ЗГС Гетто",
  "ЗГС Мафии",
  "Следящий Пра-во",
  "Следящий МО",
  "Следящий МЮ",
  "Следящий МЗ",
  "Следящий СМИ",
  "Следящий Гетто",
  "Следящий Мафии",
  "Репорт",
  "Хелпер"
]

const lvls = [
  "[4] Администратор",
  "[3] Старший модератор",
  "[2] Модератор",
  "[1] Младший модератор",
]

const type_appointments = [
  "Лидер",
  "Собеседование",
  "Восстановление",
  "Перевод"
]

const header = [
  { name: "Никнейм", key: "nickname" },
  { name: "Уровень", key: "lvl" },
  { name: "Выговоры", key: "active_warns" },
  { name: "Дни неактива", key: "inactive_days" },
  { name: "Дней на уровне", key: "days_at_level" },
  { name: "Последнее повышение", key: "promotion_date" }
]

interface StateAdmin {
  state: boolean;
  admin: Admin | null;
}

const TableAdmins: React.FC<TableAdminsProps> = ({ searchInput, isCreateUser, setIsCreateUser }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [sortKey, setSortKey] = useState("lvl");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState<StateAdmin>({
    state: false,
    admin: null
  });
  const [registerUser, setRegisterUser] = useState({
    id_discord: "",
    nickname: "",
    job_title: "",
    reason: "",
    appointment_date: new Date(),
    lvl: "",
    forum: 0,
    vkontakte: 0
  })

  const fetchData = async () => {
    try{
      const res = await instance.get("/admins", { withCredentials: true });
      setIsLoading(false);
      setAdmins(res.data.data);
    } catch(err){
      if (axios.isAxiosError(err)){
        if (err.response?.data.message === "Not Authorized"){
          window.location.href = "/";
        }
      }
    }
  }

  const handleSort = useCallback((key: string) => {
    setSortKey(key);
    setSortDirection(prevDirection => (sortKey === key && prevDirection === 'asc') ? 'desc' : 'asc');
  }, [sortKey]);

  const isInvalidId = useMemo(() => {
    if (registerUser.id_discord === "") return false;

    const validate = (value: string) => value.match(/^[0-9]+$/);

    return validate(registerUser.id_discord) ? false : true;
  }, [registerUser.id_discord])

  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => {
      if (sortKey){
        let aValue, bValue;

        if (sortKey === 'inactive_days') {
          aValue = calculateInactiveDays(a.admin);
          bValue = calculateInactiveDays(b.admin);
        } else if (sortKey === 'days_at_level') {
          aValue = calculateDaysAtLevel(a.admin);
          bValue = calculateDaysAtLevel(b.admin);
        } else {
          aValue = a.admin[sortKey as keyof Profile];
          bValue = b.admin[sortKey as keyof Profile];
        }
        if (aValue !== null && bValue !== null && aValue !== undefined && bValue !== undefined ) {
            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        }
      }
      return 0;
    })
  }, [admins, sortKey, sortDirection]);

  const filteredAdmins = useMemo(() => {
    const searchTerm = searchInput.toLowerCase();
    return sortedAdmins.filter((admin) =>
      admin.nickname.toLowerCase().includes(searchTerm) || admin.userId.toString().includes(searchTerm)
    )
  },  [sortedAdmins, searchInput]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData, 15000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? <IoIosArrowUp /> : <IoIosArrowDown />;
  }

  const handleClickAdmin = (item: Admin) => {
    setIsStatsOpen({
      state: true,
      admin: item
    });
  }

  const handleCloseStats = () => {
    setIsStatsOpen({
      state: false,
      admin: null
    })
  }

  const handleCloseCreate = () => {
    setIsCreateUser(false);
  }

  const handleCreateUser = async () => {
    if (registerUser.nickname === "" || registerUser.id_discord === "" || registerUser.job_title === "" || registerUser.reason === "" || registerUser.lvl === "" || registerUser.forum === 0 || registerUser.vkontakte === 0) {
      toast.error("Пожалуйста, заполните все поля");
    }

    const toast_loading = toast.loading("Загрузка..");

    try {
        const res = await instance.post("/create/admin", registerUser, { withCredentials: true });
        if (res.status === 201) {
            toast.success("Пользователь успешно создан");
        } else if (res.status === 200) {
            toast.success("Пользователь успешно обновлен");
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        window.location.href = `/profile/id${registerUser.id_discord}`
    } catch(error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data.message === "Already leader"){
              toast.error("Пользователь уже является лидером");
            } else {
              toast.error("Произошла ошибка, попробуйте позже");
            }
        }
    } finally {
        toast.dismiss(toast_loading);
    }
  }

  return (
    <div className="mt-4">
      <Table
        aria-label="Table"
      >
        <TableHeader>
          {header.map(item => (
            <TableColumn 
              key={item.key} 
              onClick={() => {
                if (item.key !== "nickname" && item.key !== "promotion_date"){
                  handleSort(item.key)
                }
              }}
              onMouseEnter={() => setHoverKey(item.key)}
              onMouseLeave={() => setHoverKey(null)}
              className={classNames(
                "cursor-pointer", 
                { "hover:text-gray-500": hoverKey !== "nickname" && hoverKey !== "promotion_date", "text-slate-400": hoverKey === item.key && hoverKey !== "nickname" && hoverKey !== "promotion_date"}
              )}
            >
              <p className="flex flex-row items-center gap-2">{item.name} {renderSortIcon(item.key)}</p>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="Загрузка..." />}
        >
          {filteredAdmins.map(item => (
            <TableRow onClick={() => handleClickAdmin(item)}>
              <TableCell>
                <User avatarProps={{ src: item.avatar }} name={item.nickname} description={item.admin.job_title} />
              </TableCell>
              <TableCell>{item.admin.lvl}</TableCell>
              <TableCell>{item.admin.active_warns}/3</TableCell>
              <TableCell>{calculateInactiveDays(item.admin)}</TableCell>
              <TableCell>{calculateDaysAtLevel(item.admin)}</TableCell>
              <TableCell>{item.admin.promotion_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomModal 
        isOpen={isStatsOpen.state} 
        onClose={handleCloseStats} 
        size="md" 
        backdrop="blur"
        header={"Статистика"}
        acceptButton="Открыть профиль"
        onAccept={() => window.open(`/profile/id${isStatsOpen.admin ? isStatsOpen.admin.userId : "undefined"}`, "_blank")}
        body={
          (isStatsOpen.admin && (
            <div className="flex flex-col gap-2">
              <div className="bg-[#27272A] shadow-lg rounded-md p-2">
                <div className="flex flex-row items-center justify-around">
                  <img src={isStatsOpen.admin.avatar} alt={isStatsOpen.admin.nickname} className="rounded-full w-[25%]" />
                  <div className="flex flex-col">
                    <p className="text-xl font-bold">{isStatsOpen.admin.nickname}</p>
                    <p className="text-gray-400">{isStatsOpen.admin.admin.job_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton href={isStatsOpen.admin.url.forum} Icon={MdOutlineForum} />
                    <IconButton href={isStatsOpen.admin.url.vk} Icon={SlSocialVkontakte} />
                  </div>
                </div>
              </div>
              <div className="bg-[#27272A] shadow-lg rounded-md p-2">
                <div>
                  <ProfileDetails
                    key={isStatsOpen.admin.userId}
                    isLoading={isLoading}
                    profile={isStatsOpen.admin[isStatsOpen.admin.admin.active ? "admin" : "leader"]}
                    role={isStatsOpen.admin.admin.active ? "admin" : "leader"}
                  />
                </div>
              </div>
            </div>
          ))
        }
      />
      <CustomModal 
        isOpen={isStatsOpen.state} 
        onClose={handleCloseStats} 
        size="md" 
        backdrop="blur"
        header={"Статистика"}
        acceptButton="Открыть профиль"
        onAccept={() => window.open(`/profile/id${isStatsOpen.admin ? isStatsOpen.admin.userId : "undefined"}`, "_blank")}
        body={
          (isStatsOpen.admin && (
            <div className="flex flex-col gap-2">
              <div className="bg-[#27272A] shadow-lg rounded-md p-2">
                <div className="flex flex-row items-center justify-around">
                  <img src={isStatsOpen.admin.avatar} alt={isStatsOpen.admin.nickname} className="rounded-full w-[25%]" />
                  <div className="flex flex-col">
                    <p className="text-xl font-bold">{isStatsOpen.admin.nickname}</p>
                    <p className="text-gray-400">{isStatsOpen.admin.admin.job_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton href={isStatsOpen.admin.url.forum} Icon={MdOutlineForum} />
                    <IconButton href={isStatsOpen.admin.url.vk} Icon={SlSocialVkontakte} />
                  </div>
                </div>
              </div>
              <div className="bg-[#27272A] shadow-lg rounded-md p-2">
                <div>
                  <ProfileDetails
                    key={isStatsOpen.admin.userId}
                    isLoading={isLoading}
                    profile={isStatsOpen.admin.admin}
                    role="admin"
                  />
                </div>
              </div>
            </div>
          ))
        }
      />
      <CustomModal 
        isOpen={isCreateUser} 
        onClose={handleCloseCreate} 
        size="md" 
        backdrop="blur"
        header={"Создание профиля"}
        acceptButton="Принять"
        onAccept={handleCreateUser}
        body={
            <div className="flex flex-col text-md gap-5">
                <div>
                    <p>Никнейм</p>
                    <Input onChange={(event) => setRegisterUser({...registerUser, nickname: event.target.value})} type="text" placeholder="Alan_Butler" />
                </div>
                <div>
                    <p>ID Discord</p>
                    <Input 
                        onChange={(event) => setRegisterUser({...registerUser, id_discord: event.target.value})} 
                        type="text" 
                        placeholder="701440080111337513" 
                        isInvalid={isInvalidId}
                        color={isInvalidId ? "danger" : "default"}
                        errorMessage="Введите корректный ID Discord"
                    />
                </div>
                <div>
                    <p>Уровень</p>
                    <Select
                        label="Выберите уровень"
                        size="sm"
                        radius="lg"
                        onChange={(event) => setRegisterUser({...registerUser, lvl: event.target.value})}
                        defaultSelectedKeys={[lvls[lvls.length-1]]}
                    >
                        {(lvls as string[]).map((item: string) => (
                            <SelectItem key={item}>
                                {item}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div>
                    <p>Должность</p>
                    <Select
                        label="Выберите должность"
                        size="sm"
                        radius="lg"
                        onChange={(event) => setRegisterUser({...registerUser, job_title: event.target.value})}
                        defaultSelectedKeys={[job_titles[job_titles.length-1]]}
                    >
                        {job_titles.map((job_title) => (
                            <SelectItem key={job_title} value={job_title}>
                                {job_title}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div>
                    <p>Тип назначения</p>
                    <Select
                        label="Выберите тип"
                        size="sm"
                        radius="lg"
                        onChange={(event) => setRegisterUser({...registerUser, reason: event.target.value})}
                    >
                        {type_appointments.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div>
                    <p>Дата назначения</p>
                    <DatePicker 
                        label="Выберите дату"
                        onChange={(event) => setRegisterUser({...registerUser, appointment_date: new Date(event.year, event.month - 1, event.day)}) }
                    />
                </div>
                <div>
                    <p>Форумный аккаунт</p>
                    <Input 
                        type="number"
                        classNames={{
                            innerWrapper: [
                                "truncate",
                            ]
                        }}
                        onChange={(event) => setRegisterUser({...registerUser, forum: parseInt(event.target.value)})}
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-sm text-ellipsis overflow-hidden">
                                    https://forum.arizona-rp.com/members/
                                </span>
                            </div>
                        }
                    />
                </div>
                <div>
                    <p>VKontakte</p>
                    <Input 
                        type="number"
                        onChange={(event) => setRegisterUser({...registerUser, vkontakte: parseInt(event.target.value)})}
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-sm text-ellipsis overflow-hidden">
                                    https://vk.com/id
                                </span>
                            </div>
                        }
                    />
                </div>
            </div>
        }
      />
    </div>
  )
}

const calculateDaysAtLevel = (profile: Profile): number => {
  const startDate = new Date(profile.appointment_date);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (24 * 60 * 60 * 1000));
};

const calculateInactiveDays = (profile: Profile): number => {
  const inactivePeriods = profile.inactives || [];
  return inactivePeriods.reduce((total: number, period: InactivePeriod) => {
    const start = new Date(period.from);
    const end = new Date(period.to);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return total + Math.ceil(diffTime / (24 * 60 * 60 * 1000));
  }, 0);
};

export default TableAdmins;
