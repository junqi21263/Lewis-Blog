export type WeatherCopy = {
  "zh-CN": string;
  "zh-TW": string;
  "en-US": string;
};

export function weatherCopyFromCode(code: number): WeatherCopy {
  if (code === 0) return { "zh-CN": "晴 ☀️", "zh-TW": "晴 ☀️", "en-US": "Clear ☀️" };
  if (code === 1 || code === 2) return { "zh-CN": "多云 ☁️", "zh-TW": "多雲 ☁️", "en-US": "Partly cloudy ☁️" };
  if (code === 3) return { "zh-CN": "阴 🌥️", "zh-TW": "陰 🌥️", "en-US": "Overcast 🌥️" };
  if (code === 45 || code === 48) return { "zh-CN": "雾 🌫️", "zh-TW": "霧 🌫️", "en-US": "Fog 🌫️" };
  if (code >= 51 && code <= 57) return { "zh-CN": "小雨 ☔️", "zh-TW": "小雨 ☔️", "en-US": "Drizzle ☔️" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { "zh-CN": "雨 ☔️", "zh-TW": "雨 ☔️", "en-US": "Rain ☔️" };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { "zh-CN": "雪 ❄️", "zh-TW": "雪 ❄️", "en-US": "Snow ❄️" };
  }
  if (code >= 95) return { "zh-CN": "雷阵雨 ⛈️", "zh-TW": "雷陣雨 ⛈️", "en-US": "Thunderstorm ⛈️" };
  return { "zh-CN": "天气暂不可用", "zh-TW": "天氣暫不可用", "en-US": "Weather unavailable" };
}

export const unavailableWeather: WeatherCopy = {
  "zh-CN": "天气暂不可用",
  "zh-TW": "天氣暫不可用",
  "en-US": "Weather unavailable",
};
