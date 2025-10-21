"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./Toast";
import { useToast } from "./use-toast";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && (
                <div className="flex items-center gap-2">
                  {props.variant === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {props.variant === "destructive" && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {props.variant === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  {props.variant === "default" && (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                  <ToastTitle>{title}</ToastTitle>
                </div>
              )}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
