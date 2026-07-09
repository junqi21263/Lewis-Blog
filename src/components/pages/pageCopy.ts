import type { Locale } from "@/i18n/config";

export const pageCopyKeys = ["journal", "gallery", "gear", "films", "about", "fragments"] as const;
export const pageCopyFields = ["eyebrow", "title", "description", "emptyTitle", "emptyDescription"] as const;

export type PageCopyKey = (typeof pageCopyKeys)[number];
export type PageCopyField = (typeof pageCopyFields)[number];
export type PageCopyFields = Record<PageCopyField, string>;
export type PageCopyMode = "auto" | "manual";
export type PageCopyJson = Record<PageCopyKey, Record<Locale, PageCopyFields>> & {
  translationModes: Record<PageCopyKey, Record<Exclude<Locale, "zh-CN">, PageCopyMode>>;
};

const zhCN: Record<PageCopyKey, PageCopyFields> = {
  journal: {
    eyebrow: "文章 · 编辑归档",
    title: "Journal Archive",
    description: "旅行记录、城市观察与影像笔记。",
    emptyTitle: "暂无已发布文章。",
    emptyDescription: "已发布的文章会按时间归档在这里。",
  },
  gallery: {
    eyebrow: "图廊 · 影像归档",
    title: "精选影像。",
    description: "一个以摄影为中心的归档，按地点、时间、城市、国家、相机与镜头组织。",
    emptyTitle: "暂无已发布图片。",
    emptyDescription: "CMS 发布后的图片会显示在这里。",
  },
  gear: {
    eyebrow: "器材 · Field Equipment",
    title: "缓慢观看的工具。",
    description: "用于摄影归档的相机、镜头、声音工具与旅行物件清单。",
    emptyTitle: "暂无器材记录。",
    emptyDescription: "器材记录发布后会显示在这里。",
  },
  films: {
    eyebrow: "影片 · Motion Archive",
    title: "流动的影像。",
    description: "旅行短片、城市观察与缓慢移动的画面。",
    emptyTitle: "暂无已发布影片。",
    emptyDescription: "CMS 发布后的影片会显示在这里。",
  },
  about: {
    eyebrow: "关于 · About",
    title: "关于这份影像档案。",
    description: "记录旅行中的光线、城市与短暂停留。",
    emptyTitle: "暂无关于页面内容。",
    emptyDescription: "请在 CMS 的 About 页面中完善内容。",
  },
  fragments: {
    eyebrow: "碎片 · Daily Notes",
    title: "最近碎片。",
    description: "生活片段、路上观察与未完成的影像笔记。",
    emptyTitle: "暂无碎片记录。",
    emptyDescription: "公开发布的碎片会显示在这里。",
  },
};

const zhTW: Record<PageCopyKey, PageCopyFields> = {
  journal: { eyebrow: "文章 · 編輯歸檔", title: "Journal Archive", description: "旅行記錄、城市觀察與影像筆記。", emptyTitle: "暫無已發佈文章。", emptyDescription: "已發佈的文章會按時間歸檔在這裡。" },
  gallery: { eyebrow: "圖廊 · 影像歸檔", title: "精選影像。", description: "一個以攝影為中心的歸檔，按地點、時間、城市、國家、相機與鏡頭組織。", emptyTitle: "暫無已發佈圖片。", emptyDescription: "CMS 發佈後的圖片會顯示在這裡。" },
  gear: { eyebrow: "器材 · Field Equipment", title: "緩慢觀看的工具。", description: "用於攝影歸檔的相機、鏡頭、聲音工具與旅行物件清單。", emptyTitle: "暫無器材記錄。", emptyDescription: "器材記錄發佈後會顯示在這裡。" },
  films: { eyebrow: "影片 · Motion Archive", title: "流動的影像。", description: "旅行短片、城市觀察與緩慢移動的畫面。", emptyTitle: "暫無已發佈影片。", emptyDescription: "CMS 發佈後的影片會顯示在這裡。" },
  about: { eyebrow: "關於 · About", title: "關於這份影像檔案。", description: "記錄旅行中的光線、城市與短暫停留。", emptyTitle: "暫無關於頁面內容。", emptyDescription: "請在 CMS 的 About 頁面中完善內容。" },
  fragments: { eyebrow: "碎片 · Daily Notes", title: "最近碎片。", description: "生活片段、路上觀察與未完成的影像筆記。", emptyTitle: "暫無碎片記錄。", emptyDescription: "公開發佈的碎片會顯示在這裡。" },
};

