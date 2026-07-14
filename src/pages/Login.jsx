import { Link } from 'react-router-dom';
import { oauthProviders, startOAuthLogin } from '../auth/oauth';

function Login() {
  return (
    <section className="login-page">
      <style>{`
        .login-page {
          min-height: calc(100svh - 56px);
          display: grid;
          place-items: center;
          padding: 52px 24px;
          box-sizing: border-box;
          background: #090909;
          color: #fff;
        }

        .login-panel {
          width: min(100%, 480px);
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        .login-logo {
          margin: 0 0 34px;
          color: #fff;
          font-size: 34px;
          font-weight: 950;
          line-height: 1;
          letter-spacing: 0;
          text-align: center;
        }

        .login-form {
          display: grid;
          gap: 12px;
        }

        .login-field {
          width: 100%;
          height: 58px;
          padding: 0 16px;
          border: 1px solid #3a3a3a;
          border-radius: 7px;
          outline: none;
          box-sizing: border-box;
          background: #0d0d0d;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }

        .login-field::placeholder {
          color: #9ca3af;
        }

        .login-field:focus {
          border-color: #5a5a5a;
          background: #111;
        }

        .login-links {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin: 18px 0 12px;
        }

        .find-link {
          color: #d7dce6;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .find-link:hover {
          color: #fff;
          text-decoration: underline;
        }

        .register-link {
          display: inline-grid;
          height: 34px;
          place-items: center;
          padding: 0 14px;
          border: 1px solid #3f3f3f;
          border-radius: 7px;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          box-sizing: border-box;
        }

        .register-link:hover {
          border-color: #666;
          background: #151515;
        }

        .login-submit {
          width: 100%;
          height: 56px;
          border: 0;
          border-radius: 7px;
          background: #ff2b7a;
          color: #fff;
          font-size: 16px;
          font-weight: 950;
          cursor: pointer;
          transition: background 160ms ease, transform 160ms ease, opacity 160ms ease;
        }

        .login-submit:hover {
          background: #ff4d91;
          opacity: 0.98;
          transform: translateY(-1px);
        }

        .simple-login {
          margin: 34px 0 16px;
          color: #c8ced8;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
        }

        .social-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
        }

        .social-button {
          display: inline-grid;
          width: 56px;
          height: 56px;
          place-items: center;
          border: 0;
          border-radius: 999px;
          color: #111;
          font-size: 25px;
          font-weight: 950;
          cursor: pointer;
          transition: transform 160ms ease, filter 160ms ease;
        }

        .social-button:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .social-button.kakao {
          background: #ffe500;
        }

        .social-button.google {
          background: #fff;
          color: #4285f4;
        }

        .social-button.naver {
          background: #03c75a;
          color: #fff;
        }

        @media (max-width: 640px) {
          .login-page {
            min-height: calc(100svh - 98px);
            padding: 40px 18px;
          }

          .login-panel {
            width: 100%;
          }
        }
      `}</style>

      <div className="login-panel">
        <h1 className="login-logo">Novelv</h1>

        <form className="login-form">
          <input className="login-field" type="text" placeholder="이메일 or 휴대폰 번호" aria-label="이메일 또는 휴대폰 번호" />
          <input className="login-field" type="password" placeholder="비밀번호" aria-label="비밀번호" />

          <div className="login-links">
            <a className="find-link" href="#find-account">ID/PW 찾기</a>
            <Link className="register-link" to="/register">회원가입</Link>
          </div>

          <button className="login-submit" type="submit">로그인</button>
        </form>

        <p className="simple-login">간편 로그인</p>

        <div className="social-row" aria-label="social login">
          {oauthProviders.map((provider) => (
            <button
              key={provider.id}
              className={`social-button ${provider.className}`}
              type="button"
              aria-label={`${provider.label} login`}
              title={`${provider.label} login`}
              onClick={() => startOAuthLogin(provider)}
            >
              {provider.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Login;
