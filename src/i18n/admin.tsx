"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, localeCookieName, localeLabel, localeStorageKey, type Locale } from "@/i18n/config";

type AdminDictionary = {
  nav: {
    dashboard: string;
    posts: string;
    gallery: string;
    videos: string;
    drafts: string;
    settings: string;
  };
  topbar: {
    searchPlaceholder: string;
    previewSite: string;
    notifications: string;
    account: string;
    accessRequired: string;
  };
  dashboard: {
    title: string;
    description: string;
    emptyEyebrow: string;
    emptyTitle: string;
    emptyDescription: string;
    newArticle: string;
    newArticleDescription: string;
    uploadImage: string;
    uploadImageDescription: string;
    addFilm: string;
    addFilmDescription: string;
    posts: string;
    drafts: string;
    published: string;
    galleryFilms: string;
    recentActivity: string;
    viewAll: string;
    noRecentActivity: string;
    noRecentActivityDescription: string;
    actions: string;
  };
  posts: {
    title: string;
    description: string;
    newEntry: string;
    tabs: { all: string; published: string; drafts: string; scheduled: string };
    searchPlaceholder: string;
    tableTitle: string;
    tableCategory: string;
    tableDate: string;
    tableStatus: string;
    tableActions: string;
    noArticlesTitle: string;
    noArticlesDescription: string;
  };
  drafts: {
    title: string;
    description: string;
    searchPlaceholder: string;
    convertToPost: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  gallery: {
    title: string;
    description: string;
    uploadImage: string;
    addImage: string;
    allWorks: string;
    featured: string;
    drafts: string;
    searchPlaceholder: string;
    dateAdded: string;
    emptyTitle: string;
    emptyDescription: string;
    imageDetails: string;
    assetMetadata: string;
    featuredHint: string;
    saveChanges: string;
    uploadCover: string;
    generateAiAltText: string;
  };
  videos: {
    title: string;
    description: string;
    newVideo: string;
    uploadVideo: string;
    noFilmsTitle: string;
    noFilmsDescription: string;
    metadata: string;
    clearSelection: string;
    noSelectionTitle: string;
    noSelectionDescription: string;
    featuredHint: string;
    save: string;
    uploadCover: string;
  };
  settings: {
    title: string;
    description: string;
    studioIdentity: string;
    brandCore: string;
    studioName: string;
    tagline: string;
    logoMark: string;
    replace: string;
    appearance: string;
    environment: string;
    interfaceLanguage: string;
    light: string;
    dark: string;
    searchEngine: string;
    globalMeta: string;
    globalTitleFormat: string;
    defaultDescription: string;
    saveChanges: string;
  };
};

const adminDictionaries: Record<Locale, AdminDictionary> = {
  "zh-CN": {
    nav: { dashboard: "概览", posts: "文章", gallery: "图库", videos: "影片", drafts: "草稿", settings: "设置" },
    topbar: {
      searchPlaceholder: "搜索文章、图片、影片...",
      previewSite: "预览站点",
      notifications: "通知",
      account: "账户",
      accessRequired: "需要 Access 登录",
    },
    dashboard: {
      title: "概览",
      description: "一个安静的控制室，用于管理写作归档、图像资料和动态影像集合。",
      emptyEyebrow: "空白工作区",
      emptyTitle: "工作室归档目前还是空的。",
      emptyDescription: "发布第一篇文章、上传第一张照片，或添加第一条影片记录，归档就会开始生长。",
      newArticle: "新建文章",
      newArticleDescription: "开始第一篇长文。",
      uploadImage: "上传图片",
      uploadImageDescription: "添加第一张图库作品。",
      addFilm: "添加影片",
      addFilmDescription: "创建第一条视频记录。",
      posts: "文章",
      drafts: "草稿",
      published: "已发布",
      galleryFilms: "图库与影片",
      recentActivity: "最近活动",
      viewAll: "查看全部",
      noRecentActivity: "暂无最近活动",
      noRecentActivityDescription: "文章、草稿和发布变更会在归档开始增长后出现在这里。",
      actions: "快捷操作",
    },
    posts: {
      title: "文章",
      description: "整理和管理你的编辑文章归档。",
      newEntry: "新建文章",
      tabs: { all: "全部", published: "已发布", drafts: "草稿", scheduled: "定时" },
      searchPlaceholder: "搜索文章...",
      tableTitle: "标题",
      tableCategory: "分类",
      tableDate: "日期",
      tableStatus: "状态",
      tableActions: "操作",
      noArticlesTitle: "No articles yet",
      noArticlesDescription: "第一篇文章创建后，已发布内容和草稿都会出现在这里。",
    },
    drafts: {
      title: "草稿",
      description: "一个专门容纳未完成想法、草图与写作片段的空间。",
      searchPlaceholder: "搜索草稿...",
      convertToPost: "转为文章",
      emptyTitle: "No drafts",
      emptyDescription: "未发布的写作会显示在这里。",
    },
    gallery: {
      title: "图库",
      description: "用最终资产、元数据和克制的编辑顺序构建图像归档。",
      uploadImage: "上传图片",
      addImage: "添加图片",
      allWorks: "全部作品",
      featured: "精选",
      drafts: "草稿",
      searchPlaceholder: "搜索图库...",
      dateAdded: "添加时间",
      emptyTitle: "No gallery items",
      emptyDescription: "上传第一张照片，开始图像归档。",
      imageDetails: "图片详情",
      assetMetadata: "资产元数据",
      featuredHint: "显示在图库精选中",
      saveChanges: "保存更改",
      uploadCover: "上传封面",
      generateAiAltText: "生成 AI Alt 文本",
    },
    videos: {
      title: "影片",
      description: "一个克制的影片目录，用于管理视频条目、封面和播放信息。",
      newVideo: "新建影片",
      uploadVideo: "上传影片",
      noFilmsTitle: "No films yet",
      noFilmsDescription: "添加第一条影片记录，开始动态影像归档。",
      metadata: "元数据",
      clearSelection: "清除选择",
      noSelectionTitle: "未选择影片",
      noSelectionDescription: "创建或选择一条影片记录以编辑元数据。",
      featuredHint: "显示在 Films 页面",
      save: "保存",
      uploadCover: "上传封面",
    },
    settings: {
      title: "设置",
      description: "配置工作室身份、管理偏好，并控制全局可见性参数。",
      studioIdentity: "工作室身份",
      brandCore: "品牌核心",
      studioName: "工作室名称",
      tagline: "标语",
      logoMark: "标志",
      replace: "替换",
      appearance: "外观",
      environment: "环境",
      interfaceLanguage: "界面语言",
      light: "浅色",
      dark: "深色",
      searchEngine: "搜索引擎",
      globalMeta: "全局元信息",
      globalTitleFormat: "全局标题格式",
      defaultDescription: "默认描述",
      saveChanges: "保存更改",
    },
  },
  "zh-TW": {
    nav: { dashboard: "總覽", posts: "文章", gallery: "圖庫", videos: "影片", drafts: "草稿", settings: "設定" },
    topbar: {
      searchPlaceholder: "搜尋文章、圖片、影片...",
      previewSite: "預覽站點",
      notifications: "通知",
      account: "帳戶",
      accessRequired: "需要 Access 登入",
    },
    dashboard: {
      title: "總覽",
      description: "一個安靜的控制室，用於管理寫作歸檔、圖像資料與動態影像集合。",
      emptyEyebrow: "空白工作區",
      emptyTitle: "工作室歸檔目前仍是空的。",
      emptyDescription: "發布第一篇文章、上傳第一張照片，或新增第一條影片記錄，歸檔就會開始成長。",
      newArticle: "新增文章",
      newArticleDescription: "開始第一篇長文。",
      uploadImage: "上傳圖片",
      uploadImageDescription: "加入第一張圖庫作品。",
      addFilm: "新增影片",
      addFilmDescription: "建立第一條影片記錄。",
      posts: "文章",
      drafts: "草稿",
      published: "已發布",
      galleryFilms: "圖庫與影片",
      recentActivity: "最近活動",
      viewAll: "查看全部",
      noRecentActivity: "暫無最近活動",
      noRecentActivityDescription: "文章、草稿與發布變更會在歸檔開始成長後出現在這裡。",
      actions: "快捷操作",
    },
    posts: {
      title: "文章",
      description: "整理與管理你的編輯文章歸檔。",
      newEntry: "新增文章",
      tabs: { all: "全部", published: "已發布", drafts: "草稿", scheduled: "排程" },
      searchPlaceholder: "搜尋文章...",
      tableTitle: "標題",
      tableCategory: "分類",
      tableDate: "日期",
      tableStatus: "狀態",
      tableActions: "操作",
      noArticlesTitle: "No articles yet",
      noArticlesDescription: "建立第一篇文章後，已發布內容與草稿都會出現在這裡。",
    },
    drafts: {
      title: "草稿",
      description: "一個專門容納未完成想法、草圖與寫作片段的空間。",
      searchPlaceholder: "搜尋草稿...",
      convertToPost: "轉為文章",
      emptyTitle: "No drafts",
      emptyDescription: "未發布的寫作會顯示在這裡。",
    },
    gallery: {
      title: "圖庫",
      description: "以最終資產、元資料與克制的編輯順序建立圖像歸檔。",
      uploadImage: "上傳圖片",
      addImage: "新增圖片",
      allWorks: "全部作品",
      featured: "精選",
      drafts: "草稿",
      searchPlaceholder: "搜尋圖庫...",
      dateAdded: "加入時間",
      emptyTitle: "No gallery items",
      emptyDescription: "上傳第一張照片，開始圖像歸檔。",
      imageDetails: "圖片詳情",
      assetMetadata: "資產中繼資料",
      featuredHint: "顯示在圖庫精選中",
      saveChanges: "儲存變更",
      uploadCover: "上傳封面",
      generateAiAltText: "生成 AI Alt 文字",
    },
    videos: {
      title: "影片",
      description: "一個克制的影片目錄，用於管理影片條目、封面與播放資訊。",
      newVideo: "新增影片",
      uploadVideo: "上傳影片",
      noFilmsTitle: "No films yet",
      noFilmsDescription: "新增第一條影片記錄，開始動態影像歸檔。",
      metadata: "中繼資料",
      clearSelection: "清除選擇",
      noSelectionTitle: "未選擇影片",
      noSelectionDescription: "建立或選擇一條影片記錄以編輯中繼資料。",
      featuredHint: "顯示在 Films 頁面",
      save: "儲存",
      uploadCover: "上傳封面",
    },
    settings: {
      title: "設定",
      description: "配置工作室身份、管理偏好，並控制全域可見性參數。",
      studioIdentity: "工作室身份",
      brandCore: "品牌核心",
      studioName: "工作室名稱",
      tagline: "標語",
      logoMark: "標誌",
      replace: "替換",
      appearance: "外觀",
      environment: "環境",
      interfaceLanguage: "介面語言",
      light: "淺色",
      dark: "深色",
      searchEngine: "搜尋引擎",
      globalMeta: "全域中繼資訊",
      globalTitleFormat: "全域標題格式",
      defaultDescription: "預設描述",
      saveChanges: "儲存變更",
    },
  },
  "en-US": {
    nav: { dashboard: "Dashboard", posts: "Posts", gallery: "Gallery", videos: "Videos", drafts: "Drafts", settings: "Settings" },
    topbar: {
      searchPlaceholder: "Search posts, images, films...",
      previewSite: "Preview Site",
      notifications: "Notifications",
      account: "Account",
      accessRequired: "Access required",
    },
    dashboard: {
      title: "Overview",
      description: "A quiet control room for the writing archive, image library, and moving image collection.",
      emptyEyebrow: "Empty Workspace",
      emptyTitle: "The studio archive is empty.",
      emptyDescription: "Publish your first article, upload a photograph, or add a film to begin building the journal.",
      newArticle: "New Article",
      newArticleDescription: "Start the first longform entry.",
      uploadImage: "Upload Image",
      uploadImageDescription: "Add the first gallery asset.",
      addFilm: "Add Film",
      addFilmDescription: "Create the first video record.",
      posts: "Posts",
      drafts: "Drafts",
      published: "Published",
      galleryFilms: "Gallery + Films",
      recentActivity: "Recent Activity",
      viewAll: "View All",
      noRecentActivity: "No recent activity",
      noRecentActivityDescription: "Posts, drafts, and publication changes will appear here once the archive begins to grow.",
      actions: "Actions",
    },
    posts: {
      title: "Posts",
      description: "Curate and manage your editorial narratives.",
      newEntry: "New Entry",
      tabs: { all: "All", published: "Published", drafts: "Drafts", scheduled: "Scheduled" },
      searchPlaceholder: "Search entries...",
      tableTitle: "Title",
      tableCategory: "Category",
      tableDate: "Date",
      tableStatus: "Status",
      tableActions: "Actions",
      noArticlesTitle: "No articles yet",
      noArticlesDescription: "Published pieces and drafts will appear here once the first article is created.",
    },
    drafts: {
      title: "Drafts",
      description: "A dedicated space for unfinished ideas, sketches, and narratives currently in progress.",
      searchPlaceholder: "Search drafts...",
      convertToPost: "Convert to Post",
      emptyTitle: "No drafts",
      emptyDescription: "Unpublished writing will appear here.",
    },
    gallery: {
      title: "Gallery",
      description: "Build the image archive with final assets, metadata, and a restrained editorial sequence.",
      uploadImage: "Upload Image",
      addImage: "Add Image",
      allWorks: "All Works",
      featured: "Featured",
      drafts: "Drafts",
      searchPlaceholder: "Search gallery...",
      dateAdded: "Date Added",
      emptyTitle: "No gallery items",
      emptyDescription: "Upload the first photograph to begin the image archive.",
      imageDetails: "Image Details",
      assetMetadata: "Asset Metadata",
      featuredHint: "Show in gallery highlights",
      saveChanges: "Save Changes",
      uploadCover: "Upload Cover",
      generateAiAltText: "Generate AI Alt Text",
    },
    videos: {
      title: "Cinematography",
      description: "A restrained catalogue for film entries, motion studies, and cover treatments.",
      newVideo: "New Video",
      uploadVideo: "Upload Video",
      noFilmsTitle: "No films yet",
      noFilmsDescription: "Add the first film entry to begin the moving image archive.",
      metadata: "Metadata",
      clearSelection: "Clear selection",
      noSelectionTitle: "No video selected",
      noSelectionDescription: "Create or select a video to edit metadata.",
      featuredHint: "Feature on Films page",
      save: "Save",
      uploadCover: "Upload Cover",
    },
    settings: {
      title: "Settings",
      description: "Configure your studio identity, manage preferences, and control global visibility parameters.",
      studioIdentity: "Studio Identity",
      brandCore: "Brand Core",
      studioName: "Studio Name",
      tagline: "Tagline",
      logoMark: "Logo Mark",
      replace: "Replace",
      appearance: "Appearance",
      environment: "Environment",
      interfaceLanguage: "Interface Language",
      light: "Light",
      dark: "Dark",
      searchEngine: "Search Engine",
      globalMeta: "Global Meta",
      globalTitleFormat: "Global Title Format",
      defaultDescription: "Default Description",
      saveChanges: "Save Changes",
    },
  },
};

type AdminI18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: AdminDictionary;
  languageName: string;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

function detectInitialLocale() {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${localeCookieName}=([^;]+)`));
  const cookieLocale = cookieMatch?.[1];
  if (cookieLocale === "zh-CN" || cookieLocale === "zh-TW" || cookieLocale === "en-US") {
    return cookieLocale;
  }

  const storedLocale = window.localStorage.getItem(localeStorageKey);
  if (storedLocale === "zh-CN" || storedLocale === "zh-TW" || storedLocale === "en-US") {
    return storedLocale;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.includes("zh-tw") || browserLanguage.includes("zh-hk")) {
    return "zh-TW";
  }
  if (browserLanguage.includes("en")) {
    return "en-US";
  }
  return "zh-CN";
}

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  function setLocale(locale: Locale) {
    setLocaleState(locale);
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(localeStorageKey, locale);
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      dictionary: adminDictionaries[locale],
      languageName: localeLabel(locale),
    }),
    [locale],
  );

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
  const context = useContext(AdminI18nContext);
  if (!context) {
    throw new Error("useAdminI18n must be used within AdminI18nProvider.");
  }
  return context;
}
