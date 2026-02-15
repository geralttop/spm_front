import toast from "react-hot-toast";

/**
 * Хук для работы с toast уведомлениями
 */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => toast.promise(promise, messages),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
}
