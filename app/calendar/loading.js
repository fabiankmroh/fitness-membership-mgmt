export default function CalendarLoading() {
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

      <section className="panel calendarPanel skeletonPanel">
        <div className="skeletonLine medium" />
        <div className="calendarGrid">
          {Array.from({ length: 35 }).map((_, index) => (
            <div className="calendarDay skeletonCard" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
