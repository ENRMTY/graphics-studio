import { useRef } from "react";

export function useFileUpload(onLoad: (dataUrl: string, file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onLoad(ev.target.result as string, file);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const inputProps = {
    ref: inputRef,
    type: "file" as const,
    accept: "image/*",
    style: { display: "none" } as React.CSSProperties,
    onChange: handleChange,
  };

  return { open, inputProps };
}
