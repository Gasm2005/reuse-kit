import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Artspire-themed Sonner toaster.
 * Uses warm cream background, forest text, and gold accents.
 * Mount once in RootComponent.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: [
            "font-body text-[13px] rounded-xl shadow-md border",
            "bg-white text-forest border-border",
          ].join(" "),
          title: "font-semibold text-forest text-[13px]",
          description: "text-stone text-[12px] mt-0.5",
          actionButton: "bg-forest text-white font-semibold text-[12px] rounded-lg px-3 py-1.5",
          cancelButton: "bg-cream text-stone font-semibold text-[12px] rounded-lg px-3 py-1.5",
          closeButton: "text-stone/60 hover:text-stone",
          success: "border-green-200 bg-green-50 text-green-800",
          error: "border-red-200 bg-red-50 text-red-800",
          warning: "border-amber-200 bg-amber-50 text-amber-800",
          info: "border-blue-200 bg-blue-50 text-blue-800",
          loader: "text-gold",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