const enUS: Record<PageCopyKey, PageCopyFields> = {
  journal: { eyebrow: "Journal · Editorial Archive", title: "Journal Archive", description: "Travel notes, city observations, and photographic essays.", emptyTitle: "No published stories yet.", emptyDescription: "Published stories will be archived here." },
  gallery: { eyebrow: "Gallery · Image Archive", title: "Selected Images.", description: "A photography-led archive organized by place, time, city, country, camera, and lens.", emptyTitle: "No published images yet.", emptyDescription: "Images published through the CMS will appear here." },
  gear: { eyebrow: "Gear · Field Equipment", title: "Tools for looking slowly.", description: "Cameras, lenses, sound tools, and travel objects used across the photographic archive.", emptyTitle: "No gear entries yet.", emptyDescription: "Published equipment notes will appear here." },
  films: { eyebrow: "Films · Motion Archive", title: "Images in motion.", description: "Travel films, city observations, and slowly moving frames.", emptyTitle: "No published films yet.", emptyDescription: "Films published through the CMS will appear here." },
  about: { eyebrow: "About · Archive Notes", title: "About this image archive.", description: "A record of light, cities, and brief pauses while travelling.", emptyTitle: "No About content yet.", emptyDescription: "Complete the About page in the CMS." },
  fragments: { eyebrow: "Fragments · Daily Notes", title: "Recent fragments.", description: "Small moments, roadside observations, and unfinished image notes.", emptyTitle: "No fragments yet.", emptyDescription: "Public fragments will appear here." },
};

export const defaultPageCopyJson: PageCopyJson = {
  journal: { "zh-CN": zhCN.journal, "zh-TW": zhTW.journal, "en-US": enUS.journal },
  gallery: { "zh-CN": zhCN.gallery, "zh-TW": zhTW.gallery, "en-US": enUS.gallery },
  gear: { "zh-CN": zhCN.gear, "zh-TW": zhTW.gear, "en-US": enUS.gear },
  films: { "zh-CN": zhCN.films, "zh-TW": zhTW.films, "en-US": enUS.films },
  about: { "zh-CN": zhCN.about, "zh-TW": zhTW.about, "en-US": enUS.about },
  fragments: { "zh-CN": zhCN.fragments, "zh-TW": zhTW.fragments, "en-US": enUS.fragments },
  translationModes: Object.fromEntries(
    pageCopyKeys.map((key) => [key, { "zh-TW": "auto", "en-US": "auto" }]),
  ) as PageCopyJson["translationModes"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizePageCopyJson(value: unknown): PageCopyJson {
  const source = isRecord(value) ? value : {};
  const rawModes = isRecord(source.translationModes) ? source.translationModes : {};
  const result = structuredClone(defaultPageCopyJson);

  for (const page of pageCopyKeys) {
    const rawPage = isRecord(source[page]) ? source[page] : {};
    for (const locale of ["zh-CN", "zh-TW", "en-US"] as const) {
      const rawLocale = isRecord(rawPage[locale]) ? rawPage[locale] : {};
      for (const field of pageCopyFields) {
        const candidate = rawLocale[field];
        if (typeof candidate === "string" && candidate.trim()) {
          result[page][locale][field] = candidate;
        }
      }
    }
    const pageModes = isRecord(rawModes[page]) ? rawModes[page] : {};
    result.translationModes[page]["zh-TW"] = pageModes["zh-TW"] === "manual" ? "manual" : "auto";
    result.translationModes[page]["en-US"] = pageModes["en-US"] === "manual" ? "manual" : "auto";
  }

  return result;
}

export function resolvePageCopy(value: unknown, page: PageCopyKey, locale: Locale): PageCopyFields {
  const copy = normalizePageCopyJson(value);
  return {
    ...copy[page]["zh-CN"],
    ...copy[page]["en-US"],
    ...copy[page][locale],
  };
}
