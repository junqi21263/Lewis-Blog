import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Noah. Studio, a personal journal for restrained images and deliberate writing.",
  openGraph: {
    title: "About",
    description: "About Noah. Studio, a personal journal for restrained images and deliberate writing.",
    images: [{ url: "/images/northern-light.jpg", alt: "A quiet Nordic shoreline." }],
  },
};

export default function AboutPage() {
  return (
    <div className="pb-28 md:pb-section-gap">
      <section className="editorial-shell mb-20 grid gap-12 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <div className="label-mono mb-8">About — Noah. Studio</div>
          <h1 className="font-serif text-display-lg text-on-background md:text-display-xl">
            A personal journal for restrained images and deliberate writing.
          </h1>
        </div>
        <p className="text-body-lg text-on-surface-variant md:col-span-5">
          Noah. Studio is a small editorial archive for travel, photography, architecture, and films. The tone is quiet,
          tactile, and built for slow replacement with personal writing.
        </p>
      </section>

      <section className="mb-20 h-[56vh] min-h-[360px] w-full overflow-hidden">
        <Image
          alt="A quiet Nordic shoreline used as an about page editorial image."
          className="h-full w-full object-cover grayscale"
          height={1200}
          priority
          src="/images/northern-light.jpg"
          width={1800}
        />
      </section>

      <section className="editorial-shell grid gap-gutter md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="label-mono mb-4">Working Notes</div>
          <h2 className="font-serif text-headline-lg text-on-background">Practice</h2>
        </div>
        <div className="space-y-8 text-body-lg text-on-surface-variant md:col-span-7 md:col-start-6">
          <p>
            The site is organized around durable editorial primitives: entries, images, and films. Text stays intentionally
            simple for now so it can be replaced later without reshaping the interface.
          </p>
          <p>
            The visual system favors high contrast, generous whitespace, serif headlines, mono labels, and image-led
            storytelling. It is designed to hold personal work without becoming decorative.
          </p>
          <Link className="label-mono inline-block transition-colors hover:text-secondary" href="/journal">
            Read the journal
          </Link>
        </div>
      </section>
    </div>
  );
}
