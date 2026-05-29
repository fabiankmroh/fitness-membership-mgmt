export default function MemberDetailLoading() {
  return (
    <main className="shell narrowShell">
      <div className="skeletonLine backLinkSkeleton" />

      <section className="pageHeader detailHeader">
        <div>
          <div className="skeletonLine tiny" />
          <div className="skeletonLine title" />
          <div className="skeletonLine subtitle" />
        </div>
        <div className="lessonBadge skeletonBadge" />
      </section>

      <div className="panel formPanel skeletonPanel">
        <div className="skeletonBox input" />
        <div className="skeletonBox input" />
        <div className="lessonInputs">
          <div className="skeletonBox input" />
          <div className="skeletonBox input" />
        </div>
        <div className="skeletonBox textarea" />
      </div>

      <section className="panel lessonLogSection">
        <div className="lessonLogHeader">
          <div>
            <div className="skeletonLine tiny" />
            <div className="skeletonLine medium" />
          </div>
          <div className="skeletonBox button" />
        </div>
        <div className="lessonRows">
          <div className="lessonRow skeletonRow" />
          <div className="lessonRow skeletonRow" />
        </div>
      </section>
    </main>
  );
}
