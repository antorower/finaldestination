"use client";
import { useState } from "react";

export default function AssistantChat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse("");

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Στην απάντηση σου μην βάλεις σύμβολα, αστεράκια και λοιπά. Plain text. Ούτε reference από αρχεία. Απάντα αυστηρά βάσει του αρχείου Οδηγίες Ομάδας. Αν η ερώτηση δεν είναι σχετική με το αρχέιο Οδηγίες Ομάδας ή δεν υπάρχει σαφής απάντηση στο αρχείο Οδηγίες Ομάδας τότε απάντα ότι δεν μπορείς να βοηθήσεις σε αυτό. Αυτή είναι η ερώτηση: + ${message}` }),
    });

    const data = await res.json();
    setResponse(data.reply);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <textarea className="w-full p-2 border rounded" rows={4} placeholder="Γράψε την ερώτησή σου..." value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" onClick={sendMessage} disabled={loading}>
        {loading ? "Αποστολή..." : "Αποστολή"}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <strong>Απάντηση:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
