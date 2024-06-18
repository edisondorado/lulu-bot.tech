import { useState } from "react";

import { Toaster } from "react-hot-toast";
import NavBar from "./systems/NavBar";

import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { RiUserAddLine } from "react-icons/ri";
import { IoIosSearch } from "react-icons/io";

import TableAdmins from "./systems/TableAdmins";

const Admins = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [isCreateUser, setIsCreateUser] = useState<boolean>(false);

  return (
    <div className="w-full h-screen md:h-screen m-0 p-0 bg-[#18181B] text-white">
      <NavBar />
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "bg-[#333] text-[#fff] rounded-md",
          duration: 5000,
        }}
      />
      <div className="pt-24 md:pt-6 w-auto h-full px-2 md:ml-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p className="text-xl font-bold hidden md:block">Администрация</p>
          <Button
            color="success"
            size="lg"
            className="ml-auto mr-4 w-full md:w-64 text-xl font-bold text-white"
            startContent={<RiUserAddLine className="w-full h-full" />}
            onClick={() => setIsCreateUser(true)}
          >
            Добавить
          </Button>
          <div className="flex w-full md:w-64 flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <Input
              isClearable={false}
              radius="lg"
              placeholder="Поиск.."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              startContent={<IoIosSearch className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
            />
          </div>
        </div>
        <TableAdmins searchInput={searchInput} isCreateUser={isCreateUser} setIsCreateUser={setIsCreateUser} />
      </div>
    </div>
  );
};



export default Admins;
