export default function MembersLoading() {
  return (
    <main className="shell">
      <section className="pageHeader">
        <div>
          <div className="skeletonLine tiny" />
          <div className="skeletonLine title" />
          <div className="skeletonLine subtitle" />
        </div>
      </section>

      <section className="statsGrid">
        <div className="statCard skeletonPanel">
          <div className="skeletonLine medium" />
          <div className="skeletonLine title" />
        </div>
        <div className="statCard skeletonPanel">
          <div className="skeletonLine medium" />
          <div className="skeletonLine title" />
        </div>
        <div className="statCard skeletonPanel">
          <div className="skeletonLine medium" />
          <div className="skeletonLine title" />
        </div>
      </section>

      <section className="panel dashboardPanel skeletonPanel">
        <div className="skeletonLine medium" />
        <div className="skeletonBox input" />
      </section>

      <section className="dashboardGrid">
        <div className="panel dashboardPanel skeletonPanel">
          <div className="skeletonLine medium" />
          <div className="skeletonBox input" />
        </div>
        <div className="panel dashboardPanel skeletonPanel">
          <div className="skeletonLine medium" />
          <div className="skeletonBox input" />
        </div>
      </section>
    </main>
  );
}
