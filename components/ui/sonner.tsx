"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        className: "border border-white/15 bg-slate-900 text-slate-100",
      }}
      {...props}
    />
  );
}

export { Toaster };
