export { FEATURE_FRAGMENT_AI_SUGGESTIONS } from "@/config/features";

export const fragmentDeviceSuggestions = [
  "牛马专用 MacBook 🐮",
  "牛马专用相机 📷",
  "正在疯狂工作的电脑 💻",
  "今天也没关机的 MacBook 💻",
  "随身相机 📷",
  "iPhone 15 Pro Max 📱",
  "拍到没电的手机 🔋",
  "被生活压榨的键盘 ⌨️",
  "还在发热的电脑 🫠",
  "一台努力工作的设备 💻",
] as const;

export const fragmentMoodSuggestions = [
  "想下班😭",
  "郁闷😒",
  "肚子饿了😫",
  "烦躁😡",
  "有点累但还活着🙂",
  "今天也在硬撑🥲",
  "想躺平🫠",
  "心情一般，但还能拍照📷",
  "不想说话😶",
  "安静一点就好🌙",
] as const;

export function randomSuggestion(values: readonly string[], current = "") {
  if (values.length <= 1) return values[0] ?? "";
  const alternatives = values.filter((value) => value !== current);
  return alternatives[Math.floor(Math.random() * alternatives.length)] ?? values[0];
}
