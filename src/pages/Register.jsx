import { Link } from 'react-router-dom';

const oauthConfig = {
  kakao: {
    label: '카카오로 가입',
    shortLabel: 'K',
    className: 'kakao',
    authBaseUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
    scope: '',
  },
  google: {
    label: '구글로 가입',
    shortLabel: 'G',
    className: 'google',
    authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'email profile',
  },
  naver: {
    label: '네이버로 가입',
    shortLabel: 'N',
    className: 'naver',
    authBaseUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
    scope: '',
    state: import.meta.env.VITE_NAVER_STATE || 'novelv-local',
  },
};

const oauthProviders = Object.entries(oauthConfig).map(([id, config]) => ({ id, ...config }));

function buildOAuthUrl(provider) {
  const redirectUri = `${window.location.origin}/oauth/callback/${provider.id}`;
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  if (provider.scope) {
    params.set('scope', provider.scope);
  }

  if (provider.state) {
    params.set('state', provider.state);
  }

  return `${provider.authBaseUrl}?${params.toString()}`;
}

function isMissingClientId(clientId) {
  return !clientId || clientId.startsWith('YOUR_') || clientId.startsWith('your-');
}

function Register() {
  const handleSocialLogin = (provider) => {
    if (isMissingClientId(provider.clientId)) {
      alert(`${provider.label} 클라이언트 ID가 설정되지 않았습니다. D:\\work_space\\novelv-frontend\\.env 파일을 확인해 주세요.`);
      return;
    }

    window.location.assign(buildOAuthUrl(provider));
  };

  return (
    <section className="register-page">
      <style>{`
        .register-page {
          min-height: calc(100svh - 56px);
          display: grid;
          place-items: center;
          padding: 48px 24px;
          box-sizing: border-box;
          background: #090909;
          color: #fff;
        }

        .register-panel {
          width: min(100%, 520px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .register-logo {
          margin: 0 0 28px;
          color: #fff;
          font-size: 34px;
          font-weight: 950;
          line-height: 1;
          letter-spacing: 0;
        }

        .register-title {
          margin: 0 0 8px;
          color: #fff;
          font-size: 26px;
          font-weight: 950;
          line-height: 1.25;
          letter-spacing: 0;
        }

        .register-subtitle {
          margin: 0 0 26px;
          color: #b5bbc7;
          font-size: 14px;
          font-weight: 600;
        }

        .social-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 10px;
        }

        .social-button {
          display: inline-grid;
          width: 58px;
          height: 58px;
          place-items: center;
          border: 0;
          border-radius: 999px;
          color: #111;
          font-size: 24px;
          font-weight: 950;
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
        }

        .social-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.34);
          filter: brightness(1.04);
        }

        .social-button:focus-visible {
          outline: 3px solid #ff2b7a;
          outline-offset: 4px;
        }

        .social-button.kakao {
          background: #fee500;
          color: #181600;
        }

        .social-button.google {
          background: #fff;
          color: #4285f4;
        }

        .social-button.naver {
          background: #03c75a;
          color: #fff;
        }

        .quick-bubble {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          padding: 0 18px;
          margin-bottom: 36px;
          border: 1px solid #ff2b7a;
          border-radius: 999px;
          color: #ff2b7a;
          font-size: 13px;
          font-weight: 900;
        }

        .quick-bubble::before {
          content: "";
          position: absolute;
          top: -6px;
          left: 50%;
          width: 10px;
          height: 10px;
          border-top: 1px solid #ff2b7a;
          border-left: 1px solid #ff2b7a;
          background: #090909;
          transform: translateX(-50%) rotate(45deg);
        }

        .register-divider {
          margin: 0 0 14px;
          color: #b5bbc7;
          font-size: 14px;
          font-weight: 600;
        }

        .phone-register {
          width: 100%;
          height: 58px;
          border: 1px solid #3b3b3b;
          border-radius: 7px;
          background: transparent;
          color: #fff;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .phone-register:hover {
          border-color: #5a5a5a;
          background: #151515;
        }

        .register-login-link {
          margin-top: 34px;
          color: #aeb4bf;
          font-size: 14px;
          font-weight: 600;
        }

        .register-login-link a {
          color: #fff;
          text-decoration: underline;
        }
      `}</style>

      <div className="register-panel">
        <h1 className="register-logo">Novelv</h1>
        <h2 className="register-title">로그인하고 무료로 감상하세요</h2>
        <p className="register-subtitle">회원가입 즉시 보너스 코인을 지급해 드려요</p>

        <div className="social-row" aria-label="소셜 회원가입">
          {oauthProviders.map((provider) => (
            <button
              key={provider.id}
              className={`social-button ${provider.className}`}
              type="button"
              aria-label={provider.label}
              title={provider.label}
              onClick={() => handleSocialLogin(provider)}
            >
              {provider.shortLabel}
            </button>
          ))}
        </div>

        <div className="quick-bubble">3초 만에 간편가입</div>

        <p className="register-divider">일반 회원가입</p>
        <button className="phone-register" type="button">휴대폰 번호로 가입</button>

        <p className="register-login-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;