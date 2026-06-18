import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replace(/\. /g, '.').replace('.', '.');
}

function providerLabel(provider) {
  const normalized = String(provider || '').toUpperCase();
  if (normalized === 'KAKAO') return 'Kakao 소셜 로그인';
  if (normalized === 'GOOGLE') return 'Google 소셜 로그인';
  if (normalized === 'NAVER') return 'Naver 소셜 로그인';
  return '-';
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8.5" r="4" />
      <path d="M5 21c1.4-4 3.8-6 7-6s5.6 2 7 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventNotification, setEventNotification] = useState(false);

  useEffect(() => {
    let ignore = false;

    api.get('/users/me')
      .then(({ data }) => {
        if (ignore) return;
        setUser(data);
        localStorage.setItem('novelv_user', JSON.stringify(data));
      })
      .catch(() => {
        if (ignore) return;
        setError('계정 정보를 불러오지 못했습니다. 다시 로그인해 주세요.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const userId = user?.userId || user?.id || '-';
  const nickname = user?.nickname || 'Novelv 회원';
  const email = user?.email || '-';
  const joinedAt = useMemo(() => formatDate(user?.createdAt), [user?.createdAt]);

  const handleCopyUserId = async () => {
    if (!userId || userId === '-') return;
    await navigator.clipboard.writeText(String(userId));
  };

  return (
    <section className="account-settings-page">
      <style>{`
        .account-settings-page {
          min-height: 100%;
          display: flex;
          justify-content: center;
          padding: 28px 24px 72px;
          background: #090909;
          color: #fff;
          box-sizing: border-box;
        }

        .settings-container {
          width: min(100%, 820px);
        }

        .settings-title {
          margin: 0 0 28px;
          font-size: 24px;
          font-weight: 950;
          line-height: 1;
          letter-spacing: 0;
        }

        .settings-card {
          border-radius: 10px;
          background: #272728;
          box-sizing: border-box;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 132px;
          padding: 28px 24px;
        }

        .profile-avatar-large {
          display: grid;
          width: 64px;
          height: 64px;
          min-width: 64px;
          place-items: center;
          border-radius: 999px;
          background: #3c3c3e;
          color: #babec7;
        }

        .profile-avatar-large svg {
          width: 36px;
          height: 36px;
          fill: currentColor;
        }

        .profile-main {
          min-width: 0;
        }

        .grade-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;
        }

        .grade-badge {
          display: inline-grid;
          height: 28px;
          padding: 0 12px;
          place-items: center;
          border-radius: 6px;
          background: #353a49;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          line-height: 1;
        }

        .grade-help {
          display: inline-grid;
          width: 21px;
          height: 21px;
          place-items: center;
          border: 1px solid #50515a;
          border-radius: 999px;
          color: #aaaeb8;
          font-size: 12px;
          font-weight: 900;
        }

        .settings-nickname {
          margin: 0 0 8px;
          overflow: hidden;
          color: #fff;
          font-size: 21px;
          font-weight: 950;
          line-height: 1.2;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .member-row {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #c9ced8;
          font-size: 13px;
          font-weight: 700;
        }

        .member-id {
          color: #fff;
          font-weight: 900;
        }

        .copy-button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #dfe3ea;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .copy-button:hover {
          color: #fff;
        }

        .notification-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          margin-top: 16px;
          padding: 0 24px;
        }

        .notification-label {
          color: #fff;
          font-size: 16px;
          font-weight: 900;
        }

        .switch {
          position: relative;
          display: inline-flex;
          width: 44px;
          height: 24px;
        }

        .switch input {
          position: absolute;
          opacity: 0;
        }

        .switch-slider {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: #454547;
          cursor: pointer;
          transition: background 160ms ease;
        }

        .switch-slider::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #fff;
          transition: transform 160ms ease;
        }

        .switch input:checked + .switch-slider {
          background: #ff2b7a;
        }

        .switch input:checked + .switch-slider::before {
          transform: translateX(20px);
        }

        .info-card {
          margin-top: 16px;
          padding: 28px 24px 24px;
        }

        .info-title {
          margin: 0 0 24px;
          color: #fff;
          font-size: 17px;
          font-weight: 950;
        }

        .info-grid {
          display: grid;
          gap: 20px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 24px;
          align-items: center;
          color: #b7bdc8;
          font-size: 15px;
          font-weight: 700;
        }

        .info-value {
          justify-self: end;
          color: #fff;
          text-align: right;
          font-weight: 800;
        }

        .menu-card {
          display: grid;
          margin-top: 16px;
          overflow: hidden;
        }

        .settings-menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 48px;
          padding: 0 18px;
          color: #fff;
          font-size: 15px;
          font-weight: 850;
          text-decoration: none;
        }

        .settings-menu-link + .settings-menu-link {
          border-top: 1px solid #3b3b3c;
        }

        .settings-menu-link:hover {
          background: #303032;
        }

        .settings-menu-link svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: #aeb4bf;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .settings-loading,
        .settings-error {
          padding: 48px 0;
          color: #b8bec8;
          font-size: 15px;
          font-weight: 800;
        }

        @media (max-width: 640px) {
          .account-settings-page {
            padding: 24px 16px 56px;
          }

          .profile-card {
            align-items: flex-start;
            padding: 22px 18px;
          }

          .info-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .info-value {
            justify-self: start;
            text-align: left;
          }
        }
      `}</style>

      <div className="settings-container">
        <h1 className="settings-title">계정 설정</h1>

        {loading ? <div className="settings-loading">계정 정보를 불러오는 중입니다.</div> : null}
        {!loading && error ? <div className="settings-error">{error}</div> : null}

        {!loading && !error && user ? (
          <>
            <section className="settings-card profile-card" aria-label="프로필 정보">
              <div className="profile-avatar-large"><UserIcon /></div>
              <div className="profile-main">
                <div className="grade-row">
                  <span className="grade-badge">일반 등급</span>
                  <span className="grade-help">?</span>
                </div>
                <h2 className="settings-nickname">{nickname}</h2>
                <div className="member-row">
                  <span>회원번호: <strong className="member-id">{userId}</strong></span>
                  <button className="copy-button" type="button" onClick={handleCopyUserId}>복사</button>
                </div>
              </div>
            </section>

            <section className="settings-card notification-card" aria-label="알림 설정">
              <span className="notification-label">이벤트 알림 수신</span>
              <label className="switch" aria-label="이벤트 알림 수신">
                <input
                  type="checkbox"
                  checked={eventNotification}
                  onChange={(event) => setEventNotification(event.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </section>

            <section className="settings-card info-card" aria-label="계정 정보">
              <h2 className="info-title">계정 정보</h2>
              <div className="info-grid">
                <div className="info-row"><span>이메일</span><strong className="info-value">{email}</strong></div>
                <div className="info-row"><span>가입 방식</span><strong className="info-value">{providerLabel(user.provider)}</strong></div>
                <div className="info-row"><span>가입일</span><strong className="info-value">{joinedAt}</strong></div>
              </div>
            </section>

            <nav className="settings-card menu-card" aria-label="계정 메뉴">
              <Link className="settings-menu-link" to="/#"><span>프로필 편집</span><ArrowIcon /></Link>
              <Link className="settings-menu-link" to="/#"><span>회원 탈퇴</span><ArrowIcon /></Link>
            </nav>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default AccountSettings;