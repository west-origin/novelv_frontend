const oauthConfig = {
  kakao: {
    label: 'Kakao',
    shortLabel: 'K',
    className: 'kakao',
    authBaseUrl: 'https://kauth.kakao.com/oauth/authorize',
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
    scope: '',
  },
  google: {
    label: 'Google',
    shortLabel: 'G',
    className: 'google',
    authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'email profile',
  },
  naver: {
    label: 'Naver',
    shortLabel: 'N',
    className: 'naver',
    authBaseUrl: 'https://nid.naver.com/oauth2.0/authorize',
    clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
    scope: '',
    state: import.meta.env.VITE_NAVER_STATE || 'novelv-local',
  },
};

export const oauthProviders = Object.entries(oauthConfig).map(([id, config]) => ({ id, ...config }));

export function buildOAuthUrl(provider) {
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

export function isMissingClientId(clientId) {
  return !clientId || clientId.startsWith('YOUR_') || clientId.startsWith('your-');
}

export function startOAuthLogin(provider) {
  if (isMissingClientId(provider.clientId)) {
    alert(`${provider.label} client ID is not configured. Check D:\\work_space\\novelv-frontend\\.env.`);
    return;
  }

  window.location.assign(buildOAuthUrl(provider));
}
