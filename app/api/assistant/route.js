export async function POST(req) {
  try {
    const { message } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID;

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    };

    // 1. Δημιουργία νέου thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers,
    });
    const thread = await threadRes.json();

    // 2. Αποστολή μηνύματος στο thread
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    });

    // 3. Εκκίνηση assistant run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });
    const run = await runRes.json();

    // 4. Poll μέχρι να ολοκληρωθεί το run
    let status = "in_progress";
    let retries = 0;
    const maxRetries = 10;

    while ((status === "in_progress" || status === "queued") && retries < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers,
      });
      const statusData = await statusRes.json();
      status = statusData.status;
      retries++;
    }

    // 5. Λήψη απάντησης από το thread
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers,
    });
    const messages = await messagesRes.json();

    // Logging για debugging (προαιρετικό)
    console.log("Messages response:", messages);

    const reply = Array.isArray(messages.data) ? messages.data.find((m) => m.role === "assistant") : null;

    return Response.json({
      reply: reply?.content?.[0]?.text?.value || "⚠️ Δεν βρέθηκε απάντηση από τον Assistant.",
    });
  } catch (error) {
    console.error("Assistant error:", error);
    return Response.json({ reply: "⚠️ Προέκυψε σφάλμα κατά την επικοινωνία με τον Assistant." }, { status: 500 });
  }
}
