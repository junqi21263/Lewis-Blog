export type AboutImageFit = "cover" | "contain" | "full-width";
export type AboutImagePositionX = "left" | "center" | "right";
export type AboutImagePositionY = "top" | "center" | "bottom";
export type AboutImageAspectRatio = "wide" | "cinema" | "square" | "original";

export type AboutImagePresentation = {
  imageFit?: AboutImageFit;
  imagePositionX?: AboutImagePositionX;
  imagePositionY?: AboutImagePositionY;
  imageAspectRatio?: AboutImageAspectRatio;
};

export const aboutImageDefaults = {
  imageFit: "cover",
  imagePositionX: "center",
  imagePositionY: "center",
  imageAspectRatio: "cinema",
} as const satisfies Required<AboutImagePresentation>;

export function normalizeAboutImagePresentation(value: AboutImagePresentation): Required<AboutImagePresentation> {
  return {
    imageFit: value.imageFit ?? aboutImageDefaults.imageFit,
    imagePositionX: value.imagePositionX ?? aboutImageDefaults.imagePositionX,
    imagePositionY: value.imagePositionY ?? aboutImageDefaults.imagePositionY,
    imageAspectRatio: value.imageAspectRatio ?? aboutImageDefaults.imageAspectRatio,
  };
}

export function splitAboutBody(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function getAboutImageFrameClassName(value: AboutImagePresentation) {
  const presentation = normalizeAboutImagePresentation(value);

  if (presentation.imageFit === "full-width" || presentation.imageAspectRatio === "original") {
    return "relative overflow-hidden bg-surface-container-low";
  }

  const aspectClass =
    presentation.imageAspectRatio === "wide"
      ? "aspect-[16/9]"
      : presentation.imageAspectRatio === "square"
        ? "aspect-square"
        : "aspect-[21/9]";

  return `relative ${aspectClass} min-h-[320px] overflow-hidden bg-surface-container-low`;
}

export function getAboutImageClassName(value: AboutImagePresentation) {
  const presentation = normalizeAboutImagePresentation(value);

  if (presentation.imageFit === "full-width" || presentation.imageAspectRatio === "original") {
    return "h-auto w-full grayscale";
  }

  return `h-full w-full ${presentation.imageFit === "contain" ? "object-contain" : "object-cover"} grayscale`;
}

export function getAboutImageStyle(value: AboutImagePresentation): React.CSSProperties {
  const presentation = normalizeAboutImagePresentation(value);

  return {
    objectPosition: `${presentation.imagePositionX} ${presentation.imagePositionY}`,
  };
}
