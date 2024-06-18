import { useState } from "react";

import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";

import { TfiReload } from "react-icons/tfi";
import toast from "react-hot-toast";
import instance from "../../axios";

interface ExchangeProps{
    reputation: number;
    days: number;
}

const ExchangeWindow = ({ reputation, days }: ExchangeProps) => {
    const [selectedDays, setSelectedDays] = useState({
        days: 0,
        remainingReputation: 0
    });
    const [selectedReputation, setSelectedReputation] = useState({
        reputation: 0,
        remainingDays: 0
    });
    const [isExchanging, setIsExchanging] = useState(false);

    const listReputation = allReputationToDays(reputation);
    const listDays = allDaysToReputation(days);

    const handleExchange = async () => {
        setIsExchanging(true);
        const toast_loading = toast.loading("Загрузка..")

        const data = {
            selectedDays,
            selectedReputation
        }
        await instance.post("/profile/exchange", data, { withCredentials: true})
            .then(async () => {
                toast.success("Обмен прошел успешно")
                await new Promise(resolve => setTimeout(resolve, 3000));
                window.location.reload();
            })
            .catch(async (error) => {
                console.warn(error)
                toast.error("Произошла ошибка при обмене")
                await new Promise(resolve => setTimeout(resolve, 3000))
                window.location.reload();   
            })
            .finally(async () => {
                toast.dismiss(toast_loading);
            })
    };

    const styleSelect = "w-full rounded-lg border-2 border-white mt-2";

    return (
        <div className="flex flex-col h-full mx-6 pb-6 pt-5">
            <div className="bg-[#27272A] p-2 shadow-lg flex flex-col text-center">
                <div>
                    <p className="text-3xl font-bold">Обмен</p>
                </div>
                <p>
                    Перед тем как сделать обмен репутации/дней, убедитесь, что вы выбрали необходимой количество дней/репутации.<br/>
                    Восстановление репутации/дней невозможно.<br/><br/>
                    Курс обмена:<br/>
                    <span className="font-bold">500 репутация = 1 день<br/></span>
                    <span className="font-bold">1 день = 250 репутации</span>
                </p>
                <div className="flex flex-col md:flex-row justify-around mt-4 mb-4">
                    <div className="w-auto md:w-[40%]">
                        <p>Репутация</p>
                        <Select
                            items={listReputation}
                            label="Выберите дни"
                            value={selectedDays.days}
                            isDisabled={selectedReputation.reputation !== 0 ? true : false}
                            onChange={(e) => {
                                const chosenDays = listReputation.find((item) => item.key === parseInt(e.target.value)); 
                                if (chosenDays) {
                                    setSelectedDays({ days: chosenDays.key, remainingReputation: chosenDays.remainingReputation }); 
                                } else {
                                    setSelectedDays({ days: 0, remainingReputation: 0 }); 
                                }
                            }}
                            className={styleSelect}
                        >
                            {listReputation.map((item) => (
                                <SelectItem
                                    key={item.key}
                                >
                                    {item.value}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                    <div className="w-auto md:w-[40%]">
                        <p>Дни</p>
                        <Select
                            items={listDays}
                            label="Выберите репутацию"
                            value={selectedReputation.reputation}
                            isDisabled={selectedDays.days !== 0 ? true : false}
                            onChange={(e) => {
                                const chosenReputation = listDays.find((item) => item.key === parseInt(e.target.value)); 
                                if (chosenReputation) {
                                    setSelectedReputation({ reputation: chosenReputation.key, remainingDays: chosenReputation.remainingDays }); 
                                } else {
                                    setSelectedReputation({ reputation: 0, remainingDays: 0 }); 
                                }
                            }}
                            className={styleSelect}
                        >
                            {listDays.map((item) => (
                                <SelectItem key={item.key}>
                                    {item.value}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="flex justify-center mt-auto" >
                    <Button isDisabled={isExchanging ? true : false} onClick={handleExchange} variant="faded" size="lg" startContent={<TfiReload />} color="success" className="text-white text-lg">
                        <p className="">Обменять</p>
                    </Button>
                </div>
            </div>
        </div>
    )
}

function allReputationToDays(reputation: number) {
    const reputationPerDay = 500;
    let exchanges = [];

    for (let days = 1; days <= Math.floor(reputation / reputationPerDay); days++) {
        let remainingReputation = reputation - (days * reputationPerDay);
        exchanges.push({ key: days, value: `Получите: ${days} дней. Останется: ${remainingReputation} репутации`, remainingReputation: remainingReputation });
    }

    return exchanges;
}

function allDaysToReputation(days: number) {
    const reputationPerDay = 250;
    let exchanges = [];

    for (let dayCount = 1; dayCount <= days; dayCount++) {
        let remainingDays = days - dayCount;
        let gainedReputation = dayCount * reputationPerDay;
        exchanges.push({ key: gainedReputation, value: `Получите: ${gainedReputation} репутации. Останется: ${remainingDays} дней`, remainingDays: remainingDays});
    }

    return exchanges;
}

export default ExchangeWindow;