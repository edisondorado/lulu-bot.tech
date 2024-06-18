import { useState } from "react";
import toast from "react-hot-toast";

import { Select, SelectItem, SelectSection } from "@nextui-org/select";
import { ButtonGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DateRangePicker, RangeValue, DateValue } from "@nextui-org/react";
import { Checkbox } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import { FaChevronDown } from "react-icons/fa";
import instance from "../../axios";

type JobTypes = "admin" | "leader";

const job_titles: Record<JobTypes, string[]> = {
    "admin": [
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
    ],
    "leader": [
        "Министр",
        "Лидер",
        "Заместитель"
    ]
}
const additional_job_titles = [
    "Руководство группы VK",
    "Руководство слетов",
    "Главный следящий за жалобами",
    "Руководство неофициальных орг.",
    "ГС Серверных МП",
    "Студент Гетто",
    "Студент Мафии",
    "-",
]

const lvls = [
    "[7] Главный Администратор",
    "[6] Заместитель ГА",
    "[5] Куратор",
    "[4] Администратор",
    "[3] Старший модератор",
    "[2] Модератор",
    "[1] Младший модератор",
]

const type_appointments = {
    "admin": [
        "Лидер",
        "Собеседование",
        "Восстановление",
        "Перевод"
    ],
    "leader": [
        "Собеседование",
        "Перевод",
        "Из состава",
        "Доверенное лицо",
        "Отчет",
        "Выборы",
        "Кабинет министров"
    ]
}

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

interface description{
    [key: string]: string;
}

interface GivingDetails{
    amount: number;
    type: "plus" | "minus";
}

interface InactiveDetails{
    start: Date | null;
    end: Date | null;
}

interface EditWindowProps {
    admin_job_title: string;
    admin_additional_job_title: string;
    leader_job_title: string;
    lvl: number;
    fraction: string;
    admin_type_appointment: string;
    leader_type_appointment: string;
    nickname: string;
    id_discord: string;
    full_access: boolean;
    forum: string;
    vkontakte: string;
    active_type: JobTypes;
}

