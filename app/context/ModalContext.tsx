'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

export type ModalType =
  | 'BottomSheet'
  | 'CardTransferDialog'
  | 'WithdrawalRequestDialog'
  | 'CryptoPaymentDialog'
  | 'RequestSuccessDialog'
  | 'QRCodeDialog'
  | 'CardTransferConfirmationDialog';

interface CryptoMethod {
  id: string;
  title: string;
  network: string;
}

export interface ModalProps {
  BottomSheet: { initialActiveTab?: 'Депозит' | 'Вывод' | 'История' };
  CardTransferDialog: { methodId: string };
  WithdrawalRequestDialog: { methodId: string };
  CryptoPaymentDialog: {
    method: CryptoMethod;
    selectedAmount: number;
  };
  RequestSuccessDialog: {
    requestType: 'deposit' | 'withdrawal';
  };
  QRCodeDialog: { walletAddress: string };
  CardTransferConfirmationDialog: {
    amount: number;
    methodId: string;
  };
}

interface Modal {
  id: string;
  type: ModalType;
  props: ModalProps[ModalType];
  isClosing?: boolean;
}

interface ModalState {
  modals: Modal[];
}

type ModalAction =
  | { type: 'OPEN_MODAL'; payload: Modal }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'MARK_MODAL_CLOSING'; payload: string };

interface ModalContextType {
  state: ModalState;
  openModal: <T extends ModalType>(type: T, props: ModalProps[T]) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: [
          ...state.modals.filter((m) => !m.isClosing),
          { ...action.payload, isClosing: false },
        ],
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: state.modals.filter((modal) => modal.id !== action.payload),
      };
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        modals: [],
      };
    case 'MARK_MODAL_CLOSING':
      return {
        ...state,
        modals: state.modals.map((modal) =>
          modal.id === action.payload ? { ...modal, isClosing: true } : modal,
        ),
      };
    default:
      return state;
  }
};

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(modalReducer, {
    modals: [],
  });

  const openModal = useCallback(
    <T extends ModalType>(type: T, props: ModalProps[T]) => {
      dispatch({
        type: 'OPEN_MODAL',
        payload: {
          id: uuidv4(),
          type,
          props,
        },
      });
    },
    [],
  );

  const closeModal = useCallback((id: string) => {
    dispatch({ type: 'MARK_MODAL_CLOSING', payload: id });
    setTimeout(() => {
      dispatch({ type: 'CLOSE_MODAL', payload: id });
    }, 300);
  }, []);

  const closeAllModals = useCallback(() => {
    state.modals.forEach((modal) => {
      dispatch({ type: 'MARK_MODAL_CLOSING', payload: modal.id });
    });
    setTimeout(() => {
      dispatch({ type: 'CLOSE_ALL_MODALS' });
    }, 300);
  }, [state.modals]);

  return (
    <ModalContext.Provider
      value={{
        state,
        openModal,
        closeModal,
        closeAllModals,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
