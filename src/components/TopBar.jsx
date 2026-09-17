export default function TopBar({ searchTerm, onSearchChange, onAddClick }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="mark">
          JobTrack<span className="dot">.</span>
        </div>
        <div className="tagline">Your job search, logged in one console.</div>
      </div>
      <div className="topbar-actions">
        <input
          className="search-box"
          type="text"
          placeholder="Search company or role…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onAddClick}>
          + Log application
        </button>
      </div>
    </div>
  );
}
