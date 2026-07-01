import type { Photo } from "@/data/cms";

export type PhotoArchiveKey = "city" | "country" | "camera" | "lens";

export type ExifRow = {
  label: string;
  value: string;
};

const knownCoordinates: Record<string, { latitude: number; longitude: number }> = {
  bergen: { latitude: 60.3913, longitude: 5.3221 },
  copenhagen: { latitude: 55.6761, longitude: 12.5683 },
  lapland: { latitude: 67.9222, longitude: 26.5046 },
  maine: { latitude: 45.2538, longitude: -69.4455 },
  oslo: { latitude: 59.9139, longitude: 10.7522 },
  reykjavik: { latitude: 64.1466, longitude: -21.9426 },
  skagen: { latitude: 57.7209, longitude: 10.5839 },
  stockholm: { latitude: 59.3293, longitude: 18.0686 },
  vatnajokull: { latitude: 64.4167, longitude: -16.8 },
  vik: { latitude: 63.4186, longitude: -19.006 },
};

function firstToken(value: string) {
  return value.split(",")[0]?.trim() ?? value.trim();
}

function lastToken(value: string) {
  const parts = value.split(",");
  return parts.length > 1 ? parts[parts.length - 1].trim() : "";
}

export function photoCity(photo: Photo) {
  return photo.city || firstToken(photo.location) || "Unknown";
}

export function photoCountry(photo: Photo) {
  return photo.country || lastToken(photo.location) || "Unknown";
}

export function photoYear(photo: Photo) {
  const value = photo.date || "";
  const year = new Date(value).getFullYear();
  if (Number.isFinite(year)) {
    return String(year);
  }
  return value.slice(0, 4) || "Undated";
}

export function getPhotoCoordinate(photo: Photo) {
  if (typeof photo.latitude === "number" && typeof photo.longitude === "number") {
    return { latitude: photo.latitude, longitude: photo.longitude };
  }

  const keys = [photo.city, firstToken(photo.location), photo.location, photoCountry(photo)]
    .filter(Boolean)
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));

  for (const key of keys) {
    const direct = knownCoordinates[key];
    if (direct) {
      return direct;
    }
  }

  return null;
}

export function projectCoordinate(latitude: number, longitude: number) {
  const x = ((longitude + 180) / 360) * 100;
  const y = ((90 - latitude) / 180) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(92, Math.max(8, y)),
  };
}

export function getExifRows(photo: Photo): ExifRow[] {
  return [
    { label: "Camera", value: photo.camera },
    { label: "Lens", value: photo.lens },
    { label: "ISO", value: photo.iso },
    { label: "Aperture", value: photo.aperture },
    { label: "Shutter", value: photo.shutterSpeed },
    { label: "Focal Length", value: photo.focalLength },
    { label: "Date", value: photo.date },
    { label: "Location", value: photo.location },
  ].filter((row) => row.value);
}

export function getArchiveValues(photos: Photo[], key: PhotoArchiveKey) {
  const values = photos.map((photo) => {
    if (key === "city") return photoCity(photo);
    if (key === "country") return photoCountry(photo);
    if (key === "camera") return photo.camera || "Unknown";
    return photo.lens || "Unknown";
  });

  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function groupPhotosByYear(photos: Photo[]) {
  return photos.reduce<Record<string, Photo[]>>((groups, photo) => {
    const year = photoYear(photo);
    groups[year] = [...(groups[year] ?? []), photo];
    return groups;
  }, {});
}
