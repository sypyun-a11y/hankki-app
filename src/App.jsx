import { useState } from "react";

const COLORS = {
  bg: "#F7F4EF",
  card: "#FFFFFF",
  primary: "#2E6DA4",
  teal: "#4BA89A",
  accent: "#F0A04B",
  text: "#1A2E3B",
  sub: "#7A95A8",
  border: "#E4EDF5",
  lightBlue: "#EBF3FB",
};

const FONT = "-apple-system, 'Helvetica Neue', Arial, sans-serif";
const days = ["월", "화", "수", "목", "금", "토", "일"];
const mealLabels = ["아침 🌅", "점심 ☀️", "저녁 🌙"];
const newsItems = [
  { emoji: "🫀", title: "노년기 심장 건강엔 등푸른 생선", tag: "심장건강" },
  { emoji: "🦴", title: "칼슘 흡수 돕는 비타민D 식품 TOP5", tag: "뼈건강" },
  { emoji: "🧠", title: "치매 예방에 좋은 식습관 7가지", tag: "뇌건강" },
];
const stampData = [true, true, true, false, false, false, false];
const activityLevels = [
  { label: "거의 안 움직여요", value: 1.2 },
  { label: "가끔 산책해요", value: 1.375 },
  { label: "꽤 활동적이에요", value: 1.55 },
];

function calcBMR({ age, gender, height, weight, activity }) {
  const base = gender === "male"
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  return Math.round(base * activity);
}