const EditWindow = ( {
    active_type,
    admin_job_title, 
    admin_additional_job_title, 
    leader_job_title,
    fraction,
    lvl, 
    admin_type_appointment,
    leader_type_appointment,
    nickname,
    id_discord,
    full_access,
    forum,
    vkontakte
}: EditWindowProps ) => {
    const [isGiveReputation, setIsGiveReputation] = useState(new Set(["plus"]));
    const [isGiveDay, setIsGiveDay] = useState(new Set(["plus"]));
    const [isGiveFreeDay, setIsGiveFreeDay] = useState(new Set(["plus"]));
    const [isGiveWarn, setIsGiveWarn] = useState(new Set(["plus"]));
    const [isGiveHardWarn, setIsGiveHardWarn] = useState(new Set(["plus"]));
    const [isGiveEasyWarn, setIsGiveEasyWarn] = useState(new Set(["plus"]));

    const [selLeaderTypeAppointment, setSelLeaderTypeAppointment] = useState(leader_type_appointment);
    const [selLeaderJobTitle, setSelLeaderJobTitle] = useState(leader_job_title);
    const [selFraction, setSelFraction] = useState(fraction);
    const [selHardWarn, setSelHardWarn] = useState({
        reason: "",
        type: "plus"
    });
    const [selEasyWarn, setSelEasyWarn] = useState({
        reason: "",
        type: "plus"
    });

    const [selAdminJobTitle, setSelAdminJobTitle] = useState(admin_job_title);
    const [selAddJobTitle, setSelAddJobTitle] = useState(admin_additional_job_title);
    const [selLevel, setSelLevel] = useState(lvl);
    const [selReason, setSelReason] = useState("");
    const [selReasonAppointment, setSelReasonAppointment] = useState(admin_type_appointment);
    const [selNickname, setSelNickname] = useState(nickname);
    const [selIdDiscord, setSelIdDiscord] = useState(id_discord);
    const [selFullAccess, setSelFullAccess] = useState<boolean>(full_access);
    const [selInactive, setSelInactive] = useState<InactiveDetails>({
        start: null,
        end: null
    });
    const [selNotion, setSelNotion] = useState("");
    const [selForum, setSelForum] = useState(forum);
    const [selVkontakte, setSelVkontakte] = useState(vkontakte);
    const [selWarn, setSelWarn] = useState({
        reason: "",
        type: "plus"
    })

    const [selFreeDays, setSelFreeDays] = useState<GivingDetails>({
        amount: 0,
        type: "plus"
    })

    const [selDays, setSelDays] = useState<GivingDetails>({
        amount: 0,
        type: "plus"
    })

    const [selReputation, setSelReputation] = useState<GivingDetails>({
        amount: 0,
        type: "plus"
    })

    const handleDataChange = (dates: RangeValue<DateValue>) => {
        setSelInactive({
            start: dates.start ? dates.start.toDate("UTC") : null,
            end: dates.end ? dates.end.toDate("UTC") : null,
        });
    };

    const descriptionsMap: description = {
        plus: "Выдать определенное количество",
        minus: "Снять определенное количество",
    };

    const descriptions: description = {
        plus: "Выдать",
        minus: "Снять",
    }

    const selectedGiveDay = Array.from(isGiveDay)[0];
    const selectedGiveReputation = Array.from(isGiveReputation)[0];
    const selectedGiveFreeDay = Array.from(isGiveFreeDay)[0];
    const selectedGiveWarn = Array.from(isGiveWarn)[0];
    const selectedGiveHardWarn = Array.from(isGiveHardWarn)[0];
    const selectedGiveEasyWarn = Array.from(isGiveEasyWarn)[0];

    const applyChanges = async () => {
        const toast_loading = toast.loading("Загрузка..");
        let commonData = {
            active_id: id_discord,
            id_discord: selIdDiscord,
            inactive: selInactive,
            notion: selNotion,
            nickname: selNickname,
            forum: selForum,
            vkontakte: selVkontakte,
            job_title: active_type === "admin" ? selAdminJobTitle : selLeaderJobTitle,
            dissmiss_reason: selReason,
            reason: active_type === "admin" ? selReasonAppointment : selLeaderTypeAppointment,
            full_access: selFullAccess,
        };
        
        let specificData = active_type === "admin" ? {
            additional_job_title: selAddJobTitle,
            lvl: selLevel,
            warn: selWarn,
            free_days: selFreeDays,
            days: selDays,
            reputation: selReputation,
        } : {
            fraction: selFraction,
            hardwarn: selHardWarn,
            easywarn: selEasyWarn,
        };
        
        const data = { ...commonData, ...specificData };
        await instance.post("/profile/edit", data, { withCredentials: true })
            .then(async () => {
                toast.dismiss(toast_loading);
                toast.success("Изменения успешно сохранены");
                await new Promise(resolve => setTimeout(resolve, 3000));
                window.location.reload();
            })
            .catch(async (err) => {
                toast.dismiss(toast_loading);
                toast.error("Произошла ошибка, попробуйте еще раз");
                console.warn(err);
                await new Promise(resolve => setTimeout(resolve, 3000));
                window.location.reload();
            });
    }

    const styleSelect = "w-full md:w-[80%] rounded-lg border-2 border-white mt-2"
    const divEdit = "w-full mt-3 h-18"
    const inputEdit = "w-auto md:w-[80%] rounded-lg border-2 border-white mt-2 h-[55%]"

    return (
        <div className="flex flex-col h-full mx-6 pb-6 pt-5">
            <div className="bg-[#27272A] shadow-lg p-2 h-full ">
                <div className="text-center">
                    <p className="text-3xl font-bold ">Редактирование</p>
                </div>
                <div className="flex flex-col md:flex-row justify-between border-1 border-gray-800 mx-10 mt-3 p-3 shadow-lg">
                    {active_type === "admin" ? (
                        <>
                            <div className={divEdit}>
                                <p>Должность</p>
                                <Select
                                    label="Выберите должность"
                                    className={styleSelect}
                                    value={selAdminJobTitle}
                                    onSelectionChange={(key: any) => setSelAdminJobTitle(key.currentKey)}
                                    defaultSelectedKeys={[selAdminJobTitle]}
                                    size="sm"
                                >
                                    {job_titles[active_type].map((job_title) => (
                                        <SelectItem key={job_title} value={job_title}>
                                            {job_title}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className={divEdit}>
                                <p>Доп. Должность</p>
                                <Select
                                    label="Выберите доп. должность"
                                    className={styleSelect}
                                    value={selAddJobTitle}
                                    onSelectionChange={(key: any) => setSelAddJobTitle(key.currentKey)}
                                    defaultSelectedKeys={[selAddJobTitle]}
                                    size="sm"
                                >
                                    {additional_job_titles.map((additional_job_title) => (
                                        <SelectItem key={additional_job_title} value={additional_job_title}>
                                            {additional_job_title}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className={divEdit}>
                                <p>Уровень</p>
                                <Select
                                    label="Выберите уровень"
                                    className={styleSelect}
                                    disabledKeys={lvl === 7 ? ["7"] : lvl === 6 ? ["6", "7"] : ["5", "6", "7"]}
                                    defaultSelectedKeys={[selLevel]}
                                    value={selLevel}
                                    onSelectionChange={(key: any) => setSelLevel(key.currentKey) }
                                    size="sm"
                                >
                                    {lvls.map((lvl, index) => (
                                        <SelectItem key={lvls.length - index} value={lvl}>
                                            {lvl}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={divEdit}>
                                <p>Должность</p>
                                <Select
                                    label="Выберите должность"
                                    className={styleSelect}
                                    value={selLeaderJobTitle}
                                    onSelectionChange={(key: any) => setSelLeaderJobTitle(key.currentKey)}
                                    defaultSelectedKeys={[selLeaderJobTitle]}
                                    size="sm"
                                >
                                    {job_titles[active_type].map((job_title) => (
                                        <SelectItem key={job_title} value={job_title}>
                                            {job_title}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                            <div className={divEdit}>
                                <p>Фракция</p>
                                <Select
                                    label="Выберите фракцию"
                                    className={styleSelect}
                                    value={selFraction}
                                    onSelectionChange={(key: any) => setSelFraction(key.currentKey)}
                                    defaultSelectedKeys={[selFraction]}
                                    size="sm"
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
                        </>
                    )}
                    <div className={divEdit}>
                        <p>Снять</p>
                        <Input 
                            classNames={{
                                inputWrapper: [
                                    "pt-3"
                                ],
                                innerWrapper: [
                                    "pt-9"
                                ]
                            }}
                            className={inputEdit}
                            type="input" 
                            label="Причина" 
                            value={selReason}
                            onChange={(event) => setSelReason(event.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between border-1 border-gray-800 mx-10 mt-3 p-3 shadow-lg">
                    <div className={divEdit}>
                        <p>Тип назначения</p>
                        <Select
                            label="Выберите тип"
                            className={styleSelect}
                            value={active_type === "leader" ? selLeaderTypeAppointment : selReasonAppointment}
                            onSelectionChange={(key: any) => {
                                if (active_type === "leader") {
                                    setSelLeaderTypeAppointment(key.currentKey);
                                } else {
                                    setSelReasonAppointment(key.currentKey);
                                }
                            }}
                            defaultSelectedKeys={active_type === "leader" ? [selLeaderTypeAppointment] : [selReasonAppointment]}
                            size="sm"
                        >
                            {type_appointments[active_type].map((reason) => (
                                <SelectItem key={reason} value={reason}>
                                    {reason}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className={divEdit}>
                        <p>Никнейм</p>
                        <Input 
                            defaultValue={selNickname} 
                            className={inputEdit}
                            classNames={{
                                inputWrapper: [
                                    "pt-3"
                                ],
                                innerWrapper: [
                                    "pt-9"
                                ]
                            }}
                            type="input" 
                            label="Введите никнейм" 
                            value={selNickname}
                            onChange={(event) => setSelNickname(event.target.value)}
                        />
                    </div>
                    <div className={divEdit}>
                        <p>ID Discord</p>
                        <Input 
                            classNames={{
                                inputWrapper: [
                                    "pt-3"
                                ],
                                innerWrapper: [
                                    "pt-9"
                                ]
                            }}
                            defaultValue={selIdDiscord} 
                            className={inputEdit}
                            type="input" 
                            label="Введите ID" 
                            value={selIdDiscord}
                            onChange={(event) => setSelIdDiscord(event.target.value)}
                        />
                    </div>
                    <div className={divEdit}>
                        <p>Полный доступ</p>
                        <Checkbox 
                            size="lg" 
                            className="mt-0.5" 
                            isDisabled={lvl < 5 ? true : false}
                            isSelected={selFullAccess}
                            onChange={() => setSelFullAccess(!selFullAccess)}
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row mx-10 gap-3 justify-between mt-5">
                    <div className="flex flex-col w-auto md:w-[45%] p-3 border-1 border-gray-800 shadow-lg">
                        <div className="">
                            <p>Выдать неактив</p>
                            <DateRangePicker 
                                label="Выберите промежуток"
                                className="w-full rounded-lg border-2 border-white mt-2"
                                size="sm"
                                onChange={handleDataChange}
                            />
                        </div>
                        
                        <div className="mt-4">
                            <p>Заметки</p>
                            <Input 
                                classNames={{
                                    inputWrapper: [
                                        "pt-3"
                                    ],
                                    innerWrapper: [
                                        "pt-9"
                                    ]
                                }}
                                className="w-auto rounded-lg border-2 border-white mt-2 h-[55%]"
                                type="input" 
                                label="Текст"
                                value={selNotion}
                                onChange={(event) => setSelNotion(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col w-auto md:w-[45%] p-3 border-1 border-gray-800 shadow-lg">
                        <div className="">
                            <p>Сменить форум</p>
                            <Input 
                                classNames={{
                                    inputWrapper: [
                                        "pt-3"
                                    ],
                                    innerWrapper: [
                                        "pt-9"
                                    ]
                                }}
                                defaultValue={selForum} 
                                className="w-auto rounded-lg border-2 border-white mt-2 h-[55%]"
                                type="input" 
                                label="Введите ссылку"
                                value={selForum}
                                onChange={(event) => setSelForum(event.target.value)}
                            />
                        </div>
                        <div className="mt-2">
                            <p>Сменить VK</p>
                            <Input 
                                classNames={{
                                    inputWrapper: [
                                        "pt-3"
                                    ],
                                    innerWrapper: [
                                        "pt-9"
                                    ]
                                }}
                                defaultValue={selVkontakte} 
                                className="w-auto rounded-lg border-2 border-white mt-2 h-[55%]"
                                type="input" 
                                label="Введите ссылку" 
                                value={selVkontakte}
                                onChange={(event) => setSelVkontakte(event.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row mx-10 gap-3 justify-between mt-5 text-center">
                    {active_type === "admin" ? (
                        <>
                            <div className="flex flex-col w-auto p-3 pb-8 border-1 border-gray-800 shadow-lg">
                                <p>Выговор</p>
                                <div className="flex flex-row h-15 justify-center items-center">
                                    <ButtonGroup variant="flat" size="lg" className="mt-2">
                                    <Input
                                        variant="bordered"
                                        className="h-12"
                                        classNames={{
                                            inputWrapper: [
                                                "rounded-none",
                                                "rounded-tl-full",
                                                "rounded-bl-full",
                                                "border-x-2",
                                                "border-y-2",
                                            ],
                                        }}
                                        type="text"
                                        value={selWarn.reason}
                                        onChange={(event) => setSelWarn({ ...selWarn, reason: event.target.value })}
                                        radius="full"
                                        label="Введите причину"
                                    />
                                    <Button className="rounded-none">
                                        {descriptions[selectedGiveWarn]}
                                    </Button>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <Button isIconOnly>
                                                <FaChevronDown />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            aria-label="Выдать/снять предупреждение"
                                            selectedKeys={isGiveWarn}
                                            selectionMode="single"
                                            onSelectionChange={(keys: any) => {
                                                if (typeof keys.currentKey === "string"){
                                                    setIsGiveWarn(new Set([keys.currentKey]));
                                                    setSelWarn({ ...selWarn, type: keys.currentKey });
                                                }
                                            }}
                                            className="max-w-[300px]"
                                        >
                                            <DropdownItem key="plus" description={descriptionsMap["plus"]}>
                                                {descriptions["plus"]}
                                            </DropdownItem>
                                            <DropdownItem key="minus" description={descriptionsMap["minus"]}>
                                                {descriptions["minus"]}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    </ButtonGroup>
                                </div>
                                <p className="pt-3">Блатные дни</p>
                                <div className="flex flex-row h-15 justify-center items-center">
                                    <ButtonGroup variant="flat" size="lg" className="mt-2">
                                    <Input
                                        variant="bordered"
                                        className="h-12"
                                        classNames={{
                                            inputWrapper: [
                                                "rounded-none",
                                                "rounded-tl-full",
                                                "rounded-bl-full",
                                                "border-x-2",
                                                "border-y-2",
                                            ],
                                        }}
                                        type="number"
                                        value={selFreeDays.amount.toString()}
                                        onChange={(event) => setSelFreeDays({ ...selFreeDays, amount: parseInt(event.target.value)})}
                                        radius="full"
                                        label="Введите кол-во"
                                    />
                                    <Button className="rounded-none">
                                        {descriptions[selectedGiveFreeDay]}
                                    </Button>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <Button isIconOnly>
                                                <FaChevronDown />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            aria-label="Выдать/снять блат.дни"
                                            selectedKeys={isGiveFreeDay}
                                            selectionMode="single"
                                            onSelectionChange={(keys: any) => {
                                                if (typeof keys.currentKey === "string"){
                                                    setIsGiveFreeDay(new Set([keys.currentKey]));
                                                    setSelFreeDays({ ...selFreeDays, type: keys.currentKey });
                                                }
                                            }}
                                            className="max-w-[300px]"
                                        >
                                            <DropdownItem key="plus" description={descriptionsMap["plus"]}>
                                                {descriptions["plus"]}
                                            </DropdownItem>
                                            <DropdownItem key="minus" description={descriptionsMap["minus"]}>
                                                {descriptions["minus"]}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    </ButtonGroup>
                                </div>
                            </div>
                            <div className="flex flex-col w-auto p-3 pb-8 border-1 border-gray-800 shadow-lg">
                                <p>Дни</p>
                                <div className="flex flex-row h-15 justify-center items-center">
                                    <ButtonGroup variant="flat" size="lg" className="mt-2">
                                    <Input
                                        variant="bordered"
                                        className="h-12"
                                        classNames={{
                                        inputWrapper: [
                                            "rounded-none",
                                            "rounded-tl-full",
                                            "rounded-bl-full",
                                            "border-x-2",
                                            "border-y-2",
                                        ],
                                        }}
                                        type="number"
                                        value={selDays.amount.toString()}
                                        onChange={(event) => setSelDays({ ...selDays, amount: parseInt(event.target.value) })}
                                        radius="full"
                                        label="Введите кол-во"
                                    />
                                    <Button className="rounded-none">
                                        {descriptions[selectedGiveDay]}
                                    </Button>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                        <Button isIconOnly>
                                            <FaChevronDown />
                                        </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            aria-label="Выдать/снять дни"
                                            selectedKeys={isGiveDay}
                                            selectionMode="single"
                                            onSelectionChange={(keys: any) => {
                                                if (typeof keys.currentKey === "string"){
                                                    setIsGiveDay(new Set([keys.currentKey]));
                                                    setSelDays({ ...selDays, type: keys.currentKey });
                                                }
                                            }}
                                            className="max-w-[300px]"
                                        >
                                            <DropdownItem key="plus" description={descriptionsMap["plus"]}>
                                                {descriptions["plus"]}
                                            </DropdownItem>
                                            <DropdownItem key="minus" description={descriptionsMap["minus"]}>
                                                {descriptions["minus"]}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    </ButtonGroup>
                                </div>
                                <p className="pt-3">Репутация</p>
                                <div className="flex flex-row h-15 justify-center items-center">
                                    <ButtonGroup variant="flat" size="lg" className="mt-2">
                                    <Input
                                        variant="bordered"
                                        className="h-12"
                                        classNames={{
                                            inputWrapper: [
                                                "rounded-none",
                                                "rounded-tl-full",
                                                "rounded-bl-full",
                                                "border-x-2",
                                                "border-y-2",
                                            ],
                                        }}
                                        type="number"
                                        value={selReputation.amount.toString()}
                                        onChange={(event) => setSelReputation({ ...selReputation, amount: parseInt(event.target.value)})}
                                        radius="full"
                                        label="Введите кол-во"
                                    />
                                    <Button className="rounded-none">
                                        {descriptions[selectedGiveReputation]}
                                    </Button>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <Button isIconOnly>
                                                <FaChevronDown />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            aria-label="Выдать/снять репутацию"
                                            selectedKeys={isGiveReputation}
                                            selectionMode="single"
                                            onSelectionChange={(keys: any) => {
                                                if (typeof keys.currentKey === "string"){
                                                    setIsGiveReputation(new Set([keys.currentKey]));
                                                    setSelReputation({ ...selReputation, type: keys.currentKey });
                                                }
                                            }}
                                            className="max-w-[300px]"
                                        >
                                            <DropdownItem key="plus" description={descriptionsMap["plus"]}>
                                                {descriptions["plus"]}
                                            </DropdownItem>
                                            <DropdownItem key="minus" description={descriptionsMap["minus"]}>
                                                {descriptions["minus"]}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col w-auto p-3 pb-8 border-1 border-gray-800 shadow-lg">
                                <p>Строгий выговор</p>
                                <div className="flex flex-row h-15 justify-center items-center">
                                    <ButtonGroup variant="flat" size="lg" className="mt-2">
                                    <Input
                                        variant="bordered"
                                        className="h-12"
                                        classNames={{
                                            inputWrapper: [
                                                "rounded-none",
                                                "rounded-tl-full",
                                                "rounded-bl-full",
                                                "border-x-2",
                                                "border-y-2",
                                            ],
                                        }}
                                        type="text"
                                        value={selHardWarn.reason}
                                        onChange={(event) => setSelHardWarn({ ...selHardWarn, reason: event.target.value })}
                                        radius="full"
                                        label="Введите причину"
                                    />
                                    <Button className="rounded-none">
                                        {descriptions[selectedGiveHardWarn]}
                                    </Button>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <Button isIconOnly>
                                                <FaChevronDown />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            aria-label="Выдать/снять строгий выговор"
                                            selectedKeys={isGiveHardWarn}
                                            selectionMode="single"
                                            onSelectionChange={(keys: any) => {
                                                if (typeof keys.currentKey === "string"){
                                                    setIsGiveHardWarn(new Set([keys.currentKey]));
                                                    setSelHardWarn({ ...selHardWarn, type: keys.currentKey });
                                                }
                                            }}
                                            className="max-w-[300px]"
                                        >
                                            <DropdownItem key="plus" description={descriptionsMap["plus"]}>
                                                {descriptions["plus"]}
                                            </DropdownItem>
                                            <DropdownItem key="minus" description={descriptionsMap["minus"]}>
                                                {descriptions["minus"]}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    </ButtonGroup>
                                </div>
                            </div>
                            <div className="flex flex-col w-auto p-3 pb-8 border-1 border-gray-800 shadow-lg">
                                <p>Устный выговор</p>
                                <div className="flex flex-row h-15 justify-center items-center">
                                    <ButtonGroup variant="flat" size="lg" className="mt-2">
                                    <Input
                                        variant="bordered"
                                        className="h-12"
                                        classNames={{
                                            inputWrapper: [
                                                "rounded-none",
                                                "rounded-tl-full",
                                                "rounded-bl-full",
                                                "border-x-2",
                                                "border-y-2",
                                            ],
                                        }}
                                        type="text"
                                        value={selEasyWarn.reason}
                                        onChange={(event) => setSelEasyWarn({ ...selEasyWarn, reason: event.target.value })}
                                        radius="full"
                                        label="Введите причину"
                                    />
                                    <Button className="rounded-none">
                                        {descriptions[selectedGiveEasyWarn]}
                                    </Button>
                                    <Dropdown placement="bottom-end">
                                        <DropdownTrigger>
                                            <Button isIconOnly>
                                                <FaChevronDown />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            disallowEmptySelection
                                            aria-label="Выдать/снять строгий выговор"
                                            selectedKeys={isGiveEasyWarn}
                                            selectionMode="single"
                                            onSelectionChange={(keys: any) => {
                                                if (typeof keys.currentKey === "string"){
                                                    setIsGiveEasyWarn(new Set([keys.currentKey]));
                                                    setSelEasyWarn({ ...selEasyWarn, type: keys.currentKey });
                                                }
                                            }}
                                            className="max-w-[300px]"
                                        >
                                            <DropdownItem key="plus" description={descriptionsMap["plus"]}>
                                                {descriptions["plus"]}
                                            </DropdownItem>
                                            <DropdownItem key="minus" description={descriptionsMap["minus"]}>
                                                {descriptions["minus"]}
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-center mt-5">
                    <Button
                        color="success"
                        className="text-white font-bold text-xl"
                        radius="lg"
                        onClick={applyChanges}
                    >
                        <p className="mx-10">Применить</p>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default EditWindow;