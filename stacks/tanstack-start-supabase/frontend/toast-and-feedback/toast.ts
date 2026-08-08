import { toast as sonnerToast } from "sonner";

/**
 * Artspire toast utility.
 * Thin wrapper around Sonner with consistent messaging and styling.
 *
 * Usage:
 *   import { toast } from "@/lib/toast";
 *   toast.success("Category saved!");
 *   toast.error("Failed to upload image.");
 *   toast.warning("Image too large. Max 5MB.");
 *   toast.info("Changes are saved automatically.");
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, {
      description,
      duration: 3000,
    }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, {
      description,
      duration: 5000,
    }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, {
      description,
      duration: 3000,
    }),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) =>
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),

  dismiss: sonnerToast.dismiss,
};