async function generateDiet({ age, gender, height, weight, activity, bmr }) {
  const genderLabel = gender === "male" ? "남성" : "여성";
  const activityLabel = activityLevels.find(a => a.value === activity)?.label || "";

  const prompt = `당신은 한국 노년층 영양 전문가입니다. 아래 정보를 바탕으로 이번 주 7일치 한식 맞춤 식단을 만들어주세요.

사용자 정보:
- 성별: ${genderLabel}
- 나이: ${age}세
- 키: ${height}cm
- 체중: ${weight}kg
- 활동량: ${activityLabel}
- 하루 권장 칼로리: ${bmr}kcal

조건:
- 한식 위주로 구성 (현미밥, 잡곡밥, 된장국, 나물, 생선 등)
- 노년층에 적합하게 소화가 잘 되는 음식
- 아침/점심/저녁 3끼 구성
- 각 끼니마다 칼로리 포함
- 각 끼니마다 주요 식재료 2~4개 포함

반드시 아래 JSON 형식으로만 응답하세요. 다른 말은 하지 마세요:
{
  "days": [
    {
      "meals": [
        { "name": "메뉴 이름", "kcal": 숫자, "ingredients": ["재료1", "재료2"] },
        { "name": "메뉴 이름", "kcal": 숫자, "ingredients": ["재료1", "재료2"] },
        { "name": "메뉴 이름", "kcal": 숫자, "ingredients": ["재료1", "재료2"] }
      ]
    }
  ]
}
days 배열은 정확히 7개여야 합니다.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function Onboarding({ onComplete }) {
  const [form, setForm] = useState({ age: "", gender: "female", height: "", weight: "", activity: 1.375 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const valid = form.age && form.height && form.weight;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const bmr = calcBMR(form);
      const result = await generateDiet({ ...form, bmr });
      onComplete({ userInfo: { ...form, bmr }, weeklyMenus: result.days });
    } catch (e) {
      setError("식단 생성 중 오류가 발생했어요. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: FONT, background: COLORS.bg, minHeight: "100vh", maxWidth: 390, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ background: `linear-gradient(160deg, ${COLORS.primary}, ${COLORS.teal})`, padding: "52px 20px 32px", color: "#fff" }}>
        <p style={{ margin: 0, fontSize: 15, opacity: 0.8 }}>맞춤 식단을 만들기 위해</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>기본 정보를 알려주세요 🍚</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, opacity: 0.75 }}>입력하신 정보로 AI가 식단을 설계해드려요</p>
      </div>

      <div style={{ padding: "0 16px", marginTop: -16 }}>
        <div style={{ background: COLORS.card, borderRadius: 20, padding: "24px 20px", boxShadow: "0 4px 20px rgba(46,109,164,0.10)" }}>
          <label style={labelSt}>성별</label>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {[{ v: "female", l: "여성 👩" }, { v: "male", l: "남성 👨" }].map(({ v, l }) => (
              <button key={v} onClick={() => setForm({ ...form, gender: v })}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `2px solid ${form.gender === v ? COLORS.primary : COLORS.border}`, background: form.gender === v ? COLORS.lightBlue : "#fff", color: form.gender === v ? COLORS.primary : COLORS.sub, fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: FONT, transition: "all 0.2s" }}>
                {l}
              </button>
            ))}
          </div>

          <label style={labelSt}>나이</label>
          <input style={inputSt} type="number" placeholder="예) 68" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />

          <label style={labelSt}>키 (cm)</label>
          <input style={inputSt} type="number" placeholder="예) 162" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />

          <label style={labelSt}>체중 (kg)</label>
          <input style={inputSt} type="number" placeholder="예) 58" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />

          <label style={labelSt}>활동량</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {activityLevels.map(({ label, value }) => (
              <button key={value} onClick={() => setForm({ ...form, activity: value })}
                style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${form.activity === value ? COLORS.primary : COLORS.border}`, background: form.activity === value ? COLORS.lightBlue : "#fff", color: form.activity === value ? COLORS.primary : COLORS.sub, fontWeight: form.activity === value ? 700 : 400, cursor: "pointer", fontSize: 15, textAlign: "left", fontFamily: FONT, transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>

          {error && <p style={{ color: "#E05252", fontSize: 14, marginBottom: 12, textAlign: "center" }}>{error}</p>}

          <button onClick={handleSubmit} disabled={!valid || loading}
            style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: valid && !loading ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.teal})` : COLORS.border, color: valid && !loading ? "#fff" : COLORS.sub, fontSize: 16, fontWeight: 700, fontFamily: FONT, cursor: valid && !loading ? "pointer" : "not-allowed", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.4)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                AI가 식단을 만들고 있어요...
              </>
            ) : "내 맞춤 식단 받기 →"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MainApp({ userInfo, weeklyMenus, onReset }) {
  const [tab, setTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState(0);
  const [todayLog, setTodayLog] = useState({ 아침: false, 점심: false, 저녁: false });
  const [stamps] = useState(stampData);
  const [weight] = useState([62, 61.8, 61.5, 61.7, 61.3, 61.0, 60.8]);
  const [shared, setShared] = useState(false);

  const allChecked = Object.values(todayLog).every(Boolean);
  const checkedCount = Object.values(todayLog).filter(Boolean).length;
  const todayMenu = weeklyMenus[0];
  const allIngredients = [...new Set(weeklyMenus[selectedDay]?.meals?.flatMap(m => m.ingredients) || [])];

  const tabs = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "diet", label: "식단", icon: "🥗" },
    { id: "cart", label: "장바구니", icon: "🛒" },
    { id: "health", label: "건강", icon: "📊" },
  ];

  return (
    <div style={{ fontFamily: FONT, background: COLORS.bg, minHeight: "100vh", maxWidth: 390, margin: "0 auto", paddingBottom: 80 }}>

      {tab === "home" && (
        <div>
          <div style={{ background: `linear-gradient(160deg, ${COLORS.primary}, ${COLORS.teal})`, padding: "48px 20px 28px", color: "#fff" }}>
            <p style={{ margin: 0, fontSize: 15, opacity: 0.8 }}>2026년 4월 22일 화요일</p>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>한 끼 챙김 🍚</h1>
            <p style={{ margin: "6px 0 0", fontSize: 15, opacity: 0.75 }}>권장 칼로리 <strong>{userInfo.bmr.toLocaleString()}kcal</strong> · 오늘도 잘 드세요!</p>
          </div>

          <div style={{ padding: "0 16px", marginTop: -16 }}>
            <div style={{ background: COLORS.card, borderRadius: 18, padding: "18px 16px", boxShadow: "0 4px 16px rgba(46,109,164,0.11)", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.sub, fontWeight: 600 }}>이번 주 챙김 기록</p>
                  <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: COLORS.primary }}>🔥 3일 연속 달성!</p>
                </div>
                <span style={{ fontSize: 32 }}>🏅</span>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                {days.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: stamps[i] ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.teal})` : COLORS.lightBlue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: stamps[i] ? "0 2px 8px rgba(46,109,164,0.3)" : "none", transition: "all 0.3s" }}>
                      <span style={{ fontSize: stamps[i] ? 18 : 12, color: stamps[i] ? "#fff" : COLORS.border }}>{stamps[i] ? "🍚" : "·"}</span>
                    </div>
                    <span style={{ fontSize: 11, color: i === 2 ? COLORS.primary : COLORS.sub, fontWeight: i === 2 ? 700 : 400 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div onClick={() => setTab("diet")} style={{ background: COLORS.card, borderRadius: 16, padding: "16px 14px", boxShadow: "0 2px 12px rgba(46,109,164,0.10)", cursor: "pointer" }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: COLORS.sub, fontWeight: 600 }}>오늘의 식단</p>
                {todayMenu?.meals?.map((m, i) => (
                  <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: COLORS.text, lineHeight: 1.4 }}>{mealLabels[i]}<br /><span style={{ color: COLORS.sub, fontSize: 12 }}>{m.name.split(" + ")[0]}</span></p>
                ))}
                <p style={{ margin: "8px 0 0", fontSize: 13, color: COLORS.primary, fontWeight: 600 }}>자세히 보기 →</p>
              </div>

              <div style={{ background: COLORS.card, borderRadius: 16, padding: "16px 14px", boxShadow: "0 2px 12px rgba(46,109,164,0.10)" }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.sub, fontWeight: 600 }}>오늘 먹은 기록</p>
                {Object.keys(todayLog).map(meal => (
                  <div key={meal} onClick={() => setTodayLog(p => ({ ...p, [meal]: !p[meal] }))}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${todayLog[meal] ? COLORS.teal : COLORS.border}`, background: todayLog[meal] ? COLORS.teal : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      {todayLog[meal] && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 14, color: todayLog[meal] ? COLORS.text : COLORS.sub }}>{meal}</span>
                  </div>
                ))}
                <p style={{ margin: "4px 0 0", fontSize: 13, color: allChecked ? COLORS.primary : COLORS.teal, fontWeight: 600 }}>
                  {allChecked ? "🎉 오늘 완료!" : `${checkedCount}/3 완료`}
                </p>
              </div>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 16, padding: "16px", boxShadow: "0 2px 12px rgba(46,109,164,0.08)", marginBottom: 12 }}>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.sub, fontWeight: 600 }}>건강 뉴스 📰</p>
              {newsItems.map((n, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: i < newsItems.length - 1 ? 12 : 0, borderBottom: i < newsItems.length - 1 ? `1px solid ${COLORS.border}` : "none", marginBottom: i < newsItems.length - 1 ? 12 : 0 }}>
                  <span style={{ fontSize: 26 }}>{n.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 15, color: COLORS.text, fontWeight: 500, lineHeight: 1.4 }}>{n.title}</p>
                    <span style={{ fontSize: 12, color: COLORS.primary, background: COLORS.lightBlue, padding: "2px 8px", borderRadius: 20, marginTop: 4, display: "inline-block" }}>{n.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            <div onClick={() => setTab("health")} style={{ background: `linear-gradient(135deg, ${COLORS.lightBlue}, #E8F5F2)`, borderRadius: 16, padding: "16px", cursor: "pointer", boxShadow: "0 2px 12px rgba(46,109,164,0.07)", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.sub, fontWeight: 600 }}>이번 주 체중 변화</p>
                  <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, color: COLORS.primary }}>−1.2kg <span style={{ fontSize: 15, color: COLORS.teal }}>↓ 좋아요!</span></p>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
                  {weight.map((w, i) => (
                    <div key={i} style={{ width: 8, borderRadius: 4, background: i === weight.length - 1 ? COLORS.primary : COLORS.border, height: `${((w - 60) / 3) * 100}%`, minHeight: 8 }} />
                  ))}
                </div>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: COLORS.primary, fontWeight: 600 }}>자세한 기록 보기 →</p>
            </div>

            <button onClick={onReset} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.sub, fontSize: 14, fontWeight: 600, fontFamily: FONT, cursor: "pointer", marginBottom: 8 }}>
              ⚙️ 내 정보 다시 입력하기
            </button>
          </div>
        </div>
      )}

      {tab === "diet" && (
        <div style={{ padding: "52px 16px 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: "0 0 16px" }}>이번 주 식단 🥗</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {days.map((d, i) => (
              <button key={i} onClick={() => setSelectedDay(i)}
                style={{ minWidth: 44, height: 44, borderRadius: 12, border: "none", background: selectedDay === i ? COLORS.primary : COLORS.card, color: selectedDay === i ? "#fff" : COLORS.sub, fontFamily: FONT, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: selectedDay === i ? "0 2px 8px rgba(46,109,164,0.3)" : "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
                {d}
              </button>
            ))}
          </div>
          {weeklyMenus[selectedDay]?.meals?.map((meal, i) => (
            <div key={i} style={{ background: COLORS.card, borderRadius: 16, padding: "18px", marginBottom: 12, boxShadow: "0 2px 12px rgba(46,109,164,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{mealLabels[i]}</span>
                <span style={{ fontSize: 14, color: COLORS.teal, fontWeight: 600, background: "#E8F5F2", padding: "4px 12px", borderRadius: 20 }}>{meal.kcal} kcal</span>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 15, color: COLORS.sub, lineHeight: 1.6 }}>{meal.name}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {meal.ingredients?.map(ing => (
                  <span key={ing} style={{ fontSize: 12, color: COLORS.primary, background: COLORS.lightBlue, padding: "3px 9px", borderRadius: 20 }}>{ing}</span>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setTab("cart")} style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.teal})`, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: FONT, cursor: "pointer", marginTop: 4 }}>
            🛒 장바구니로 공유하기
          </button>
        </div>
      )}

      {tab === "cart" && (
        <div style={{ padding: "52px 16px 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: "0 0 4px" }}>장바구니 🛒</h2>
          <p style={{ fontSize: 15, color: COLORS.sub, margin: "0 0 20px" }}>{days[selectedDay]}요일 식단 재료예요</p>
          {allIngredients.map(ing => (
            <div key={ing} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 16, color: COLORS.text }}>🛒 {ing}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ fontSize: 13, padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.accent}`, background: "#FFF8EE", color: "#C97A10", fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>쿠팡</button>
                <button style={{ fontSize: 13, padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${COLORS.teal}`, background: "#E8F5F2", color: "#2A9D8F", fontWeight: 600, fontFamily: FONT, cursor: "pointer" }}>컬리</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 24 }}>
            <div style={{ background: COLORS.lightBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, color: COLORS.sub, fontWeight: 600 }}>공유할 내용 미리보기</p>
              <p style={{ margin: 0, fontSize: 15, color: COLORS.text }}>📋 이번 주 식단표 + 🛒 장바구니 링크</p>
            </div>
            <button onClick={() => setShared(v => !v)} style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: shared ? "#E8F5F2" : "#FEE500", color: shared ? COLORS.teal : "#3A1D1D", fontSize: 16, fontWeight: 700, fontFamily: FONT, cursor: "pointer", transition: "all 0.3s" }}>
              {shared ? "✅ 자녀에게 카톡 공유 완료!" : "💬 자녀에게 카톡으로 공유하기"}
            </button>
          </div>
        </div>
      )}

      {tab === "health" && (
        <div style={{ padding: "52px 16px 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: "0 0 20px" }}>건강 수치 📊</h2>
          <div style={{ background: COLORS.card, borderRadius: 16, padding: "18px", marginBottom: 12, boxShadow: "0 2px 12px rgba(46,109,164,0.08)" }}>
            <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: COLORS.sub }}>이번 주 체중 (kg)</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {weight.map((w, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: COLORS.sub }}>{w}</span>
                  <div style={{ width: "100%", borderRadius: 6, background: i === weight.length - 1 ? COLORS.primary : COLORS.border, height: `${((w - 60) / 3) * 60}px`, minHeight: 8 }} />
                  <span style={{ fontSize: 11, color: COLORS.sub }}>{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "권장 칼로리", value: userInfo.bmr.toLocaleString(), unit: "kcal", color: COLORS.primary },
              { label: "단백질 목표", value: Math.round(userInfo.weight * 1.2), unit: "g", color: COLORS.teal },
              { label: "오늘 섭취", value: "1,290", unit: "kcal", color: COLORS.accent },
              { label: "수분 섭취", value: "1.2", unit: "L", color: "#7BBFAD" }
            ].map(({ label, value, unit, color }) => (
              <div key={label} style={{ background: COLORS.card, borderRadius: 16, padding: "16px", boxShadow: "0 2px 12px rgba(46,109,164,0.07)" }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: COLORS.sub, fontWeight: 600 }}>{label}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{value}<span style={{ fontSize: 13, fontWeight: 400, color: COLORS.sub }}> {unit}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: "#fff", borderTop: `1px solid ${COLORS.border}`, display: "flex", padding: "8px 0 20px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", fontFamily: FONT }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 12, color: tab === t.id ? COLORS.primary : COLORS.sub, fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, #2E6DA4, #4BA89A)`, display: "flex", justifyContent: "center" }}>
      {!appState
        ? <Onboarding onComplete={(data) => setAppState(data)} />
        : <MainApp userInfo={appState.userInfo} weeklyMenus={appState.weeklyMenus} onReset={() => setAppState(null)} />
      }
    </div>
  );
}

const labelSt = { display: "block", fontSize: 14, color: COLORS.sub, fontWeight: 600, marginBottom: 8 };
const inputSt = { width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontSize: 16, color: COLORS.text, marginBottom: 20, outline: "none", boxSizing: "border-box", background: "#FAFCFF", fontFamily: FONT };