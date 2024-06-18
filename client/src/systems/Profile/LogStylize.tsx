interface LogItems {
  timestamp: Date;
  action: string;
  issuedBy: {
    id: string;
    nickname: string;
  };
  targetUser: {
    id: string;
    nickname: string;
  };
  status: "leader" | "admin";
  active_status: "leader" | "admin";
  reason?: string;
  additionalInfo: string;
  previousValue?: string;
  new_value?: string;
  className?: string;
  sort: any;
  hidden: {
    status: boolean;
    author?: {
      id: string;
      nickname: string;
    };
  };
  full_access: boolean;
  onClick: (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => void; 
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

export default function LogStylize({
  timestamp,
  action,
  issuedBy,
  targetUser,
  active_status,
  status,
  reason,
  additionalInfo,
  previousValue,
  new_value,
  className = "",
  sort,
  hidden,
  full_access = false,
  onClick,
}: LogItems) {
  const renderActionDetails = (onClick: (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => void) => {
    if (hidden.status) return;
    if (status !== active_status) return;
    if (sort !== "" && sort !== action) return;
    if (action === "notion" && !full_access) return;

    var paragraph = `${getFormattedTime(timestamp)} | ${issuedBy.nickname} @action ${targetUser.nickname}.`
    const changed_values = `Старое значение: ${previousValue}. Новое значение: ${new_value}`

    switch (action) {
      case "nickname":
        paragraph = `${paragraph.replace("@action", "изменил никнейм")} ${changed_values}`
        break;
      case "id_discord":
        paragraph = `${paragraph.replace("@action", "изменил ID")} ${changed_values}`
        break;
      case "lvl":
        paragraph = `${paragraph.replace("@action", "изменил уровень")} ${changed_values}`
        break;
      case "active_warns":
        paragraph = `${paragraph.replace("@action", "изменил значение предупреждений")} ${changed_values}`
        break;
      case "job_title":
        paragraph = `${paragraph.replace("@action", "изменил должность")} ${changed_values}`
        break;
      case "additional_job_title":
        paragraph = `${paragraph.replace("@action", "изменил доп.должность")} ${changed_values}`
        break;
      case "inactive":
        paragraph = `${paragraph.replace("@action", "выдал неактив")} Даты: ${additionalInfo}`
        break;
      case "reason": 
        paragraph = `${paragraph.replace("@action", "изменил причину назначения")} ${changed_values}`
        break;
      case "dismiss_reason":
        paragraph = `${paragraph.replace("@action", "снял с должности")} Причина: ${reason}`
        break;
      case "forum":
        paragraph = `${paragraph.replace("@action", "изменил значение форума")} ${changed_values}`
        break;
      case "vkontakte":
        paragraph = `${paragraph.replace("@action", "изменил значение VK")} ${changed_values}`
        break;
      case "day":
        paragraph = `${paragraph.replace("@action", "изменил значение дней")} ${changed_values}`
        break;
      case "full_access":
        paragraph = `${paragraph.replace("@action", `${previousValue === "false" ? "выдал" : "забрал"} полный доступ`)}`
        break;
      case "reputation":
        paragraph = `${paragraph.replace("@action", "изменил значение репутации")} ${changed_values}`
        break;
      case "exchange_reputation":
        paragraph = `${paragraph.replace("@action", "обменял репутацию на дни")}`
        break;
      case "exchange_days":
        paragraph = `${paragraph.replace("@action", "обменял дни на репутацию")}`
        break;
      case "free_days":
        paragraph = `${paragraph.replace("@action", "изменил количество блатных дней")} ${changed_values}`
        break;
      case "notion":
        paragraph = `${paragraph.replace("@action", "сделал пометку")} Текст: ${additionalInfo}`
        break;
      case "fraction":
        paragraph = `${paragraph.replace("@action", "изменил фракцию")} ${changed_values}`
        break;
      case "hard_warn":
        paragraph = `${paragraph.replace("@action", "изменил количество строгих выговоров")} ${changed_values}`
        break;
      case "easy_warn":
        paragraph = `${paragraph.replace("@action", "изменил количество устных выговоров")} ${changed_values}`
        break;
      case "register":
        paragraph = `${paragraph.replace("@action", "зарегистрировал")}`
        break;
      default:
        return;
    }
    return (
        <p 
          onClick={onClick} 
          key={new Date(timestamp).toISOString()} 
          className={className}
        >
            {paragraph}
        </p>
    );
  };

  return (renderActionDetails(onClick));
}
