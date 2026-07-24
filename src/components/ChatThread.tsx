"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/app/actions/matching";

export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export function ChatThread({
  matchId,
  currentUserId,
  otherName,
  initialMessages,
}: {
  matchId: string;
  currentUserId: string;
  otherName: string;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const body = String(formData.get("body") ?? "");
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await sendMessageAction(matchId, body);
      if (res.error) {
        setError(res.error);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, body, senderId: currentUserId, createdAt: new Date().toISOString() },
      ]);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-rose-100 bg-white">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">
            You matched with {otherName}. Say hello 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="px-4 text-xs text-red-600">{error}</p>}
      <form ref={formRef} action={handleSubmit} className="flex gap-2 border-t border-neutral-100 p-3">
        <input
          name="body"
          placeholder={`Message ${otherName}…`}
          autoComplete="off"
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
