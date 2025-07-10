'use client';

import { useModal } from '@/app/context/ModalContext';
import { BottomSheet } from '../modals/BottomSheet';
import { CardTransferDialog } from '../modals/CardTransferDialog';
import { WithdrawalRequestDialog } from '../modals/WithdrawalRequestDialog';
import { CryptoPaymentDialog } from '../modals/CryptoPaymentDialog';
import { RequestSuccessDialog } from '../modals/RequestSuccessDialog';
import { QRCodeDialog } from '../modals/QRCodeDialog';
import { CardTransferConfirmationDialog } from '../modals/CardTransferConfirmationDialog';
import { ModalProps, ModalType } from '@/app/context/ModalContext';

export function ModalManager() {
  const { state, closeModal } = useModal();

  const renderModal = (
    modal: {
      id: string;
      type: ModalType;
      props: ModalProps[ModalType];
      isClosing?: boolean;
    },
    index: number,
  ) => {
    const commonProps = {
      isOpen: !modal.isClosing, // Используем isClosing для управления видимостью
      onClose: () => closeModal(modal.id),
      style: { zIndex: 50 + index * 10 },
    };

    switch (modal.type) {
      case 'BottomSheet':
        return (
          <BottomSheet
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['BottomSheet'])}
            isClosing={modal.isClosing} // Передаем isClosing
          />
        );
      case 'CardTransferDialog':
        return (
          <CardTransferDialog
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['CardTransferDialog'])}
            isClosing={modal.isClosing}
          />
        );
      case 'WithdrawalRequestDialog':
        return (
          <WithdrawalRequestDialog
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['WithdrawalRequestDialog'])}
            isClosing={modal.isClosing}
          />
        );
      case 'CryptoPaymentDialog':
        return (
          <CryptoPaymentDialog
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['CryptoPaymentDialog'])}
            isClosing={modal.isClosing}
          />
        );
      case 'RequestSuccessDialog':
        return (
          <RequestSuccessDialog
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['RequestSuccessDialog'])}
            isClosing={modal.isClosing}
          />
        );
      case 'QRCodeDialog':
        return (
          <QRCodeDialog
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['QRCodeDialog'])}
            isClosing={modal.isClosing}
          />
        );
      case 'CardTransferConfirmationDialog':
        return (
          <CardTransferConfirmationDialog
            key={modal.id}
            {...commonProps}
            {...(modal.props as ModalProps['CardTransferConfirmationDialog'])}
            isClosing={modal.isClosing}
          />
        );
      default:
        return null;
    }
  };

  return <>{state.modals.map((modal, index) => renderModal(modal, index))}</>;
}
