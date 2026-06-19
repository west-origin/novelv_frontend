import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const ROLE_LABEL_FALLBACK = {
  ROLE_GUEST: '비회원',
  ROLE_USER: '일반 회원',
  ROLE_CREATOR: '크리에이터',
  ROLE_MODERATOR: '매니저',
  ROLE_MANAGER: '매니저',
  ROLE_ADMIN: '관리자',
};

const ROLE_PRIORITY = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_MANAGER', 'ROLE_CREATOR', 'ROLE_USER', 'ROLE_GUEST'];

const navSections = [
  [
    { icon: HomeIcon, label: '홈', to: '/' },
    { icon: ReviewIcon, label: '리뷰' },
    { icon: SeriesIcon, label: '시리즈' },
    { icon: SparkleIcon, label: '신작' },
    { icon: TrendIcon, label: 'TOP100' },
    { icon: GridIcon, label: '장르' },
  ],
  [
    { icon: PeopleIcon, label: '팔로잉' },
    { icon: BookmarkIcon, label: '내 서재' },
    { icon: CartIcon, label: '장바구니' },
    { icon: ClockIcon, label: '시청기록' },
  ],
  [
    { icon: TagIcon, label: '할인' },
    { icon: GiftIcon, label: '선물함' },
    { icon: CalendarIcon, label: '이벤트' },
    { icon: CheckIcon, label: '출석체크' },
    { icon: TicketIcon, label: '쿠폰' },
  ],
  [
    { icon: SettingsIcon, label: '설정', to: '/settings' },
    { icon: NoticeIcon, label: '공지사항' },
    { icon: HelpIcon, label: '고객센터' },
    { icon: PenIcon, label: '크리에이터' },
  ],
];

