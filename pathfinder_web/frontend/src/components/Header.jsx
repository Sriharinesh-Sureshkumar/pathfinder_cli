export default function Header({ theme, onToggleTheme, onShowAbout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          pathfinder<span className="logo-accent">.cli</span>
        </div>
        <nav className="header-links">
          <a
            href="https://github.com/Sriharinesh-Sureshkumar/pathfinder_cli"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://github.com/Sriharinesh-Sureshkumar/pathfinder_cli#readme"
            target="_blank"
            rel="noreferrer"
          >
            CLI Docs
          </a>
          <button className="link-button" onClick={onShowAbout}>
            About
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle dark or light mode"
          >
            <span className={`theme-toggle-knob ${theme === 'light' ? 'theme-toggle-knob-light' : ''}`} />
          </button>
        </nav>
      </div>
    </header>
  )
}
