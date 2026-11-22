import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "./ChatWidget.css";

const GREETING = "Hi! I can help you find products or check on your orders. What are you looking for?";
const SUGGESTIONS = [
  "What do you sell?",
  "Show me products under ₹2000",
  "Where is my latest order?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: "user" | "assistant", content }
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, error, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || sending) return;

    setError("");
    const history = messages.slice(-6); // what the AI should remember
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/api/chat", { message, history });
      setMessages((m) => [...m, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      const status = err.response?.status;
      if (!err.response) {
        setError("Cannot reach the server. Is the backend running?");
      } else if (status === 400) {
        setError("That message could not be sent. Keep it under 500 characters.");
      } else {
        setError(err.response.data?.error || "Something went wrong. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const newChat = () => {
    setMessages([]);
    setError("");
    setInput("");
  };

  return (
    <>
      {open && (
        <section
          className="chat-panel"
          role="dialog"
          aria-label="Shop assistant"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <header className="chat-head">
            <div>
              <strong>Shop assistant</strong>
              <span>Ask about products and your orders</span>
            </div>
            <div className="chat-head-actions">
              {messages.length > 0 && (
                <button onClick={newChat} className="chat-link">New chat</button>
              )}
              <button onClick={() => setOpen(false)} className="chat-close" aria-label="Close chat">
                ✕
              </button>
            </div>
          </header>

          <div className="chat-body" aria-live="polite">
            <div className="chat-msg bot">{GREETING}</div>

            {messages.length === 0 && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} disabled={sending}>{s}</button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === "user" ? "me" : "bot"}`}>
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="chat-msg bot chat-typing" aria-label="The assistant is typing">
                <span /><span /><span />
              </div>
            )}

            {error && <div className="chat-error" role="alert">{error}</div>}
            <div ref={endRef} />
          </div>

          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question"
              aria-label="Type your question"
              maxLength={500}
            />
            <button type="submit" disabled={sending || !input.trim()}>Send</button>
          </form>
          <p className="chat-note">Answers come from the store's data. Check the product page for final details.</p>
        </section>
      )}

      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close shop assistant" : "Open shop assistant"}
        aria-expanded={open}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z" />
        </svg>
      </button>
    </>
  );
}