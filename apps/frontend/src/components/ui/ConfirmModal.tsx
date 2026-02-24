"use client";

import React from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { Button } from "@/app/ui/components/Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  confirmLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  confirmLoading = false,
}) => {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      confirmType: "primary-admin" as const,
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      confirmType: "primary" as const,
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      confirmType: "primary" as const,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div
            className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg}`}
          >
            <svg
              className={`h-6 w-6 ${styles.iconColor}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">{message}</p>
            </div>
            <div className="flex justify-center space-x-3 mt-6">
              <Button
                onPress={onClose}
                type="secondary"
                text={cancelLabel ?? t("common.cancel")}
                testID="confirm-modal-cancel"
                inline
                disabled={confirmLoading}
              />
              <Button
                onPress={handleConfirm}
                type={styles.confirmType}
                text={confirmLabel ?? t("common.confirm")}
                testID="confirm-modal-confirm"
                inline
                disabled={confirmLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
