const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

export const PHASE_INFO = {
  menstrual:  { label: 'menstrual phase',  desc: 'rest & restore',      color: '#D85A30', bg: '#FAECE7', days: '1–5' },
  follicular: { label: 'follicular phase', desc: 'energy rising',       color: '#185FA5', bg: '#E6F1FB', days: '6–13' },
  ovulation:  { label: 'ovulation phase',  desc: 'peak energy',         color: '#0F6E56', bg: '#E1F5EE', days: '14–16' },
  luteal:     { label: 'luteal phase',     desc: 'slow down & nourish', color: '#533AB7', bg: '#EEEDFE', days: '17–28' },
};

export function getCycleDay(lastPeriodISO) {
  const last = new Date(lastPeriodISO);
  const today = new Date();
  const days = Math.floor((today - last) / 86400000);
  return (days % 28) + 1;
}

export function getPhase(day) {
  if (day <= 5)  return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

export async function callAI(prompt, maxTokens = 600) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );
  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}
