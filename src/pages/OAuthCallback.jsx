import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

function OAuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('소셜 로그인 처리 중입니다.');

  const redirectUri = useMemo(() => {
    if (!provider) {
      return '';
    }
    return `${window.location.origin}/oauth/callback/${provider}`;
  }, [provider]);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setMessage(errorDescription || '소셜 로그인이 취소되었거나 실패했습니다.');
      return;
    }

    if (!provider || !code || !redirectUri) {
      setMessage('로그인에 필요한 인증 코드가 없습니다.');
      return;
    }

    api.post(`/auth/oauth/${provider}`, { code, state, redirectUri })
      .then(({ data }) => {
        localStorage.setItem('novelv_access_token', data.accessToken);
        localStorage.setItem('novelv_user', JSON.stringify(data.user));
        navigate('/', { replace: true });
      })
      .catch((errorResponse) => {
        const serverMessage = errorResponse.response?.data?.message;
        setMessage(serverMessage || '소셜 로그인 처리 중 오류가 발생했습니다.');
      });
  }, [navigate, provider, redirectUri, searchParams]);

  return (
    <section className="oauth-callback-page">
      <style>{`
        .oauth-callback-page {
          min-height: calc(100svh - 56px);
          display: grid;
          place-items: center;
          padding: 48px 24px;
          background: #090909;
          color: #fff;
          box-sizing: border-box;
          text-align: center;
        }

        .oauth-callback-title {
          margin: 0 0 12px;
          font-size: 24px;
          font-weight: 950;
          letter-spacing: 0;
        }

        .oauth-callback-message {
          max-width: 520px;
          margin: 0 0 24px;
          color: #b5bbc7;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.6;
          word-break: keep-all;
        }

        .oauth-callback-link {
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }
      `}</style>

      <div>
        <h1 className="oauth-callback-title">Novelv</h1>
        <p className="oauth-callback-message">{message}</p>
        <Link className="oauth-callback-link" to="/register">가입 화면으로 돌아가기</Link>
      </div>
    </section>
  );
}

export default OAuthCallback;