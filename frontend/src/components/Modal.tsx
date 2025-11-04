// src/components/Modal.tsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
  initialFocus?: React.RefObject<HTMLElement>;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOutsideClick = true,
  showCloseButton = true,
  footer,
  initialFocus
}: ModalProps) {
  const { theme } = useTheme();
  const cancelButtonRef = useRef(null);

  // Size classes mapping
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // Restore body scroll when modal is closed
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOutsideClick ? onClose : () => {}}
        initialFocus={initialFocus || cancelButtonRef}
      >
        {/* Backdrop / Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`${sizeClasses[size]} w-full transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                {/* Header with title and close button */}
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {title}
                  </Dialog.Title>
                  
                  {showCloseButton && (
                    <button
                      type="button"
                      className={`rounded-md p-1 inline-flex items-center justify-center ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                          : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                      }`}
                      onClick={onClose}
                      ref={cancelButtonRef}
                      aria-label="Tutup"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4">
                  {children || (
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Tidak ada konten yang tersedia
                    </p>
                  )}
                </div>

                {/* Footer */}
                {footer && (
                  <div className={`mt-6 pt-4 border-t ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}>
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}