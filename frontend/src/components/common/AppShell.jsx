import React from "react";
import { Bot } from "lucide-react";

export default function AppShell({ children, page, setPage, openChat }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <button
            className="brand"
            type="button"
            onClick={() => setPage("home")}
            aria-label="Go to homepage"
          >
          <img
              src="/images/kev-logo.jpg"
              alt="KEV logo"
              className="brand-logo"
            />

            <div className="brand-text">
              <strong>Kenya Aviation Site</strong>
              <span>Premium air travel</span>
            </div>
          </button>

          <nav className="main-nav">
            <button
              type="button"
              className={page === "home" ? "active" : ""}
              onClick={() => setPage("home")}
            >
              Home
            </button>

            <button
              type="button"
              className={page === "search" ? "active" : ""}
              onClick={() => setPage("search")}
            >
              Book
            </button>

            <button
              type="button"
              className={page === "checkin" ? "active" : ""}
              onClick={() => setPage("checkin")}
            >
              Check-in
            </button>

            <button
              type="button"
              className={page === "admin" ? "active" : ""}
              onClick={() => setPage("admin")}
            >
              Admin
            </button>

            <button
              type="button"
              className="travel-assistant-button"
              onClick={openChat}
            >
              <Bot size={16} />
              Travel Assistant
            </button>
          </nav>
        </div>

        <div className="header-aircraft">
          <img src="/images/kev-flying.jpg" alt="" />
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>Kenya Aviation Site</strong>
            <p>Book, manage and prepare for your journey.</p>
          </div>

          <div className="footer-copyright">
            Copyright © 2026 Kenya Aviation Site. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
