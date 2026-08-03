export default function CaseLoading() {
  return (
    <div className="shell" aria-busy="true">
      <div className="case-loading">
        <div className="case-hero case-loading-hero">
          <div className="case-loading-bar short" />
          <div className="case-loading-bar title" />
          <div className="case-loading-bar medium" />
          <div className="case-loading-facts">
            <div className="case-loading-bar tall" />
            <div className="case-loading-bar tall" />
            <div className="case-loading-bar tall" />
          </div>
        </div>
        <div className="case-loading-bar day" />
        <div className="card">
          <div className="card-b">
            <div className="case-loading-bar medium" />
            <div className="case-loading-bar long" />
            <div className="case-loading-bar long" />
          </div>
        </div>
        <span className="sr-only">Loading case status</span>
      </div>
    </div>
  );
}
