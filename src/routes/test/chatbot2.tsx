import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
export const Route = createFileRoute('/test/chatbot2')({
  component: Chat,
})



export function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading, stop,error } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
    threadId: "support-chat",
  });

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) =>
            part.type === "text" ? <p key={index}>{part.content}</p> : null,
          )}
        </div>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (input.trim() === "") {
            return;
          }
          sendMessage(input);
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        {isLoading ? (
          <button type="button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit">Send</button>
        )}
      </form>
      <div>{error?.name}{ error?.message}</div>
    </>
  );
}
