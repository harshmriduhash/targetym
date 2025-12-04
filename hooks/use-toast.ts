import { toast as sonnerToast } from "sonner"

// Compatibility wrapper to use sonner with toast-like API
export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = "default",
    }: {
      title?: string
      description?: string
      variant?: "default" | "destructive"
    }) => {
      if (variant === "destructive") {
        sonnerToast.error(title || "Error", {
          description,
        })
      } else {
        sonnerToast.success(title || "Success", {
          description,
        })
      }
    },
  }
}
