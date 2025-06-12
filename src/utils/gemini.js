export const analyzeDecision = async (prompt) => {
  const geminiPrompt = `
Given the decision: "${prompt}", 
list 3-5 pros (with weights 1-5), 3-5 cons (with weights 1-5), and provide a final verdict.
Format strictly as JSON like:
{
  "pros": [{ "point": "", "weight": 3 }],
  "cons": [{ "point": "", "weight": 2 }],
  "verdict": ""
}
`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: geminiPrompt }] }],
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const json = text.slice(jsonStart, jsonEnd + 1);

    return JSON.parse(json);
  } catch (err) {
    console.error("Gemini error:", err);
    return null;
  }
};
