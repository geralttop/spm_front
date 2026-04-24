"use client";
import TextareaAutosize from "react-textarea-autosize";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
export interface MessengerComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    placeholder: string;
    sendAriaLabel: string;
    disabled?: boolean;
    sending?: boolean;
    maxLength?: number;
    className?: string;
}
export function MessengerComposer({ value, onChange, onSend, placeholder, sendAriaLabel, disabled = false, sending = false, maxLength = 2000, className, }: MessengerComposerProps) {
    const canSend = !disabled && !sending && value.trim().length > 0;
    return (<div className={cn("flex w-full min-w-0 items-end gap-2 sm:gap-3", className)}>
      <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-[1.375rem] border border-border bg-card px-3 py-2 shadow-sm">
        <TextareaAutosize value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} minRows={1} maxRows={7} className={cn("w-full resize-none bg-transparent py-0 text-sm leading-5 text-text-main", "placeholder:text-text-muted focus:outline-none", "sm:text-[15px] sm:leading-5")} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend)
                    onSend();
            }
        }}/>
      </div>
      <button type="button" aria-label={sendAriaLabel} disabled={!canSend} onClick={() => {
            if (canSend)
                onSend();
        }} className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground", "transition-opacity hover:opacity-90", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", "disabled:pointer-events-none disabled:opacity-40")}>
        {sending ? (<Loader2 className="h-5 w-5 animate-spin" aria-hidden/>) : (<Send className="h-5 w-5" aria-hidden/>)}
      </button>
    </div>);
}