function readAuthUser() {
  const token = localStorage.getItem('novelv_access_token');
  const rawUser = localStorage.getItem('novelv_user');

  if (!token || !rawUser) return null;

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

function normalizeRole(role) {
  if (!role) return null;

  if (typeof role === 'string') {
    return {
      roleName: role,
      description: ROLE_LABEL_FALLBACK[role] || role.replace(/^ROLE_/, ''),
    };
  }

  const roleName = role.roleName || role.name || role.authority;
  if (!roleName) return null;

  return {
    roleName,
    description: role.description || ROLE_LABEL_FALLBACK[roleName] || roleName.replace(/^ROLE_/, ''),
  };
}

function getPrimaryRole(user) {
  const normalizedRoles = Array.isArray(user?.roles)
    ? user.roles.map(normalizeRole).filter(Boolean)
    : [];

  return ROLE_PRIORITY
    .map((roleName) => normalizedRoles.find((role) => role.roleName === roleName))
    .find(Boolean) || normalizedRoles[0] || normalizeRole('ROLE_USER');
}

function MenuIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

function BaseIcon({ children }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

function HomeIcon() {
  return <BaseIcon><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5h5v5" /></BaseIcon>;
}

function ReviewIcon() {
  return <BaseIcon><path d="M5 5h14v10H8l-3 3z" /><path d="M8 9h8M8 12h5" /></BaseIcon>;
}

function SeriesIcon() {
  return <BaseIcon><path d="M6 4h12v16H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></BaseIcon>;
}

function SparkleIcon() {
  return <BaseIcon><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></BaseIcon>;
}

function TrendIcon() {
  return <BaseIcon><path d="M4 17 9 12l4 4 7-9" /><path d="M15 7h5v5" /></BaseIcon>;
}

function GridIcon() {
  return <BaseIcon><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z" /></BaseIcon>;
}

function PeopleIcon() {
  return <BaseIcon><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M3.5 20c.8-3.4 2.7-5 5.5-5s4.7 1.6 5.5 5" /><path d="M16 11a2.5 2.5 0 1 0 0-5" /><path d="M15.5 15c2.4.1 4 1.7 5 5" /></BaseIcon>;
}

function BookmarkIcon() {
  return <BaseIcon><path d="M7 4h10v16l-5-3-5 3z" /></BaseIcon>;
}

function CartIcon() {
  return <BaseIcon><path d="M4 5h2l2 10h9l2-7H7" /><circle cx="9" cy="19" r="1.4" /><circle cx="17" cy="19" r="1.4" /></BaseIcon>;
}

function ClockIcon() {
  return <BaseIcon><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></BaseIcon>;
}

function TagIcon() {
  return <BaseIcon><path d="M4 12 12 4h7v7l-8 8z" /><circle cx="16" cy="8" r="1" /></BaseIcon>;
}

function GiftIcon() {
  return <BaseIcon><path d="M4 10h16v10H4z" /><path d="M3 7h18v3H3zM12 7v13" /><path d="M12 7c-3 0-5-.8-5-2.3C7 3.8 7.8 3 8.8 3 10.3 3 11.4 4.7 12 7z" /><path d="M12 7c3 0 5-.8 5-2.3 0-.9-.8-1.7-1.8-1.7-1.5 0-2.6 1.7-3.2 4z" /></BaseIcon>;
}

function CalendarIcon() {
  return <BaseIcon><path d="M5 5h14v15H5z" /><path d="M8 3v4M16 3v4M5 10h14" /></BaseIcon>;
}

function CheckIcon() {
  return <BaseIcon><circle cx="12" cy="12" r="8" /><path d="m8.5 12.5 2.2 2.2 4.8-5.2" /></BaseIcon>;
}

function TicketIcon() {
  return <BaseIcon><path d="M5 7h14v4a2 2 0 0 0 0 4v4H5v-4a2 2 0 0 0 0-4z" /><path d="M12 8v2M12 14v2" /></BaseIcon>;
}

function SettingsIcon() {
  return <BaseIcon><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5 6.8 15M17.2 9l2.6-1.5" /></BaseIcon>;
}

function NoticeIcon() {
  return <BaseIcon><path d="M5 12h3l9-5v10l-9-5H5z" /><path d="M8 12v6" /></BaseIcon>;
}

function HelpIcon() {
  return <BaseIcon><circle cx="12" cy="12" r="8" /><path d="M9.8 9.5A2.3 2.3 0 0 1 12 8c1.3 0 2.4.8 2.4 2.1 0 1.7-2.4 1.9-2.4 4" /><path d="M12 17h.01" /></BaseIcon>;
}

function PenIcon() {
  return <BaseIcon><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10z" /><path d="m13.5 7 3.5 3.5" /></BaseIcon>;
}

function EditIcon() {
  return <BaseIcon><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" /></BaseIcon>;
}

function Sidebar({ isSidebarOpen, onToggle }) {
  const user = useAuthUser();
  const isLoggedIn = Boolean(user);
  const nickname = useMemo(() => user?.nickname || user?.email || 'Novelv 회원', [user]);
  const primaryRole = useMemo(() => getPrimaryRole(user), [user]);
  const roleName = primaryRole?.roleName;
  const roleDescription = user?.roleDescription || primaryRole?.description || roleName?.replace(/^ROLE_/, '') || '';
  const coinBalance = user?.coin ?? user?.coinBalance ?? 0;
  const bonusBalance = user?.bonus ?? user?.bonusBalance ?? 0;

  const isUserRole = roleName === 'ROLE_USER';
  const isCreatorRole = roleName === 'ROLE_CREATOR';
  const isManagerRole = roleName === 'ROLE_MODERATOR' || roleName === 'ROLE_MANAGER';
  const isAdminRole = roleName === 'ROLE_ADMIN';
  const showEditIcon = isUserRole || isCreatorRole;

  const handleLogout = () => {
    localStorage.removeItem('novelv_access_token');
    localStorage.removeItem('novelv_user');
    window.dispatchEvent(new Event('storage'));
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const content = (
      <>
        <span className="nav-icon"><Icon /></span>
        {isSidebarOpen ? <span className="nav-label">{item.label}</span> : null}
      </>
    );

    if (item.to) {
      return (
        <NavLink className={({ isActive }) => `side-nav-item${isActive ? ' active' : ''}`} end={item.to === '/'} key={item.label} to={item.to}>
          {content}
        </NavLink>
      );
    }

    return <button className="side-nav-item" key={item.label} type="button">{content}</button>;
  };

  return (
    <aside className={`home-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <style>{`
        .home-sidebar { position: sticky; top: 56px; height: calc(100svh - 56px); display: flex; flex-direction: column; border-right: 1px solid #202020; background: #0f0f10; transition: width 180ms ease; overflow: hidden; }
        .home-sidebar.open { width: 240px; }
        .home-sidebar.closed { width: 64px; }
        .sidebar-top { display: none; }
        .sidebar-menu-button { display: inline-grid; width: 34px; height: 34px; padding: 0; place-items: center; border: 0; border-radius: 8px; background: transparent; color: #d7dbe2; cursor: pointer; }
        .sidebar-menu-button:hover { background: #222; color: #fff; }
        .sidebar-menu-button svg, .nav-icon svg, .profile-avatar svg, .profile-edit-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2; }
        .sidebar-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .sidebar-brand strong { color: #fff; font-size: 22px; font-weight: 900; line-height: 1; white-space: nowrap; }
        .sidebar-age-badge { display: inline-grid; width: 44px; height: 24px; place-items: center; border-radius: 999px; background: #4b5565; color: #fff; font-size: 12px; font-weight: 900; line-height: 1; box-shadow: inset 0 0 0 2px #687386; }
        .sidebar-profile { margin: 12px 10px 8px; padding: 12px; border-radius: 8px; background: #2a2a2b; color: #f6f7fb; box-sizing: border-box; }
        .home-sidebar.closed .sidebar-profile { display: grid; place-items: center; width: 44px; height: 44px; margin: 10px auto 8px; padding: 0; border-radius: 999px; background: #ffd51f; color: #1b1b1b; }
        .profile-head { display: flex; align-items: center; gap: 9px; min-width: 0; }
        .profile-avatar { display: inline-grid; width: 22px; height: 22px; min-width: 22px; place-items: center; border-radius: 999px; background: #ffd51f; color: #111; }
        .profile-name-link { min-width: 0; display: inline-flex; align-items: center; max-width: 100%; padding: 3px 0; color: inherit; line-height: 1.2; text-decoration: none; cursor: pointer; transition: opacity 160ms ease, color 160ms ease; }
        .profile-name-link:hover { opacity: 0.72; }
        .profile-name-link:focus-visible { outline: 2px solid rgba(255, 43, 122, 0.8); outline-offset: 3px; border-radius: 4px; }
        .profile-name-text { min-width: 0; overflow: hidden; color: #ffffff; font-size: 13px; font-weight: 300; text-overflow: ellipsis; white-space: nowrap; }
        .profile-name-suffix { flex: 0 0 auto; color: #aeb4bf; font-size: 13px; font-weight: 300; line-height: 1.2; white-space: nowrap; }
        .profile-edit-icon { display: inline-grid; width: 1.2em; height: 1.2em; margin-left: 0; place-items: center; color: #b9bec8; font-size: 13px; line-height: 1.2; }
        .profile-edit-icon svg { width: 100%; height: 100%; stroke-width: 2.2; }
        .profile-name-link:hover .profile-name-text { color: #d9dde5; }
        .profile-name-link:hover .profile-name-suffix, .profile-name-link:hover .profile-edit-icon { color: #8e95a1; }
        .profile-badge, .card-badge { display: inline-grid; align-items: center; justify-content: center; place-items: center; text-align: center; line-height: 1; white-space: nowrap; }
        .profile-badge { height: 20px; min-width: 34px; padding: 0 8px; border-radius: 5px; background: #ff2b7a; color: #fff; font-size: 11px; font-weight: 900; }
        .profile-wallet { display: grid; gap: 7px; margin-top: 12px; }
        .wallet-row { display: flex; align-items: center; gap: 8px; color: #cfd4dc; font-size: 13px; font-weight: 700; }
        .wallet-dot { width: 12px; height: 12px; border-radius: 999px; }
        .wallet-dot.coin { background: #ffd51f; }
        .wallet-dot.bonus { background: #9bb7d7; }
        .wallet-value { margin-left: 2px; color: #fff; font-weight: 950; }
        .coin-charge, .role-action-button { display: grid; width: 100%; height: 38px; margin-top: 10px; padding: 0; place-items: center; border: 0; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 950; line-height: 1; text-align: center; text-decoration: none; cursor: pointer; box-sizing: border-box; }
        .coin-charge { background: #ff2b7a; }
        .coin-charge:hover { background: #ff4d91; }
        .role-action-button { background: #3b3f46; }
        .role-action-button:hover { background: #4b515c; }
        .role-action-button.creator { background: #ff2b7a; }
        .role-action-button.creator:hover { background: #ff4d91; }
        .role-action-button.manager { background: #52606d; }
        .role-action-button.manager:hover { background: #657484; }
        .role-action-button.admin { background: #c33b52; }
        .role-action-button.admin:hover { background: #d64a62; }
        .side-nav { padding: 8px 10px 10px; overflow: hidden auto; scrollbar-width: none; -ms-overflow-style: none; }
        .side-nav::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .side-nav-section { display: grid; gap: 3px; padding: 0 0 12px; margin-bottom: 12px; border-bottom: 1px solid #303030; }
        .side-nav-section:last-child { border-bottom: 0; }
        .side-nav-item { display: flex; align-items: center; gap: 14px; width: 100%; height: 40px; padding: 0 14px; border: 0; border-radius: 8px; background: transparent; color: #cfd4dc; font-size: 14px; font-weight: 700; text-align: left; text-decoration: none; box-sizing: border-box; cursor: pointer; }
        .home-sidebar.closed .side-nav-item { justify-content: center; padding: 0; }
        .side-nav-item:hover, .side-nav-item.active { background: #3a3a3a; color: #fff; }
        .nav-icon { display: inline-grid; width: 20px; min-width: 20px; place-items: center; color: #d9dde5; line-height: 1; }
        .side-nav-item:hover .nav-icon, .side-nav-item.active .nav-icon { color: #fff; }
        .auth-panel, .logged-in-panel { display: grid; gap: 10px; margin-top: auto; padding: 10px 12px 22px; border-top: 1px solid #303030; }
        .login-full, .signup-full, .logout-full { display: inline-grid; height: 42px; place-items: center; border-radius: 8px; font-size: 15px; font-weight: 900; line-height: 1; text-align: center; text-decoration: none; transition: background 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease; cursor: pointer; }
        .login-full { border: 1px solid #ff2b7a; background: #ff2b7a; color: #fff; }
        .login-full:hover { border-color: #ff6fa6; background: #ff4d91; opacity: 0.96; }
        .signup-full, .logout-full { border: 1px solid #3d3d3f; background: transparent; color: #d8dde5; }
        .signup-full:hover, .logout-full:hover { border-color: #5a5a5f; background: #19191a; color: #fff; }
        @media (max-width: 900px) { .home-sidebar.open { width: 210px; } }
        @media (max-width: 640px) { .home-sidebar { position: fixed; top: 0; bottom: 0; z-index: 50; height: 100svh; box-shadow: 16px 0 38px rgba(0, 0, 0, 0.48); } .home-sidebar.closed { width: 0; } .home-sidebar.open { width: 240px; } .sidebar-top { display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 12px; border-bottom: 1px solid #2a2a2a; } }
      `}</style>

      <div className="sidebar-top">
        <button className="sidebar-menu-button" type="button" onClick={onToggle} aria-label="사이드바 열기/닫기"><MenuIcon /></button>
        {isSidebarOpen ? <div className="sidebar-brand"><strong>Novelv</strong><span className="sidebar-age-badge">19</span></div> : null}
      </div>

      {isLoggedIn ? (
        <section className="sidebar-profile" aria-label="내 프로필">
          <div className="profile-head">
            <span className="profile-avatar"><HomeIcon /></span>
            {isSidebarOpen ? (
              <>
                <Link className="profile-name-link" to="/settings" aria-label="계정 설정으로 이동">
                  <span className="profile-name-text">{nickname}</span>
                  <span className="profile-name-suffix"> 님</span>
                  {showEditIcon && <span className="profile-edit-icon" aria-hidden="true"><EditIcon /></span>}
                </Link>
                <span className="profile-badge">{roleDescription}</span>
              </>
            ) : null}
          </div>

          {isSidebarOpen ? (
            <>
                  <div className="profile-wallet">
                    <div className="wallet-row"><span className="wallet-dot coin" /> 코인 <strong className="wallet-value">{coinBalance}</strong></div>
                    <div className="wallet-row"><span className="wallet-dot bonus" /> 보너스 <strong className="wallet-value">{bonusBalance}</strong></div>
                  </div>
                  <button className="coin-charge" type="button">코인 충전하기</button>
              {isManagerRole && <Link className="role-action-button manager" to="/manager">매니저 페이지</Link>}
              {isAdminRole && <Link className="role-action-button admin" to="/admin">관리자 페이지</Link>}
            </>
          ) : null}
        </section>
      ) : null}

      <nav className="side-nav" aria-label="주요 메뉴">
        {navSections.map((section, sectionIndex) => <div className="side-nav-section" key={sectionIndex}>{section.map(renderNavItem)}</div>)}
      </nav>

      {isSidebarOpen && !isLoggedIn ? <div className="auth-panel"><Link className="login-full" to="/login">로그인</Link><Link className="signup-full" to="/register">무료 회원가입</Link></div> : null}
      {isSidebarOpen && isLoggedIn ? <div className="logged-in-panel"><button className="logout-full" type="button" onClick={handleLogout}>로그아웃</button></div> : null}
    </aside>
  );
}

export default Sidebar;
