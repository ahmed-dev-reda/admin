"use client";

import * as React from "react";
import { cn } from "cn";
import { Upload, X, ImageIcon } from "lucide-react";

type ImageUploadProps = {
  id?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
};

function ImageUpload({
  id,
  value,
  onChange,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const preview = React.useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );
  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const previewUrl = value ? preview : null;

  const handleFile = (file: File | null) => {
    if (disabled) return;
    if (file && !file.type.startsWith("image/")) return;
    onChange?.(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    // Reset so re-selecting the same file triggers onChange
    e.target.value = "";
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFile(null);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      id={id}
      aria-invalid={ariaInvalid}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-input bg-transparent p-6 text-center transition-all outline-none",
        "hover:border-ring/60 hover:bg-muted/30",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        isDragOver && "border-ring bg-muted/40 scale-[1.01]",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        "dark:bg-input/10 dark:hover:bg-input/20",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
      />

      {previewUrl ? (
        <div className="relative w-full">
          <img
            src={previewUrl}
            alt="Product preview"
            className="mx-auto max-h-[200px] rounded-md object-contain"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20 transition-colors hover:bg-destructive/20"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <>
          <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            {isDragOver ? (
              <Upload className="size-5" />
            ) : (
              <ImageIcon className="size-5" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isDragOver ? "Drop your image here" : "Upload product image"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground/70">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export { ImageUpload };
