export default function CalendarWeekLoading() {
  return (
    <main className="shell">
      <div className="skeletonLine backLinkSkeleton" />
      <section className="pageHeader">
        <div>
          <div className="skeletonLine tiny" />
          <div className="skeletonLine title" />
          <div className="skeletonLine subtitle" />
        </div>
      </section>
      <section className="weekGrid">
        {Array.from({ length: 7 }).map((_, index) => (
          <div className="panel weekDay skeletonPanel" key={index}>
            <div className="skeletonLine medium" />
            <div className="skeletonBox input" />
          </div>
        ))}
      </section>
    </main>
  );
}
