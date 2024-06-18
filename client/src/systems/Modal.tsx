import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

interface ModalProps {
    header: string;
    body: React.ReactNode;
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
    isOpen: boolean;
    backdrop?: "opaque" | "blur" | "transparent";
    onClose: () => void; 
    acceptButton?: string;
    onAccept?: () => void;
    hideAcceptButton?: boolean;
}

const CustomModal = ({ header, body, size = "md", backdrop = "blur", isOpen, onClose, acceptButton = "Принять", onAccept, hideAcceptButton = false }: ModalProps) => {
    return (
        <Modal 
            size={size} 
            isOpen={isOpen} 
            onClose={onClose}
            backdrop={backdrop}
        >
            <ModalContent>
                <ModalHeader>{header}</ModalHeader>
                <ModalBody>{body}</ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        { !acceptButton ? ("Закрыть") : ("Отменить") }
                    </Button>
                    {!hideAcceptButton && (
                        <Button color="success" variant="light" onPress={onAccept}>
                            {acceptButton}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CustomModal;