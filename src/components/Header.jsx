import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function readAuthUser() {
  const token = localStorage.getItem('novelv_access_token');
  const rawUser = localStorage.getItem('novelv_user');

  if (!token || !rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem('novelv_user');
    return null;
  }
}

function useAuthUser() {
  const [user, setUser] = useState(() => readAuthUser());

  useEffect(() => {
    const syncUser = () => setUser(readAuthUser());

    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);

    const intervalId = window.setInterval(syncUser, 1000);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
      window.clearInterval(intervalId);
    };
  }, []);

  return user;
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 3.5 3.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.7-4 4.4-6 8-6s6.3 2 8 6" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V4" />
      <path d="m6 10 6-6 6 6" />
      <path d="M5 20h14" />
    </svg>
  );
}

function Header({ onToggleSidebar }) {
  const user = useAuthUser();
  const isLoggedIn = Boolean(user);
  const isCreator = user?.roleName === 'ROLE_CREATOR'
    || user?.role === 'ROLE_CREATOR'
    || user?.authority === 'ROLE_CREATOR'
    || user?.roles?.some((role) => {
      if (typeof role === 'string') return role === 'ROLE_CREATOR';
      return role?.roleName === 'ROLE_CREATOR' || role?.name === 'ROLE_CREATOR' || role?.authority === 'ROLE_CREATOR';
    });

  return (
    <header className="app-header">
      <style>{`
        .app-header {
          position: sticky;
          top: 0;
          z-index: 30;
          display: grid;
          grid-template-columns: minmax(220px, 1fr) minmax(260px, 640px) minmax(220px, 1fr);
          align-items: center;
          gap: 24px;
          height: 56px;
          padding: 0 18px 0 12px;
          border-bottom: 1px solid #2a2a2a;
          background: rgba(15, 15, 15, 0.96);
          backdrop-filter: blur(14px);
          box-sizing: border-box;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .header-icon-button {
          display: inline-grid;
          width: 34px;
          height: 34px;
          padding: 0;
          place-items: center;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #d7dbe2;
          cursor: pointer;
        }

        .header-icon-button:hover {
          background: #222;
          color: #fff;
        }

        .header-icon-button svg,
        .header-login svg,
        .header-upload svg,
        .search-button svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2;
        }

        .header-logo {
          color: #fff;
          font-size: 22px;
          font-weight: 900;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
        }

        .search-form {
          display: grid;
          grid-template-columns: 1fr 58px;
          width: 100%;
          justify-self: center;
          height: 42px;
          border: 1px solid #2d2d2d;
          border-radius: 999px;
          overflow: hidden;
          background: #080808;
        }

        .search-form input {
          min-width: 0;
          padding: 0 20px;
          border: 0;
          outline: none;
          background: transparent;
          color: #e9edf5;
          font-size: 15px;
        }

        .search-form input::placeholder {
          color: #8d94a0;
        }

        .search-button {
          display: inline-grid;
          place-items: center;
          border: 0;
          border-left: 1px solid #2d2d2d;
          background: #2d2d2d;
          color: #aab2bf;
          cursor: pointer;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: flex-end;
          min-width: 0;
        }

        .header-upload {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 36px;
          padding: 0 16px;
          border: 1px solid #333438;
          border-radius: 999px;
          background: #2a2a2b;
          color: #eef1f6;
          font-size: 14px;
          font-weight: 800;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease;
        }

        .header-upload:hover {
          border-color: #46484e;
          background: #353537;
          color: #fff;
          opacity: 0.98;
        }

        .header-upload:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.42);
          outline-offset: 3px;
        }

        .header-login {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 34px;
          padding: 0 18px;
          border: 1px solid #ff2b7a;
          border-radius: 999px;
          background: transparent;
          color: #ff2b7a;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          transition: background 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease;
        }

        .header-login:hover {
          border-color: #ff6fa6;
          background: rgba(255, 43, 122, 0.12);
          color: #ff6fa6;
          opacity: 0.98;
        }

        @media (max-width: 1200px) {
          .app-header {
            grid-template-columns: minmax(180px, 1fr) minmax(260px, 560px) minmax(180px, 1fr);
          }
        }

        @media (max-width: 900px) {
          .app-header {
            grid-template-columns: auto 1fr auto;
            gap: 12px;
          }

          .header-logo {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .app-header {
            height: auto;
            grid-template-columns: 1fr auto;
            padding: 10px 12px;
          }

          .search-form {
            grid-column: 1 / -1;
            grid-row: 2;
          }
        }
      `}</style>

      <div className="header-left">
        <button className="header-icon-button" type="button" onClick={onToggleSidebar} aria-label="사이드바 열기/닫기">
          <MenuIcon />
        </button>
        <Link className="header-logo" to="/">Novelv</Link>
      </div>

      <form className="search-form">
        <input type="search" placeholder="작품, 채널, 태그 검색..." aria-label="검색어" />
        <button className="search-button" type="submit" aria-label="검색">
          <SearchIcon />
        </button>
      </form>

      <div className="header-right">
        {isCreator ? (
          <Link className="header-upload" to="/creator/upload">
            <UploadIcon />
            업로드
          </Link>
        ) : null}
        {!isLoggedIn ? (
          <Link className="header-login" to="/login">
            <UserIcon />
            로그인
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
