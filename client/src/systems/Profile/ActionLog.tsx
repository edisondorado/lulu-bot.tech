import { Dropdown, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { forwardRef } from "react";

import { MdDeleteOutline, MdInfo } from "react-icons/md";

interface CursorPosition {
    x: number;
    y: number;
}

interface ActionLogProps {
    log: any;
    cursor: CursorPosition | null;
    ref: React.RefObject<HTMLDivElement>;
    onOpenInfo: (log: any) => void;
    onOpenDelete: (log: any) => void;
    disabledKeys: [string];
}

const ActionLog = forwardRef<HTMLDivElement, ActionLogProps>(
    ({ log, cursor, onOpenInfo, onOpenDelete, disabledKeys }: ActionLogProps, ref) => {
        const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

        if (!cursor) return null;

        return (
            <div ref={ref} className="fixed bg-blur" style={{ top: cursor.y, left: cursor.x }}>
                <Dropdown>
                    {[
                        <DropdownMenu
                            key="menu"
                            variant="shadow"
                            aria-label="Взаимодействие с логом"
                            disabledKeys={disabledKeys}
                            onAction={(key) => {
                                if (key === "info") {
                                    onOpenInfo(log);
                                } else if (key === "delete") {
                                    onOpenDelete(log);
                                }
                            }}
                        >
                            <DropdownItem
                                key="info"
                                startContent={<MdInfo className={iconClasses} />}
                                description="Подробная информация о логе"
                            >
                                Подробнее
                            </DropdownItem>
                            <DropdownItem
                                key="delete"
                                startContent={<MdDeleteOutline className={iconClasses} />}
                                description="Удалить лог"
                            >
                                Удалить
                            </DropdownItem>
                        </DropdownMenu>
                    ]}
                </Dropdown>
            </div>
        );
    }
);

export default ActionLog;
