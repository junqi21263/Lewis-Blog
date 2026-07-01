type ArticleMetaProps = {
  readingTime: string;
  wordCount: number;
};

export default function ArticleMeta({ readingTime, wordCount }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
      <span>{readingTime}</span>
      <span className="size-1 rounded-full bg-outline-variant" />
      <span>{wordCount.toLocaleString("en-US")} words</span>
    </div>
  );
}
