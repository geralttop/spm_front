"use client";

import { useState } from "react";
import { MessengerComposer } from "@/shared/ui";

export function ConversationComposer({
  onSendMessage,
  sending,
  placeholder,
  sendAriaLabel,
}: {
  onSendMessage: (text: string) => void;
  sending: boolean;
  placeholder: string;
  sendAriaLabel: string;
}) {
  const [text, setText] = useState("");
  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSendMessage(trimmed);
    setText("");
  };
  return (
    <MessengerComposer
      value={text}
      onChange={setText}
      onSend={submit}
      placeholder={placeholder}
      sendAriaLabel={sendAriaLabel}
      sending={sending}
      disabled={sending}
    />
  );
}
