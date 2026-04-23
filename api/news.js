export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: '한국 노년층을 위한 오늘의 건강 팁 3개를 JSON으로만 응답하세요. 다른 말 금지.\n{"tips":[{"emoji":"🫀","title":"팁 제목 15자 이내","tag":"태그"},{"emoji":"🦴","title":"팁 제목 15자 이내","tag":"태그"},{"emoji":"🧠","title":"팁 제목 15자 이내","tag":"태그"}]}'
      }],
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
