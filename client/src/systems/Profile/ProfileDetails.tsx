import { Skeleton } from "@nextui-org/skeleton";
import classNames from "classnames";

interface InactivePeriod{
    from: Date;
    to: Date;
}

interface Profile{
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

interface ProfileDetail {
    label: string;
    value: (profile: Profile) => string;
}

const profileDetails: {
    admin: ProfileDetail[],
    leader: ProfileDetail[]
} = {
    admin: [
        { label: "Должность", value: profile => profile.job_title },
        { label: "Доп. Должность", value: profile => profile.additional_job_title },
        { label: "Тип назначения", value: profile => profile.reason },
        { label: "Выговоры", value: profile => `${profile.active_warns}/3` },
        { label: "Дата назначения", value: profile => new Date(profile.appointment_date).toISOString().split("T")[0].toString() },
        { label: "Последнее повышение", value: profile => profile.promotion_date },
        { label: "Дней на уровне", value: profile => calculateDaysAtLevel(profile).toString() },
        { label: "Дни неактива", value: profile => calculateInactiveDays(profile).toString() || "" },
        { label: "Дни", value: profile => profile.day !== undefined ? profile.day.toString() : "" },
        { label: "Репутация", value: profile => profile.reputation !== undefined ? profile.reputation.toString() : "" },
        { label: "Блат дни", value: profile => profile.free_days !== undefined ? profile.free_days.toString() : "" },
    ],
    leader: [
        { label: "Фракция", value: profile => profile.fraction },
        { label: "Тип назначения", value: profile => profile.reason },
        { label: "Строгие выговоры", value: profile => profile.hard_warn.toString() },
        { label: "Устные выговоры", value: profile => profile.easy_warn.toString() },
        { label: "Дата назначения", value: profile => new Date(profile.appointment_date).toISOString().split("T")[0].toString() },
        { label: "Дней на посту", value: profile => calculateDaysAtLevel(profile).toString() },
        { label: "Дни неактива", value: profile => calculateInactiveDays(profile).toString() }
    ]
}

interface ProfileDetailsProps {
    profile: Profile,
    role: 'admin' | 'leader',
    isLoading: boolean
}

const calculateDaysAtLevel = (profile: Profile): number => {
    const startDate = new Date(profile.appointment_date);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000));
    return diffDays;
}


const calculateInactiveDays = (profile: Profile): number => {
    const inactivePeriods = profile.inactives || [];
    const totalInactiveDays = inactivePeriods.reduce((total: number, period: InactivePeriod) => {
        const start = new Date(period.from);
        const end = new Date(period.to);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000))
        return total + diffDays;
    }, 0)
    return totalInactiveDays;
}

function ProfileDetails({ profile, role, isLoading }: ProfileDetailsProps) {
    return(
        <div className="bg-[#2727A] p-4 h-full rounded-md">
            <div className={classNames(
                "flex flex-col justify-center h-[100%]",
                {"space-y-7": !isLoading, "space-y-10": isLoading, "space-y-12": role === "leader"}
            )}>
                {profileDetails[role] && profile && !isLoading && profileDetails[role].map((detail, index) => (
                    <div key={index} className="flex justify-between font-bold">
                        <span className="text-gray-200">{detail.label}</span>
                        <span className="text-white">{detail.value(profile)}</span>
                    </div>
                ))}
                {isLoading && Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="w-[100%] h-5 rounded-lg" />
                ))}
            </div>
        </div>
    )
}

export default ProfileDetails;