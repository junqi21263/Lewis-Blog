export type EditorialImageFit = "cover" | "contain" | "original";
export type EditorialImageAspectRatio = "cinema" | "landscape" | "square" | "portrait" | "original";

export type EditorialImageFilterOptions = {
  grayscale?: boolean;
  revealColorOnHover?: boolean;
};

export function getEditorialImageAspectClassName(aspectRatio: EditorialImageAspectRatio = "cinema") {
  if (aspectRatio === "original") {
    return "";
  }
  if (aspectRatio === "square") {
    return "aspect-square";
  }
  if (aspectRatio === "landscape") {
    return "aspect-[3/2]";
  }
  if (aspectRatio === "portrait") {
    return "aspect-[4/5]";
  }
  return "aspect-[16/10]";
}

export function getEditorialImageObjectClassName(fit: EditorialImageFit = "cover") {
  if (fit === "original") {
    return "h-auto w-full object-contain";
  }
  return `h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`;
}

export function getEditorialImageFilterClassName({
  grayscale = true,
  revealColorOnHover = true,
}: EditorialImageFilterOptions = {}) {
  const transition = "transition-[filter,transform] duration-300 ease-[ease]";

  if (!grayscale) {
    return transition;
  }

  if (!revealColorOnHover) {
    return `${transition} grayscale brightness-[0.92] contrast-[0.96]`;
  }

  return [
    transition,
    "md:grayscale",
    "md:brightness-[0.92]",
    "md:contrast-[0.96]",
    "md:group-hover/editorial-image:grayscale-0",
    "md:group-hover/editorial-image:brightness-100",
    "md:group-hover/editorial-image:contrast-100",
  ].join(" ");
}

export function resolveEditorialAspectRatioFromSize(
  width: number | null | undefined,
  height: number | null | undefined,
): EditorialImageAspectRatio {
  if (!width || !height) {
    return "cinema";
  }

  const ratio = width / height;
  if (ratio > 1.15) {
    return "cinema";
  }
  if (ratio < 0.85) {
    return "portrait";
  }
  return "square";
}
