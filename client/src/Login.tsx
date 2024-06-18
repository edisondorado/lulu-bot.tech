import { Button } from "@nextui-org/button"
import { FaDiscord } from "react-icons/fa";
import { TiWarning } from "react-icons/ti";
import Logo from "./img/logo_test_az.png"

function Login() {
  const AuthRedirect = () => {
    window.location.href = `${import.meta.env.VITE_DOMAIN_SERVER}/auth`
  }

  return (
    <div className="max-w-1280 mx-auto h-screen p-8 flex flex-col items-center bg-stone-900">
      <img src={Logo} alt="Logo" className="size-32 mt-64"/>
      <div className="flex flex-col gap-4">
        <Button onClick={AuthRedirect} startContent={<FaDiscord size={28}/>} radius="sm" className="w-full border-0 border-transparent border-solid py-2 px-14 text-lg text-center text-stone-50 font-bold col-white cursor-pointer bg-zinc-600 transition-colors duration-250 hover:bg-indigo-600">
          Авторизоваться
        </Button>
        <Button startContent={<TiWarning size={28}/>} radius="sm" className="w-full border-0 border-transparent border-solid py-2 px-14 text-lg text-center text-stone-50 font-bold col-white cursor-pointer bg-zinc-600 transition-colors duration-250 hover:bg-indigo-600">
          Жалобы на модерацию
        </Button>
      </div>
    </div>
  )
}

export default Login
