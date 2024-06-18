import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import classNames from "classnames";

import instance from "../axios";

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner, User, Input, Select, SelectItem, SelectSection, DatePicker } from "@nextui-org/react";

import CustomModal from "./Modal";
import IconButton from "./IconButton";
import ProfileDetails from "./Profile/ProfileDetails";

import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdOutlineForum } from "react-icons/md";
import { SlSocialVkontakte } from "react-icons/sl";

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

interface Leader {
  userId: number;
  nickname: string;
  avatar: string;
  url: ProfileURL;
  admin: Profile;
  leader: Profile;
}

const job_titles = [
    "Министр",
    "Лидер",
    "Заместитель"
]

type FractionType = {
    [key: string]: string[];
}

const listOfFractions: FractionType = {
    "Министерство Юстиции": [  
        "Министерство Юстиции",
        "Полиция ЛС",
        "Полиция СФ",
        "Полиция ЛВ",
        "ФБР"
    ],
    "Министерство Обороны": [
        "Министерство Обороны",
        "Армия ЛС",
        "Армия СФ"
    ],
    "Средство Массовой Информации": [
        "Средство Массовой Информации",
        "Радиоцентр ЛС",
        "Радиоцентр СФ",
        "Радиоцентр ЛВ"
    ],
    "Министерство Здравоохранения": [
        "Министерство Здравоохранения",
        "Больница ЛС",
        "Больница СФ",
        "Больница ЛВ",
    ],
    "Банды": [
        "Grove Street",
        "Vagos",
        "Aztec",
        "Rifa",
        "Ballas",
        "Night Wolves"
    ],
    "Мафии": [
        "Warlock MC",
        "Yakuza",
        "La Cosa Nostra"
    ]
}

interface TableLeadersProps {
  searchInput: string;
  isCreateUser: boolean;
  setIsCreateUser: React.Dispatch<React.SetStateAction<boolean>>;
}

const type_appointments = [
    "Собеседование",
    "Перевод",
    "Из состава",
    "Доверенное лицо",
    "Отчет",
    "Выборы",
    "Кабинет министров"
]

const header = [
  { name: "Никнейм", key: "nickname" },
  { name: "Фракция", key: "fraction" },
  { name: "Строгие выговоры", key: "hard_warn" },
  { name: "Дни неактива", key: "inactive_days" },
  { name: "На посту", key: "days_at_level" },
  { name: "Дата постановления", key: "appointment_date" }
]

interface StateLeader {
  state: boolean;
  leader: Leader | null;
}

