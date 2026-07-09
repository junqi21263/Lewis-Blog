type EditorialPageSkeletonProps = {
  home?: boolean;
};

export default function EditorialPageSkeleton({ home = false }: EditorialPageSkeletonProps) {
  return (
    <div className="editorial-shell animate-pulse pb-24 md:pb-section-gap" aria-busy="true" aria-label="Loading content">
      <div className="border-b border-outline-variant/10 pb-8 pt-5 md:pb-10 md:pt-10">
        <div className="mb-5 h-3 w-36 bg-surface-container-low" />
        <div className="h-12 w-3/4 max-w-2xl bg-surface-container-low md:h-16" />
        <div className="mt-5 h-5 w-1/2 max-w-xl bg-surface-container-low" />
      </div>
      <div className={home ? "mt-10 h-[52vh] min-h-[360px] bg-surface-container-low" : "mt-10 space-y-6"}>
        {home ? null : (
          <>
            <div className="h-48 border-y border-outline-variant/10 bg-surface-container-low/70" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-52 bg-surface-container-low" />
              <div className="h-52 bg-surface-container-low" />
              <div className="h-52 bg-surface-container-low" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
