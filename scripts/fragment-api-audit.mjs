const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:8788";

async function request(path, init) {
  const response = await fetch(new URL(path, baseUrl), init);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload.data;
}

const location = await request("/api/admin/location", {
  headers: { "CF-Connecting-IP": "8.8.8.8" },
});
const weather = await request("/api/admin/weather?location=Guangzhou");
const translation = await request("/api/admin/fragments/translate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: "今天也在认真生活。", location: "广州" }),
});

const id = `fragment-audit-${Date.now()}`;
const fragment = await request("/api/admin/fragments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id,
    content: "API audit",
    location: "Guangzhou",
    localized_fields: translation.localized_fields,
    weather_json: weather.weather_json,
    images_json: [],
    camera: "Audit device",
    mood: "Audit mood",
    status: "draft",
    is_public: false,
    translation_locks: {},
  }),
});

if (!fragment.weather_json || !weather.weather_json?.["zh-CN"] || !translation.localized_fields?.["zh-TW"]?.content) {
  throw new Error("Fragment smart API payload is incomplete.");
}

await request(`/api/admin/fragments/${encodeURIComponent(id)}`, { method: "DELETE" });

console.log(JSON.stringify({
  location: location.location_json,
  weather: weather.weather_json,
  translationWarnings: translation.warnings,
  draftSaved: fragment.id === id,
  draftDeleted: true,
}, null, 2));
