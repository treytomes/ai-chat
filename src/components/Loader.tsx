import { Modal, ModalBody, ModalContent, Spinner } from "@nextui-org/react";

type LoaderProps = {
  message?: string;
};

export default function Loader(props: LoaderProps = { message: "" }) {
  console.debug(`Loader message: ${props.message}`);

  return (
    <Modal isOpen={true} isDismissable={false} hideCloseButton>
      <ModalContent>
        <ModalBody>
          <Spinner size="lg" title="ASDF" />
          <label className="text-center text-xl">{props.message}</label>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
