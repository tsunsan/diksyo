"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-6 text-black" />
        ),
        info: (
          <InfoIcon className="size-6 text-black" />
        ),
        warning: (
          <TriangleAlertIcon className="size-6 text-black" />
        ),
        error: (
          <OctagonXIcon className="size-6 text-black" />
        ),
        loading: (
          <Loader2Icon className="size-6 text-black animate-spin" />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-4 w-full rounded-none border-4 border-black p-4 text-black shadow-[8px_8px_0_0_#000] bg-white",
          title: "text-lg font-black uppercase tracking-tighter",
          description: "font-bold text-xs text-black/90 uppercase",
          icon: "text-black",
          success: "bg-green-400",
          error: "bg-red-400",
          warning: "bg-yellow-400",
          info: "bg-blue-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
