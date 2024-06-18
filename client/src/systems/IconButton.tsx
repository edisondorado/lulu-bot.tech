import { Skeleton } from "@nextui-org/skeleton";
import { Button } from "@nextui-org/button";

interface IconButtonProps {
    href?: string;
    Icon: any;
    onClick?: () => void;
    isLoading?: boolean;
}

const IconButton = ({ 
    href, 
    Icon, 
    onClick, 
    isLoading = false
}: IconButtonProps) => (
    <Skeleton isLoaded={!isLoading} className="rounded-full mt-2 w-auto">
        {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
                <Button isIconOnly size="md" radius="full" className="bg-[#18181B] p-2 text-[#FFF]">
                    <Icon className="w-auto" />
                </Button>
            </a>
        ) : (
            <Button onClick={onClick} isIconOnly size="md" radius="full" className="bg-[#18181B] p-2 text-[#FFF]">
                <Icon className="w-auto" />
            </Button>
        )}
    </Skeleton>
);

export default IconButton;