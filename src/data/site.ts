export type ImageAsset = {
  src: string;
  alt: string;
};

export const googleSiteVerification = "googlec60f62b45447f684.html";

export type Article = {
  slug: string;
  title: string;
  eyebrow: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  readTime: string;
  location: string;
  equipment: string[];
  excerpt: string;
  image: ImageAsset;
  gallery: ImageAsset[];
  body: Array<
    | { type: "paragraph"; content: string; lead?: boolean }
    | { type: "heading"; content: string }
    | { type: "quote"; content: string }
    | { type: "code"; filename: string; content: string }
  >;
};

export type GalleryImage = ImageAsset & {
  id: string;
  title: string;
  location: string;
  orientation: "portrait" | "landscape" | "square";
};

export type Film = {
  id: string;
  title: string;
  year: string;
  duration: string;
  category: string;
  description: string;
  poster: ImageAsset;
  videoSrc: string;
};

export const navItems = [
  { href: "/journal", label: "Journal" },
  { href: "/gallery", label: "Gallery" },
  { href: "/gear", label: "Gear" },
  { href: "/films", label: "Films" },
  { href: "/about", label: "About" },
];

const roadArticleBody: Article["body"] = [
  {
    type: "paragraph",
    lead: true,
    content:
      "There is a specific quality of silence that exists only at 6:00 AM on a desert highway. It is not an absence of noise, but a dense, heavy presence. The air is still cold, the asphalt holds no heat, and the horizon is a bruised purple waiting for the sun to strike.",
  },
  {
    type: "paragraph",
    content:
      "We left the city constraints not to escape, but to recalibrate. The modern condition demands constant input, a relentless stream of notifications, obligations, and superficial engagements. The antidote was the raw, unstructured forward momentum of a road trip without a fixed destination.",
  },
  { type: "heading", content: "The Geometry of Solitude" },
  {
    type: "paragraph",
    content:
      "Driving through Nevada, the landscape strips away the unnecessary. The geology is brutalist architecture on a planetary scale. It forces a perspective shift. Immediate concerns evaporate against ancient seabed formations and tectonic scars.",
  },
  {
    type: "code",
    filename: "Route_Coordinates.json",
    content: `{
  "waypoints": [
    { "name": "Death Valley Junction", "lat": 36.3015, "lng": -116.4140 },
    { "name": "Zabriskie Point", "lat": 36.4208, "lng": -116.8122 },
    { "name": "Artist's Drive", "lat": 36.3638, "lng": -116.8375 }
  ],
  "conditions": {
    "temperature": "optimal",
    "visibility": "unlimited"
  }
}`,
  },
  {
    type: "paragraph",
    content:
      "The ritual of the road is meditative. The rhythmic passing of dashed white lines and the hum of the tires translate the texture of the earth into vibration through the steering wheel. It becomes a mantra.",
  },
  {
    type: "quote",
    content: "The open road is a canvas where time and space collapse into a single, continuous present tense.",
  },
  {
    type: "paragraph",
    content:
      "We camped near an abandoned gas station on the third night. The rusted pumps stood like monuments to a different era of transit. As the temperature dropped, the sky transitioned from dusty orange to deep black, pierced only by the sharp light of distant stars.",
  },
  {
    type: "paragraph",
    content:
      "Returning to the coast, the air grew thick with moisture again. The sudden appearance of the ocean felt less like an arrival and more like hitting an ultimate limit. The road had run out, but the internal momentum continued.",
  },
];