const TableLeaders: React.FC<TableLeadersProps> = ({ searchInput, isCreateUser, setIsCreateUser }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [sortKey, setSortKey] = useState("lvl");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>("desc");
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState<StateLeader>({
    state: false,
    leader: null
  });

  
  const [registerUser, setRegisterUser] = useState({
    nickname: "",
    id_discord: "",
    job_title: "",
    fraction: "",
    reason: "",
    appointment_date: new Date(),
    forum: 0,
    vkontakte: 0
  })

  const isInvalidId = useMemo(() => {
    if (registerUser.id_discord === "") return false;

    const validate = (value: string) => value.match(/^[0-9]+$/);

    return validate(registerUser.id_discord) ? false : true;
  }, [registerUser.id_discord])

  const fetchData = async () => {
    try{
      const res = await instance.get("/leaders", { withCredentials: true });
      setIsLoading(false);
      setLeaders(res.data.data);
    } catch(err){
      if (axios.isAxiosError(err)){
        if (err.response?.data.message === "Not Authorized"){
          window.location.href = "/";
        }
      }
    }
  }

  useEffect(() => {
    console.log(registerUser)
  }, [registerUser])

  const handleSort = useCallback((key: string) => {
    setSortKey(key);
    setSortDirection(prevDirection => (sortKey === key && prevDirection === 'asc') ? 'desc' : 'asc');
  }, [sortKey]);

  const sortedLeaders = useMemo(() => {
    return [...leaders].sort((a, b) => {
      if (sortKey){
        let aValue, bValue;

        if (sortKey === 'inactive_days') {
          aValue = calculateInactiveDays(a.leader);
          bValue = calculateInactiveDays(b.leader);
        } else if (sortKey === 'days_at_level') {
          aValue = calculateDaysAtLevel(a.leader);
          bValue = calculateDaysAtLevel(b.leader);
        } else {
          aValue = a.leader[sortKey as keyof Profile];
          bValue = b.leader[sortKey as keyof Profile];
        }
        if (aValue !== null && bValue !== null && aValue !== undefined && bValue !== undefined ) {
          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        }
      }
      return 0;
    })
  }, [leaders, sortKey, sortDirection]);

  const filteredLeaders = useMemo(() => {
    const searchTerm = searchInput.toLowerCase();
    return sortedLeaders.filter((leader) =>
      leader.nickname.toLowerCase().includes(searchTerm) || leader.userId.toString().includes(searchTerm)
    )
  },  [sortedLeaders, searchInput]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData, 15000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? <IoIosArrowUp /> : <IoIosArrowDown />;
  }

  const handleClickLeader = (item: Leader) => {
    setIsStatsOpen({
      state: true,
      leader: item
    });
  }

  const handleCloseStats = () => {
    setIsStatsOpen({
      state: false,
      leader: null
    })
  }

  const handleCloseCreate = () => {
    setIsCreateUser(false);
  }

  const handleCreateUser = async () => {
    if (registerUser.nickname === "" || registerUser.id_discord === "" || registerUser.job_title === "" || registerUser.fraction === "" || registerUser.reason === "" || registerUser.forum === 0 || registerUser.vkontakte === 0) {
        toast.error("Пожалуйста, заполните все поля");
    }

    const toast_loading = toast.loading("Загрузка..");

    try {
        const res = await instance.post("/create/leader", registerUser, { withCredentials: true });
        if (res.status === 201) {
            toast.success("Пользователь успешно создан");
        } else if (res.status === 200) {
            toast.success("Пользователь успешно обновлен");
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        window.location.href = `/profile/id${registerUser.id_discord}`
    } catch(error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data.message === "Already admin"){
                toast.error("Пользователь уже является администратором");
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
                if (item.key !== "nickname" && item.key !== "appointment_date" && item.key !== "fraction"){
                  handleSort(item.key)
                }
              }}
              onMouseEnter={() => setHoverKey(item.key)}
              onMouseLeave={() => setHoverKey(null)}
              className={classNames(
                "cursor-pointer", 
                { "hover:text-gray-500": hoverKey !== "nickname" && hoverKey !== "appointment_date" && hoverKey !== "fraction", "text-slate-400": hoverKey === hoverKey && hoverKey !== "nickname" && hoverKey !== "appointment_date" && item.key !== "fraction"}
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
          {filteredLeaders.map(item => (
            <TableRow key={item.userId} onClick={() => handleClickLeader(item)}>
              <TableCell>
                <User avatarProps={{ src: item.avatar }} name={item.nickname} description={item.leader.job_title} />
              </TableCell>
              <TableCell>{item.leader.fraction}</TableCell>
              <TableCell>{item.leader.hard_warn}/3</TableCell>
              <TableCell>{calculateInactiveDays(item.leader)}</TableCell>
              <TableCell>{calculateDaysAtLevel(item.leader)}</TableCell>
              <TableCell>{new Date(item.leader.appointment_date).toISOString().split("T")[0].toString()}</TableCell>
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
        onAccept={() => window.open(`/profile/id${isStatsOpen.leader ? isStatsOpen.leader.userId : "undefined"}`, "_blank")}
        body={
          (isStatsOpen.leader && (
            <div className="flex flex-col gap-2">
              <div className="bg-[#27272A] shadow-lg rounded-md p-2">
                <div className="flex flex-row items-center justify-around">
                  <img src={isStatsOpen.leader.avatar} alt={isStatsOpen.leader.nickname} className="rounded-full w-[25%]" />
                  <div className="flex flex-col">
                    <p className="text-xl font-bold">{isStatsOpen.leader.nickname}</p>
                    <p className="text-gray-400">{isStatsOpen.leader.leader.job_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton href={isStatsOpen.leader.url.forum} Icon={MdOutlineForum} />
                    <IconButton href={isStatsOpen.leader.url.vk} Icon={SlSocialVkontakte} />
                  </div>
                </div>
              </div>
              <div className="bg-[#27272A] shadow-lg rounded-md p-2">
                <div>
                  <ProfileDetails
                    key={isStatsOpen.leader.userId}
                    isLoading={isLoading}
                    profile={isStatsOpen.leader.leader}
                    role="leader"
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
                    <p>Должность</p>
                    <Select
                        label="Выберите должность"
                        size="sm"
                        radius="lg"
                        onChange={(event) => setRegisterUser({...registerUser, job_title: event.target.value})}
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
                    <p>Фракция</p>
                    <Select
                        label="Выберите фракцию"
                        size="sm"
                        radius="lg"
                        onChange={(event) => setRegisterUser({...registerUser, fraction: event.target.value})}
                    >
                        {Object.entries(listOfFractions).map(([sectionTitle, items]) => (
                            <SelectSection key={sectionTitle} title={sectionTitle} showDivider>
                                {(items as string[]).map((item: string) => (
                                    <SelectItem key={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectSection>
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

export default TableLeaders;
