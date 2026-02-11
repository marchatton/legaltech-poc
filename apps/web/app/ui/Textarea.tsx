import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "./cn";
import { type FieldSize, fieldClassName } from "./Input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  uiSize?: FieldSize;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, uiSize, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={fieldClassName({
          uiSize,
          className: cn("min-h-[100px] resize-vertical py-2.5", className),
        })}
        {...props}
      />
    );
  },
);
