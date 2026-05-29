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

      <section className="gridTwo">
        <div className="panel formPanel skeletonPanel">
          <div className="skeletonLine medium" />
          <div className="skeletonBox input" />
          <div className="skeletonBox input" />
          <div className="lessonInputs">
            <div className="skeletonBox input" />
            <div className="skeletonBox input" />
          </div>
          <div className="skeletonBox textarea" />
        </div>

        <section className="memberList">
          <div className="listHeader">
            <div className="skeletonLine medium" />
          </div>
          <div className="cards">
            <div className="memberCard skeletonCard" />
            <div className="memberCard skeletonCard" />
            <div className="memberCard skeletonCard" />
          </div>
        </section>
      </section>
    </main>
  );
}