export const articles: Article[] = [
  {
    slug: "finding-freedom-open-road",
    title: "Finding Freedom on the Open Road.",
    eyebrow: "Journal — Travel",
    category: "Travel",
    tags: ["Road", "Desert", "Travel", "Reflection"],
    author: "Elias Thorne",
    date: "October 12, 2024",
    readTime: "12 Min Read",
    location: "Pacific Coast Highway, California",
    equipment: ["Leica M11", "Summilux 35mm", "Ilford HP5 Plus"],
    excerpt:
      "A quiet drive through desert roads, coastal fog, and the long interior distance between departure and return.",
    image: {
      src: "/images/open-road.jpg",
      alt: "A monochrome desert highway stretching toward distant mountains.",
    },
    gallery: [
      {
        src: "/images/desert-highway.jpg",
        alt: "A stark desert highway under hard midday light.",
      },
      {
        src: "/images/car-dashboard.jpg",
        alt: "A vintage car dashboard glowing at dusk.",
      },
    ],
    body: roadArticleBody,
  },
  {
    slug: "minimal-packing",
    title: "The Art of Minimal Packing",
    eyebrow: "Journal — Field Notes",
    category: "Field Notes",
    tags: ["Packing", "Travel", "Objects", "Practice"],
    author: "Mara Voss",
    date: "September 28, 2024",
    readTime: "7 Min Read",
    location: "Copenhagen, Denmark",
    equipment: ["Fuji X100V", "Portra 400", "Field notebook"],
    excerpt:
      "A practical meditation on choosing fewer objects, better materials, and more deliberate movement.",
    image: {
      src: "/images/packing.jpg",
      alt: "A neatly organized travel kit on a dark surface.",
    },
    gallery: [],
    body: [
      {
        type: "paragraph",
        lead: true,
        content:
          "To pack lightly is to decide in advance what kind of attention the journey deserves.",
      },
      {
        type: "paragraph",
        content:
          "Every object earns its place through utility, texture, and restraint. The result is not austerity, but ease.",
      },
    ],
  },
  {
    slug: "brutalism-in-the-wild",
    title: "Brutalism in the Wild",
    eyebrow: "Journal — Architecture",
    category: "Architecture",
    tags: ["Concrete", "Architecture", "Iceland", "Monochrome"],
    author: "Noah Vale",
    date: "August 15, 2024",
    readTime: "9 Min Read",
    location: "Reykjavik, Iceland",
    equipment: ["Canon R5", "RF 50mm", "Tripod"],
    excerpt:
      "Concrete forms, volcanic weather, and the quiet authority of buildings that refuse decoration.",
    image: {
      src: "/images/brutalist.jpg",
      alt: "A brutalist concrete structure against a pale sky.",
    },
    gallery: [],
    body: [
      {
        type: "paragraph",
        lead: true,
        content:
          "Brutalism becomes stranger and more humane when it leaves the city and meets wind, moss, and salt air.",
      },
      {
        type: "paragraph",
        content:
          "These buildings do not disappear into the landscape. They negotiate with it, plane by plane.",
      },
    ],
  },
  {
    slug: "northern-light-index",
    title: "Northern Light Index",
    eyebrow: "Journal — Photography",
    category: "Photography",
    tags: ["Nordic", "Light", "Photography", "Landscape"],
    author: "Elias Thorne",
    date: "July 03, 2024",
    readTime: "6 Min Read",
    location: "Skagen, Denmark",
    equipment: ["Hasselblad 907X", "XCD 45P"],
    excerpt:
      "A study of pale horizons, softened shadows, and the subtle discipline of photographing almost nothing.",
    image: {
      src: "/images/northern-light.jpg",
      alt: "A quiet Nordic shoreline under a pale horizon.",
    },
    gallery: [],
    body: [
      {
        type: "paragraph",
        lead: true,
        content:
          "Northern light is less a visual effect than a tempo. It asks the camera to wait longer than usual.",
      },
      {
        type: "paragraph",
        content:
          "The image often arrives only after the scene appears to have emptied itself.",
      },
    ],
  },
];

export const galleryImages: GalleryImage[] = [
  {
    id: "glacier-form",
    title: "Glacier Form",
    location: "Vatnajokull",
    orientation: "portrait",
    src: "/images/gallery-glacier.jpg",
    alt: "A blue white glacier wall with sculptural texture.",
  },
  {
    id: "coastal-station",
    title: "Coastal Station",
    location: "Maine",
    orientation: "landscape",
    src: "/images/gallery-coast.jpg",
    alt: "A quiet coastal station near dark water.",
  },
  {
    id: "black-sand",
    title: "Black Sand",
    location: "Vik",
    orientation: "square",
    src: "/images/gallery-sand.jpg",
    alt: "Black volcanic sand with white water at the edge.",
  },
  {
    id: "pine-line",
    title: "Pine Line",
    location: "Lapland",
    orientation: "portrait",
    src: "/images/gallery-pines.jpg",
    alt: "A minimal pine forest in winter.",
  },
  {
    id: "museum-light",
    title: "Museum Light",
    location: "Oslo",
    orientation: "landscape",
    src: "/images/gallery-museum.jpg",
    alt: "Soft light across a modern museum interior.",
  },
  {
    id: "ferry-wake",
    title: "Ferry Wake",
    location: "Stockholm",
    orientation: "square",
    src: "/images/gallery-ferry.jpg",
    alt: "A ferry wake crossing dark Nordic water.",
  },
];

