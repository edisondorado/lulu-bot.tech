import { useState, useEffect, useRef } from "react";
import { Button } from "@nextui-org/button";
import { Skeleton } from "@nextui-org/skeleton";
import { BsChevronDoubleRight, BsChevronDoubleLeft, BsChevronDoubleDown, BsChevronDoubleUp } from "react-icons/bs";
import { FaHome, FaUser } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import classNames from 'classnames';
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import instance from "../axios";

const priorityRoles = {
    "full": 3,
    "admin": 2,
    "leader": 1,
} as const;

type RoleType = keyof typeof priorityRoles;

const NavBar = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [isHovered, setIsHovered] = useState(false)
    const [navItems, setNavItems] = useState([
        { icon: <FaHome className="sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-8 lg:h-8" />, key: 'home', access: 0, text: "Главная страница", collapsed: false, collapsible: false, link: `${import.meta.env.VITE_DOMAIN_CLIENT}`, collapse: [] },
        { icon: <FaUser className="sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-8 lg:h-8" />, key: 'user', access: 0, text: "Профиль", collapsed: false, collapsible: false, link: `${import.meta.env.VITE_DOMAIN_CLIENT}/profile`, collapse: [] },
        { icon: <FaPeopleGroup className="sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-8 lg:h-8" />, key: 'group', access: 0, text: "Пользователи", collapsed: false, link: "", collapsible: true, collapse: [{name: "Администрация", key: "group_admins", access: 2, link: `${import.meta.env.VITE_DOMAIN_CLIENT}/admins`}, {name: "Лидеры", key: "group_leaders", access: 1, link: `${import.meta.env.VITE_DOMAIN_CLIENT}/leaders`}] },
    ])
    const [priority, setPriority] = useState(0);
    const navBarRef = useRef<HTMLDivElement>(null);

    const fetchProfile = async () => {
        try{
            const res = await instance.get("/profile", { withCredentials: true })
            setProfile(res.data)

            const userType = res.data.type as RoleType;
            
            if (res.data.full_access) {
                setPriority(3);
            } else if (priorityRoles[userType] !== undefined) {
                setPriority(priorityRoles[userType]);
            } else {
                setPriority(0);
            }
        } catch(err) {
            console.warn(err);
        } finally {
            setIsLoading(false)
        }
    }
    
    useEffect(() => {
        fetchProfile()
        const handleClickOutside = (event: MouseEvent) => {
            if (navBarRef.current && !(navBarRef.current as any).contains(event.target)){
                setIsHovered(false);
                setNavItems(prevItems => prevItems.map(item => 
                    {return{...item, collapsed: false}}
                ));
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])


    const handleChangeHover = () => {
        setIsHovered(!isHovered);
        if (isHovered){
            setNavItems(prevItems => prevItems.map(item => 
                  {return{...item, collapsed: false}}
              ));
        }
    }

    const handleClickNav = (key: string) => {
        const nav = navItems.find(item => item.key === key);
        if (nav) {
            if (nav.link !== "") {
                window.location.href = `${nav.link}`;
            } else if (nav.collapsible) {
                if (!isHovered) setIsHovered(true)
                setNavItems(prevItems => prevItems.map(item => 
                    item.key === key ? 
                      {...item, collapsed: !item.collapsed} : 
                      item
                  ));
            }
        }
    };

    const handleClickCollapse = (nav_key: string, collapse_key: string) => {
        const nav = navItems.find(item => item.key === nav_key)
        if (nav){
            nav.collapse.map(item => {
                if (item.key === collapse_key) window.location.href = `${item.link}`
            })
        }
    }
    

    return(
        <div ref={navBarRef} className={classNames(
                "bg-[#27272A] w-full h-12 md:h-screen flex flex-col items-start transition-all duration-300 ease-in-out truncate fixed z-50 shadow-2xl ",
                { "h-[60%] md:w-60 lg:w-80": isHovered, "sm:w-10 md:w-12 lg:w-16": !isHovered }
            )}>
            <div className="w-full cursor-pointer mt-5 md:mb-10 lg:mb-20">
                <div onClick={handleChangeHover} className="flex flex-row justify-around items-center">
                    {isHovered ? (
                        <>
                            <p className="font-bold text-2xl">Lulu Project</p>
                            <BsChevronDoubleUp className="block md:hidden w-8 h-8" />
                            <BsChevronDoubleLeft className="hidden md:block w-8 h-8" />
                        </>
                    ) : (
                        <>
                            <p className="block md:hidden font-bold text-2xl">Lulu Project</p>
                            <BsChevronDoubleDown className="block md:hidden w-8 h-8" onClick={handleChangeHover} />
                            <BsChevronDoubleRight className="hidden md:block w-8 h-8" onClick={handleChangeHover} />
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col mt-24 md:mt-48 w-full md:pr-4 ">
                <ul>
                    {navItems.map((item) => {
                        if (priority < item.access) return;
                        const collapse = item.collapsed ? (
                            <ul key={`${item.key}-collapse`} className="flex flex-col ml-4 font-medium text-md">
                                {item.collapse.map((section) => {
                                    if (priority < section.access) return;
                                    return(
                                        <li key={section.key} onClick={() => handleClickCollapse(item.key, section.key)} className="cursor-pointer text-stone-300 hover:text-white">
                                            {section.name} 
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : null;

                        return (
                            <div key={item.key}>
                                <li onClick={() => handleClickNav(item.key)} key={item.key} className={classNames(
                                    "cursor-pointer ml-4 flex flex-row justify-between gap-14 items-center text-stone-300 hover:text-white",
                                    { "mb-4": item.collapsed, "md:mb-6 lg:mb-8": !item.collapsed }
                                )}>
                                    <div className="flex items-center">
                                        {item.icon}
                                        <p className="pl-5 font-semibold text-xl">{item.text}</p>
                                    </div>
                                    {item.collapsible && (
                                        item.collapsed ? (
                                            <IoIosArrowUp className="sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-8 lg:h-8" />
                                        ) : (
                                            <IoIosArrowDown className="sm:w-2 sm:h-2 md:w-4 md:h-4 lg:w-8 lg:h-8"/>
                                        )
                                    )}
                                </li>
                                <div className="ml-12 mb-6">
                                    {collapse}
                                </div>
                            </div>
                        );
                    })}
                </ul>
            </div>
            <div className="mt-auto mx-auto flex flex-col items-center transition-all duration-300 ease-in-out mb-5">
                <div className="flex flex-row items-center">
                    <Skeleton isLoaded={!isLoading} className="flex rounded-full w-14 h-14">
                        {profile && (
                            <img src={profile.data.avatar} alt={profile.data.username} className="rounded-full md:w-10 lg:w-14 ml-1" />
                        )}
                    </Skeleton>
                    <Skeleton isLoaded={!isLoading} className="flex ml-2 w-32 rounded-lg">
                        {profile && (
                            <p className="ml-3 text-xl">{profile.data.username}</p>
                        )}
                    </Skeleton>
                </div>
                {isHovered ? (
                    <Button startContent={<MdLogout size={20} />} radius="md" size="lg" variant="bordered" className="mt-2 text-white" onClick={() => window.location.href = `${import.meta.env.VITE_DOMAIN_SERVER}/auth/logout`}>
                        Выйти
                    </Button>
                ) : (
                    <Button isIconOnly radius="md" size="md" variant="bordered" className="mt-4 md:mr-36 lg:mr-32 text-white" onClick={() => window.location.href = `${import.meta.env.VITE_DOMAIN_SERVER}/auth/logout`}>
                        <MdLogout size={20} />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default NavBar;