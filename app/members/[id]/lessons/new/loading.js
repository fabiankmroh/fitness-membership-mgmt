export default function NewLessonLoading() {
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

      <div className="panel formPanel lessonForm skeletonPanel">
        <div className="exercisePicker">
          <div>
            <div className="skeletonLine tiny" />
            <div className="skeletonLine medium" />
          </div>
          <div className="categoryTabs">
            <div className="skeletonBox pill" />
            <div className="skeletonBox pill" />
            <div className="skeletonBox pill" />
            <div className="skeletonBox pill" />
          </div>
          <div className="exerciseChoices">
            <div className="skeletonBox choice" />
            <div className="skeletonBox choice" />
            <div className="skeletonBox choice" />
            <div className="skeletonBox choice" />
            <div className="skeletonBox choice" />
          </div>
        </div>

        <div className="selectedExerciseSection">
          <div className="skeletonLine medium" />
          <div className="lessonEmpty">
            <div className="skeletonLine medium" />
            <div className="skeletonLine subtitle" />
          </div>
        </div>

        <div className="skeletonBox textarea" />
        <div className="skeletonBox signature" />
      </div>
    </main>
  );
}