export const films: Film[] = [
  {
    id: "slow-north",
    title: "Slow North",
    year: "2024",
    duration: "04:18",
    category: "Travel Film",
    description: "A short study of roads, rain, ferry light, and the discipline of moving slowly.",
    poster: {
      src: "/images/film-slow-north.jpg",
      alt: "A wet road disappearing into northern fog.",
    },
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    id: "concrete-weather",
    title: "Concrete Weather",
    year: "2023",
    duration: "06:42",
    category: "Architecture",
    description: "Concrete facades, low clouds, and the small human gestures that soften hard geometry.",
    poster: {
      src: "/images/film-concrete.jpg",
      alt: "A concrete building facade under overcast light.",
    },
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    id: "salt-index",
    title: "Salt Index",
    year: "2023",
    duration: "03:57",
    category: "Photo Essay",
    description: "A monochrome coastal essay told through wind, water, and silver light.",
    poster: {
      src: "/images/film-salt.jpg",
      alt: "A dark shoreline with silver water.",
    },
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
];

export const featuredArticle = articles[0];

export const siteUrl = "https://journal.lewislee.online";
export const siteName = "Noah. Studio Journal";
export const siteDescription = "A Nordic editorial personal journal for travel, photography, films, and essays.";

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 2) {
  const current = getArticleBySlug(slug);

  if (!current) {
    return articles.slice(0, limit);
  }

  return articles
    .filter((article) => article.slug !== slug)
    .map((article) => {
      const sharedTags = article.tags.filter((tag) => current.tags.includes(tag)).length;
      const sameCategory = article.category === current.category ? 2 : 0;
      return { article, score: sharedTags + sameCategory };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article)
    .slice(0, limit);
}

export function getArticleCategories() {
  return Array.from(new Set(articles.map((article) => article.category)));
}

export function getArticleTags() {
  return Array.from(new Set(articles.flatMap((article) => article.tags)));
}

export function getAdjacentArticles(slug: string) {
  const index = articles.findIndex((article) => article.slug === slug);

  return {
    previous: index > 0 ? articles[index - 1] : null,
    next: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export function createHeadingId(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getArticleToc(article: Article) {
  return article.body
    .filter((block): block is { type: "heading"; content: string } => block.type === "heading")
    .map((block) => ({
      id: createHeadingId(block.content),
      title: block.content,
    }));
}

export type SearchResult = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  type: "Article" | "Image" | "Film";
};

type SearchIndexEntry = SearchResult & {
  searchable: string;
};

function toSearchResult(entry: SearchIndexEntry): SearchResult {
  const { searchable, ...result } = entry;
  void searchable;
  return result;
}

export function getSearchResults(query: string): SearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  const results: SearchIndexEntry[] = [
    ...articles.map((article) => ({
      id: article.slug,
      title: article.title,
      eyebrow: article.eyebrow,
      description: article.excerpt,
      href: `/journal/${article.slug}`,
      type: "Article" as const,
      searchable: [article.title, article.excerpt, article.category, article.tags.join(" "), article.author].join(" "),
    })),
    ...galleryImages.map((image) => ({
      id: image.id,
      title: image.title,
      eyebrow: image.location,
      description: image.alt,
      href: "/gallery",
      type: "Image" as const,
      searchable: [image.title, image.location, image.alt].join(" "),
    })),
    ...films.map((film) => ({
      id: film.id,
      title: film.title,
      eyebrow: `${film.category} - ${film.year}`,
      description: film.description,
      href: "/films",
      type: "Film" as const,
      searchable: [film.title, film.category, film.description, film.year].join(" "),
    })),
  ];

  if (!normalizedQuery) {
    return results.slice(0, 6).map(toSearchResult);
  }

  return results
    .filter((result) => result.searchable.toLowerCase().includes(normalizedQuery))
    .slice(0, 8)
    .map(toSearchResult);
}
