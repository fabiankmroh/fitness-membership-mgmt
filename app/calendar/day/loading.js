export default function CalendarDayLoading() {
  return (
    <main className="shell narrowShell">
      <div className="skeletonLine backLinkSkeleton" />
      <section className="pageHeader">
        <div>
          <div className="skeletonLine tiny" />
          <div className="skeletonLine title" />
          <div className="skeletonLine subtitle" />
        </div>
      </section>
      <section className="panel dashboardPanel skeletonPanel">
        <div className="skeletonBox input" />
        <div className="skeletonBox input" />
      </section>
    </main>
  );
}
