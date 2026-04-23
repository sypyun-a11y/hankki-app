export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { topic } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: topic
          ? `한국 노년층을 위한 "${topic}" 관련 건강 카드뉴스를 JSON으로만 응답하세요. 다른 말 금지.
{"title":"제목","emoji":"이모지","color":"#hex색상","points":["핵심포인트1(20자이내)","핵심포인트2","핵심포인트3","핵심포인트4","핵심포인트5"],"summary":"한줄요약(30자이내)"}`
          : `한국 노년층을 위한 오늘의 건강 팁 3개를 JSON으로만 응답하세요. 다른 말 금지.
{"tips":[{"emoji":"🫀","title":"팁 제목 15자 이내","tag":"태그","color":"#hex밝은색"},{"emoji":"🦴","title":"팁 제목 15자 이내","tag":"태그","color":"#hex밝은색"},{"emoji":"🧠","title":"팁 제목 15자 이내","tag":"태그","color":"#hex밝은색"}]}`
      }],
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}