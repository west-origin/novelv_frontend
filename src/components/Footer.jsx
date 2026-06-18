import { Link } from 'react-router-dom';

const policyLinks = [
  { label: '이용약관', to: '/#' },
  { label: '개인정보처리방침', to: '/#' },
  { label: '청소년 보호정책', to: '/#' },
  { label: '운영정책', to: '/#' },
  { label: '고객센터', to: '/#' },
];

const socialLinks = [
  { label: 'Play스토어', icon: PlayStoreIcon, href: '/#' },
  { label: 'X', icon: XIcon, href: '/#' },
  { label: '인스타그램', icon: InstagramIcon, href: '/#' },
  { label: '틱톡', icon: TiktokIcon, href: '/#' },
  { label: '네이버 블로그', icon: NaverIcon, href: '/#' },
];

function PlayStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4.5v15l12-7.5z" />
      <path d="m6 4.5 8.5 8M6 19.5l8.5-7.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M16.5 7.8h.01" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 4v11.3a4 4 0 1 1-3.5-4" />
      <path d="M13 4c1 3 2.8 4.7 6 5" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 19V5h4.1l5.8 8.1V5H19v14h-4.1L9.1 10.9V19z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <style>{`
        .app-footer {
          width: 100%;
          border-top: 1px solid #242424;
          background: #0b0b0c;
          color: #747b86;
          box-sizing: border-box;
        }

        .footer-inner {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr) 180px;
          align-items: flex-start;
          gap: 48px;
          width: min(100%, 1200px);
          min-height: 190px;
          margin: 0 auto;
          padding: 34px 28px 28px;
          box-sizing: border-box;
        }

        .footer-company {
          width: 360px;
          min-width: 0;
          justify-self: start;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          margin-bottom: 24px;
          color: #aaaeb6;
          font-size: 22px;
          font-weight: 950;
          line-height: 1;
          text-decoration: none;
          letter-spacing: 0;
        }

        .footer-logo-accent {
          margin-left: 1px;
          color: #ff2b7a;
        }

        .footer-info {
          display: grid;
          gap: 6px;
          margin: 0;
          color: #7e8794;
          font-size: 13px;
          font-style: normal;
          font-weight: 600;
          line-height: 1.35;
        }

        .footer-copy {
          margin: 22px 0 0;
          color: #626a75;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.35;
        }

        .footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          justify-self: center;
          flex-wrap: wrap;
          gap: 0;
          width: 100%;
          min-width: 0;
          padding-top: 4px;
          text-align: center;
        }

        .footer-link {
          color: #c5cad2;
          font-size: 13px;
          font-weight: 800;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
        }

        .footer-link:hover {
          color: #fff;
        }

        .footer-link + .footer-link::before {
          content: "";
          display: inline-block;
          width: 1px;
          height: 10px;
          margin: 0 13px;
          background: #4a4f58;
          vertical-align: -1px;
        }

        .footer-socials {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          justify-self: end;
          gap: 15px;
          width: 180px;
          min-width: 0;
          padding-top: 0;
        }

        .footer-social-link {
          display: inline-grid;
          width: 24px;
          height: 24px;
          place-items: center;
          color: #aeb3bb;
          text-decoration: none;
          transition: color 160ms ease, transform 160ms ease;
        }

        .footer-social-link:hover {
          color: #fff;
          transform: translateY(-1px);
        }

        .footer-social-link svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .footer-social-link:last-child svg {
          fill: currentColor;
          stroke: none;
        }

        @media (max-width: 980px) {
          .footer-inner {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .footer-company {
            width: 100%;
            justify-self: stretch;
          }

          .footer-links {
            justify-content: flex-start;
            justify-self: start;
            text-align: left;
          }

          .footer-socials {
            justify-content: flex-start;
            justify-self: start;
            width: auto;
          }
        }

        @media (max-width: 640px) {
          .footer-inner {
            min-height: auto;
            padding: 28px 20px 30px;
          }

          .footer-links {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .footer-link + .footer-link::before {
            display: none;
          }
        }
      `}</style>

      <div className="footer-inner">
        <div className="footer-company">
          <Link className="footer-logo" to="/" aria-label="Novelv 홈으로 이동">
            Novel<span className="footer-logo-accent">v</span>
          </Link>

          <address className="footer-info">
            <span>노벨브주식회사</span>
            <span>세종특별시 나성동</span>
            <span>사업자등록번호: xxx-xx-xxxxx | 대표자: 서기원</span>
            <span>통신판매업번호: 2024-xxxx-0264호</span>
            <span>고객센터: 010-2232-0688</span>
            <span>이메일: mrkiwonseo@gmail.com</span>
          </address>

          <p className="footer-copy">© 2026 노벨브주식회사. All Rights Reserved.</p>
        </div>

        <nav className="footer-links" aria-label="푸터 약관 링크">
          {policyLinks.map((link) => (
            <Link className="footer-link" key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-socials" aria-label="소셜 링크">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a className="footer-social-link" href={item.href} key={item.label} aria-label={item.label}>
                <Icon />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}

export default Footer;