export type GearCategory = "Camera" | "Lens" | "Phone" | "Drone" | "Audio" | "Accessories";

export type GearItem = {
  id: string;
  name: string;
  category: GearCategory;
  maker: string;
  description: string;
  years: string;
  image: string;
  notes: string[];
};

export const gearItems: GearItem[] = [
  {
    id: "leica-m11",
    name: "M11",
    category: "Camera",
    maker: "Leica",
    description: "A quiet rangefinder body for deliberate travel work and restrained monochrome studies.",
    years: "2024 - Present",
    image: "/images/gallery-museum.jpg",
    notes: ["Rangefinder pace", "High-resolution stills", "Field travel"],
  },
  {
    id: "hasselblad-907x",
    name: "907X",
    category: "Camera",
    maker: "Hasselblad",
    description: "A slow medium-format system for Nordic light, landscape quietness, and square compositions.",
    years: "2024 - Present",
    image: "/images/northern-light.jpg",
    notes: ["Medium format", "Color discipline", "Landscape"],
  },
  {
    id: "summilux-35",
    name: "Summilux 35mm",
    category: "Lens",
    maker: "Leica",
    description: "The everyday field lens: wide enough for place, narrow enough for attention.",
    years: "2023 - Present",
    image: "/images/open-road.jpg",
    notes: ["35mm", "Travel", "Low light"],
  },
  {
    id: "xcd-45p",
    name: "XCD 45P",
    category: "Lens",
    maker: "Hasselblad",
    description: "A compact normal lens for soft horizons, architecture, and long walks.",
    years: "2024 - Present",
    image: "/images/gallery-coast.jpg",
    notes: ["45mm", "Compact", "Quiet shutter"],
  },
  {
    id: "iphone-field",
    name: "iPhone Field Kit",
    category: "Phone",
    maker: "Apple",
    description: "Always-on location notes, scouting frames, and small video fragments.",
    years: "2022 - Present",
    image: "/images/car-dashboard.jpg",
    notes: ["Scouting", "GPS notes", "Short clips"],
  },
  {
    id: "mini-drone",
    name: "Mini Travel Drone",
    category: "Drone",
    maker: "DJI",
    description: "Used sparingly for coastlines, roads, and broad spatial orientation.",
    years: "2023 - Present",
    image: "/images/desert-highway.jpg",
    notes: ["Aerial context", "Travel light", "Low profile"],
  },
  {
    id: "field-recorder",
    name: "Field Recorder",
    category: "Audio",
    maker: "Zoom",
    description: "Ambient notes for films: rain, ferry engines, museum rooms, and winter wind.",
    years: "2023 - Present",
    image: "/images/film-salt.jpg",
    notes: ["Ambient sound", "Film notes", "Interviews"],
  },
  {
    id: "travel-accessories",
    name: "Travel Accessories",
    category: "Accessories",
    maker: "Studio Kit",
    description: "Filters, batteries, notebook, straps, and a compact archive drive.",
    years: "2022 - Present",
    image: "/images/packing.jpg",
    notes: ["ND filters", "Archive drive", "Notebook"],
  },
];
