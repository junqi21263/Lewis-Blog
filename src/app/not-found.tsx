import Link from "next/link";

export default function NotFound() {
  return (
    <div className="editorial-shell flex min-h-[calc(100vh-18rem)] flex-col justify-center pb-28">
      <p className="label-mono mb-8">404 - Missing Page</p>
      <h1 className="max-w-3xl font-serif text-display-lg text-on-background md:text-display-xl">
        This page has drifted out of the archive.
      </h1>
      <p className="mt-8 max-w-xl text-body-lg text-on-surface-variant">
        The note, image, or film you are looking for is not available at this address.
      </p>
      <div className="mt-10 flex flex-wrap gap-6">
        <Link className="label-mono transition hover:text-secondary" href="/journal">
          Return to journal
        </Link>
        <Link className="label-mono transition hover:text-secondary" href="/">
          Go home
        </Link>
      </div>
    </div>
  );
}
