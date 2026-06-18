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
      <section className="panel weekCalendarPanel">
        <div className="weekCalendarGrid weekCalendarGridLoading">
          <div className="weekCorner" />
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              className="weekColumnHeader"
              key={`header-${index}`}
              style={{ gridColumn: index + 2 }}
            >
              <div className="skeletonLine tiny" />
              <div className="skeletonLine medium" />
            </div>
          ))}
          {Array.from({ length: 24 }).map((_, index) => (
            <div
              className="weekTimeLabel"
              key={`time-${index}`}
              style={{ gridRow: `${index * 2 + 2} / span 2` }}
            >
              <div className="skeletonLine tiny" />
            </div>
          ))}
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              aria-hidden="true"
              className="weekColumn"
              key={`column-${index}`}
              style={{
                gridColumn: index + 2,
                gridRow: "2 / span 48"
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
