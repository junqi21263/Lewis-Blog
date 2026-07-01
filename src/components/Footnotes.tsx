import type { Footnote } from "@/lib/editor";

type FootnotesProps = {
  footnotes: Footnote[];
};

export default function Footnotes({ footnotes }: FootnotesProps) {
  if (footnotes.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 border-t border-outline-variant/10 pt-10">
      <div className="label-mono mb-6">Footnotes</div>
      <ol className="space-y-4">
        {footnotes.map((footnote) => (
          <li key={footnote.id} id={footnote.id} className="scroll-mt-36 text-body-md text-on-surface-variant">
            <span className="mr-3 font-mono text-label-mono text-on-background">[{footnote.label}]</span>
            {footnote.text}
            <a className="ml-3 text-on-background transition hover:text-secondary" href={`#footnote-ref-${footnote.label}`}>
              Back
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
