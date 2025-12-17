"use client"

import {
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="h-4 w-4" />,
        info: <InformationCircleIcon className="h-4 w-4" />,
        warning: <ExclamationTriangleIcon className="h-4 w-4" />,
        error: <XCircleIcon className="h-4 w-4" />,
        loading: <ArrowPathIcon className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-secondary/30 group-[.toaster]:bg-secondary/30 backdrop-blur-sm group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary bg-secondary/30  group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted bg-secondary/30  group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }



