import type { Locale } from "@/i18n/config";

export type Dictionary = {
  localeLabelShort: string;
  nav: {
    home: string;
    journal: string;
    gallery: string;
    gear: string;
    films: string;
    about: string;
  };
  common: {
    readMore: string;
    published: string;
    draft: string;
    empty: string;
    backToJournal: string;
    noPublishedEntries: string;
    searchTitle: string;
    searchSubtitle: string;
    searchPlaceholder: string;
    searchEmpty: string;
    searchHint: string;
    searching: string;
    clearFilters: string;
    tags: string;
    words: string;
    readingTime: string;
    preview: string;
    relatedArticles: string;
    previousArticle: string;
    nextArticle: string;
    entryUnavailable: string;
    entryUnavailableDescription: string;
    returnHome: string;
  };
  home: {
    eyebrow: string;
    title: string;
    latestEyebrow: string;
    latestTitle: string;
    latestLink: string;
    galleryEyebrow: string;
    galleryTitle: string;
    galleryDescription: string;
    filmsEyebrow: string;
    filmsTitle: string;
    filmsLink: string;
    archiveEyebrow: string;
    archiveTitle: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  journal: {
    eyebrow: string;
    title: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  films: {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  gear: {
    eyebrow: string;
    title: string;
    description: string;
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    sectionEyebrow: string;
    sectionTitle: string;
    paragraphOne: string;
    paragraphTwo: string;
    readJournal: string;
  };
  footer: {
    description: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    journalLink: string;
    homeLink: string;
  };
  seo: {
    siteTitle: string;
    siteDescription: string;
    journalTitle: string;
    journalDescription: string;
    galleryTitle: string;
    galleryDescription: string;
    filmsTitle: string;
    filmsDescription: string;
    gearTitle: string;
    gearDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    rssDescription: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  "zh-CN": {
    localeLabelShort: "简",
    nav: { home: "首页", journal: "Journal", gallery: "Gallery", gear: "Gear", films: "Films", about: "About" },
    common: {
      readMore: "继续阅读",
      published: "已发布",
      draft: "草稿",
      empty: "暂无内容",
      backToJournal: "返回 Journal",
      noPublishedEntries: "暂无已发布内容。",
      searchTitle: "搜索归档",
      searchSubtitle: "查找文章、影像或影片。",
      searchPlaceholder: "搜索标题、正文、分类或标签...",
      searchEmpty: "没有匹配结果。",
      searchHint: "试试分类、地点、标签或标题。",
      searching: "搜索中...",
      clearFilters: "清除筛选",
      tags: "标签",
      words: "字数",
      readingTime: "阅读时间",
      preview: "预览",
      relatedArticles: "相关文章",
      previousArticle: "上一篇",
      nextArticle: "下一篇",
      entryUnavailable: "内容暂不可用。",
      entryUnavailableDescription: "这篇文章尚未发布，或当前无法加载。",
      returnHome: "返回首页",
    },
    home: {
      eyebrow: "Noah. Studio - Personal Journal",
      title: "关于北方道路、房间与影像的安静笔记。",
      latestEyebrow: "Latest Journal",
      latestTitle: "最新文章",
      latestLink: "查看全部文章",
      galleryEyebrow: "Image Index",
      galleryTitle: "精选影像",
      galleryDescription: "收录风景、室内与灰阶肌理的摄影归档。",
      filmsEyebrow: "Films / Videos",
      filmsTitle: "动态笔记",
      filmsLink: "查看影片归档",
      archiveEyebrow: "Archive",
      archiveTitle: "字段索引",
      emptyTitle: "暂无已发布文章。",
      emptyDescription: "CMS 发布后的内容会显示在这里。",
    },
    journal: {
      eyebrow: "Journal - Blog",
      title: "文章、田野笔记与视觉研究。",
      emptyTitle: "暂无已发布内容。",
      emptyDescription: "CMS 发布后的文章会显示在这里。",
    },
    gallery: {
      eyebrow: "Gallery - Image Archive",
      title: "精选影像。",
      description: "一个以摄影为中心的归档，按地点、时间、城市、国家、相机与镜头组织。",
      emptyTitle: "暂无已发布图片。",
      emptyDescription: "CMS 发布后的图片会显示在这里。",
    },
    films: {
      eyebrow: "Films / Videos",
      title: "动态笔记。",
      description: "短篇影像随笔与氛围研究。每张卡片都可打开内联播放器。",
      emptyTitle: "暂无已发布视频。",
      emptyDescription: "CMS 发布后的影片会显示在这里。",
    },
    gear: {
      eyebrow: "Gear - Field Equipment",
      title: "缓慢观看的工具。",
      description: "用于摄影归档的相机、镜头、声音工具与旅行物件清单。",
    },
    about: {
      eyebrow: "About - Noah. Studio",
      title: "一个关于克制影像与缓慢写作的个人归档。",
      description: "Noah. Studio 是一个关于旅行、摄影、建筑与影像的私人编辑档案，气质安静、克制，并为后续真实写作预留空间。",
      sectionEyebrow: "Working Notes",
      sectionTitle: "实践",
      paragraphOne: "网站围绕可持续的编辑原语组织：文章、影像与影片。文本目前刻意保持简洁，便于后续替换而不破坏界面结构。",
      paragraphTwo: "视觉系统偏好高对比、大留白、serif 标题、mono 标签，以及以图像为中心的叙事方式。它的目标是承载个人作品，而不是制造装饰感。",
      readJournal: "阅读 Journal",
    },
    footer: {
      description: "关于旅行、摄影、影像与安静设计系统的编辑笔记。",
    },
    notFound: {
      eyebrow: "404 - 页面缺失",
      title: "这个页面已经从归档中漂移。",
      description: "你要找的文章、图片或影片当前不在这个地址。",
      journalLink: "返回 Journal",
      homeLink: "返回首页",
    },
    seo: {
      siteTitle: "Noah. Studio Journal",
      siteDescription: "一个北欧杂志风的个人创作平台，关于旅行、摄影、影片与长文写作。",
      journalTitle: "Journal",
      journalDescription: "Noah. Studio 的文章、田野笔记与视觉研究。",
      galleryTitle: "Gallery",
      galleryDescription: "Noah. Studio 的摄影归档与精选影像。",
      filmsTitle: "Films",
      filmsDescription: "Noah. Studio 的短篇影片与动态笔记。",
      gearTitle: "Gear",
      gearDescription: "Noah. Studio 使用的相机、镜头与随身设备。",
      aboutTitle: "About",
      aboutDescription: "关于 Noah. Studio 的创作方法、视觉系统与归档理念。",
      rssDescription: "Noah. Studio Journal 最新发布内容。",
    },
  },
  "zh-TW": {
    localeLabelShort: "繁",
    nav: { home: "首頁", journal: "Journal", gallery: "Gallery", gear: "Gear", films: "Films", about: "About" },
    common: {
      readMore: "繼續閱讀",
      published: "已發佈",
      draft: "草稿",
      empty: "暫無內容",
      backToJournal: "返回 Journal",
      noPublishedEntries: "暫無已發佈內容。",
      searchTitle: "搜尋歸檔",
      searchSubtitle: "查找文章、影像或影片。",
      searchPlaceholder: "搜尋標題、全文、分類或標籤...",
      searchEmpty: "沒有符合結果。",
      searchHint: "試試分類、地點、標籤或標題。",
      searching: "搜尋中...",
      clearFilters: "清除篩選",
      tags: "標籤",
      words: "字數",
      readingTime: "閱讀時間",
      preview: "預覽",
      relatedArticles: "相關文章",
      previousArticle: "上一篇",
      nextArticle: "下一篇",
      entryUnavailable: "內容暫不可用。",
      entryUnavailableDescription: "這篇文章尚未發佈，或目前無法載入。",
      returnHome: "返回首頁",
    },
    home: {
      eyebrow: "Noah. Studio - Personal Journal",
      title: "關於北方道路、房間與影像的安靜筆記。",
      latestEyebrow: "Latest Journal",
      latestTitle: "最新文章",
      latestLink: "查看全部文章",
      galleryEyebrow: "Image Index",
      galleryTitle: "精選影像",
      galleryDescription: "收錄風景、室內與灰階肌理的攝影歸檔。",
      filmsEyebrow: "Films / Videos",
      filmsTitle: "動態筆記",
      filmsLink: "查看影片歸檔",
      archiveEyebrow: "Archive",
      archiveTitle: "欄位索引",
      emptyTitle: "暫無已發佈文章。",
      emptyDescription: "CMS 發佈後的內容會顯示在這裡。",
    },
    journal: {
      eyebrow: "Journal - Blog",
      title: "文章、田野筆記與視覺研究。",
      emptyTitle: "暫無已發佈內容。",
      emptyDescription: "CMS 發佈後的文章會顯示在這裡。",
    },
    gallery: {
      eyebrow: "Gallery - Image Archive",
      title: "精選影像。",
      description: "一個以攝影為核心的歸檔，依地點、時間、城市、國家、相機與鏡頭整理。",
      emptyTitle: "暫無已發佈圖片。",
      emptyDescription: "CMS 發佈後的圖片會顯示在這裡。",
    },
    films: {
      eyebrow: "Films / Videos",
      title: "動態筆記。",
      description: "短篇影像隨筆與氛圍研究。每張卡片都可開啟內嵌播放器。",
      emptyTitle: "暫無已發佈影片。",
      emptyDescription: "CMS 發佈後的影片會顯示在這裡。",
    },
    gear: {
      eyebrow: "Gear - Field Equipment",
      title: "緩慢觀看的工具。",
      description: "用於攝影歸檔的相機、鏡頭、聲音工具與旅行物件清單。",
    },
    about: {
      eyebrow: "About - Noah. Studio",
      title: "一個關於克制影像與緩慢寫作的個人歸檔。",
      description: "Noah. Studio 是一個關於旅行、攝影、建築與影像的私人編輯檔案，氣質安靜、克制，並為後續真實寫作保留空間。",
      sectionEyebrow: "Working Notes",
      sectionTitle: "實踐",
      paragraphOne: "網站圍繞可持續的編輯原語組織：文章、影像與影片。文本目前刻意保持簡潔，便於之後替換而不破壞介面結構。",
      paragraphTwo: "視覺系統偏好高對比、大留白、serif 標題、mono 標籤，以及以圖像為中心的敘事方式。它的目標是承載個人作品，而非製造裝飾感。",
      readJournal: "閱讀 Journal",
    },
    footer: {
      description: "關於旅行、攝影、影像與安靜設計系統的編輯筆記。",
    },
    notFound: {
      eyebrow: "404 - 頁面缺失",
      title: "這個頁面已經從歸檔中漂移。",
      description: "你要找的文章、圖片或影片目前不在這個位址。",
      journalLink: "返回 Journal",
      homeLink: "返回首頁",
    },
    seo: {
      siteTitle: "Noah. Studio Journal",
      siteDescription: "一個北歐雜誌風的個人創作平台，關於旅行、攝影、影片與長文寫作。",
      journalTitle: "Journal",
      journalDescription: "Noah. Studio 的文章、田野筆記與視覺研究。",
      galleryTitle: "Gallery",
      galleryDescription: "Noah. Studio 的攝影歸檔與精選影像。",
      filmsTitle: "Films",
      filmsDescription: "Noah. Studio 的短篇影片與動態筆記。",
      gearTitle: "Gear",
      gearDescription: "Noah. Studio 使用的相機、鏡頭與隨身設備。",
      aboutTitle: "About",
      aboutDescription: "關於 Noah. Studio 的創作方法、視覺系統與歸檔理念。",
      rssDescription: "Noah. Studio Journal 最新發佈內容。",
    },
  },
  "en-US": {
    localeLabelShort: "EN",
    nav: { home: "Home", journal: "Journal", gallery: "Gallery", gear: "Gear", films: "Films", about: "About" },
    common: {
      readMore: "Read more",
      published: "Published",
      draft: "Draft",
      empty: "No content yet",
      backToJournal: "Back to journal",
      noPublishedEntries: "No published entries.",
      searchTitle: "Command Search",
      searchSubtitle: "Find a note, frame, or film.",
      searchPlaceholder: "Search titles, full text, categories, or tags...",
      searchEmpty: "No matches.",
      searchHint: "Try a category, place, tag, or title.",
      searching: "Searching...",
      clearFilters: "Clear filters",
      tags: "Tags",
      words: "Words",
      readingTime: "Reading time",
      preview: "Preview",
      relatedArticles: "Related Articles",
      previousArticle: "Previous",
      nextArticle: "Next",
      entryUnavailable: "Entry unavailable.",
      entryUnavailableDescription: "This article is not published or could not be loaded.",
      returnHome: "Go home",
    },
    home: {
      eyebrow: "Noah. Studio - Personal Journal",
      title: "Quiet notes from northern roads, rooms, and frames.",
      latestEyebrow: "Latest Journal",
      latestTitle: "Recent Entries",
      latestLink: "View all essays",
      galleryEyebrow: "Image Index",
      galleryTitle: "Selected Frames",
      galleryDescription: "A restrained visual archive of landscapes, interiors, and tonal studies gathered between field notes.",
      filmsEyebrow: "Films / Videos",
      filmsTitle: "Moving Notes",
      filmsLink: "Watch archive",
      archiveEyebrow: "Archive",
      archiveTitle: "Field Index",
      emptyTitle: "No published entries.",
      emptyDescription: "Published content from the CMS will appear here.",
    },
    journal: {
      eyebrow: "Journal - Blog",
      title: "Essays, field notes, and visual studies.",
      emptyTitle: "No published entries.",
      emptyDescription: "Published posts from the CMS will appear here.",
    },
    gallery: {
      eyebrow: "Gallery - Image Archive",
      title: "Selected Frames.",
      description: "A photography-first archive organized by place, time, city, country, camera, and lens.",
      emptyTitle: "No published images.",
      emptyDescription: "Published CMS images will appear here.",
    },
    films: {
      eyebrow: "Films / Videos",
      title: "Moving Notes.",
      description: "Short-form video essays and atmospheric studies. Each card opens an inline modal player.",
      emptyTitle: "No published videos.",
      emptyDescription: "Published CMS videos will appear here.",
    },
    gear: {
      eyebrow: "Gear - Field Equipment",
      title: "Tools for Slow Looking.",
      description: "A quiet inventory of cameras, lenses, sound tools, and travel objects used across the photographic archive.",
    },
    about: {
      eyebrow: "About - Noah. Studio",
      title: "A personal journal for restrained images and deliberate writing.",
      description: "Noah. Studio is a small editorial archive for travel, photography, architecture, and films. The tone is quiet, tactile, and built for slow replacement with personal writing.",
      sectionEyebrow: "Working Notes",
      sectionTitle: "Practice",
      paragraphOne: "The site is organized around durable editorial primitives: entries, images, and films. Text stays intentionally simple for now so it can be replaced later without reshaping the interface.",
      paragraphTwo: "The visual system favors high contrast, generous whitespace, serif headlines, mono labels, and image-led storytelling. It is designed to hold personal work without becoming decorative.",
      readJournal: "Read the journal",
    },
    footer: {
      description: "Editorial notes on travel, photography, films, and quiet design systems.",
    },
    notFound: {
      eyebrow: "404 - Missing Page",
      title: "This page has drifted out of the archive.",
      description: "The note, image, or film you are looking for is not available at this address.",
      journalLink: "Return to journal",
      homeLink: "Go home",
    },
    seo: {
      siteTitle: "Noah. Studio Journal",
      siteDescription: "A Nordic editorial personal journal for travel, photography, films, and essays.",
      journalTitle: "Journal",
      journalDescription: "Essays, field notes, and visual studies from Noah. Studio.",
      galleryTitle: "Gallery",
      galleryDescription: "Selected frames from the Noah. Studio image archive.",
      filmsTitle: "Films",
      filmsDescription: "Short-form video essays and atmospheric moving notes.",
      gearTitle: "Gear",
      gearDescription: "Field equipment, cameras, lenses, and tools behind the archive.",
      aboutTitle: "About",
      aboutDescription: "About Noah. Studio, a personal journal for restrained images and deliberate writing.",
      rssDescription: "Latest published essays from Noah. Studio Journal.",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
