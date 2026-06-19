import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';

const creatorMenu = [
  { label: '대시보드', icon: DashboardIcon, active: true },
  { label: '콘텐츠', icon: ContentIcon },
  { label: '분석', icon: AnalyticsIcon },
  { label: '커뮤니티', icon: CommunityIcon },
  { label: '자막', icon: CaptionIcon },
  { label: '콘텐츠 감지', icon: CopyrightIcon },
  { label: '수익 창출', icon: MonetizationIcon },
  { label: '맞춤설정', icon: CustomizeIcon },
  { label: '오디오 보관함', icon: AudioIcon },
];

const bottomMenu = [
  { label: '설정', icon: SettingsIcon },
  { label: '의견 보내기', icon: FeedbackIcon },
];

function IconShell({ children }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

function DashboardIcon() {
  return <IconShell><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z" /></IconShell>;
}

function ContentIcon() {
  return <IconShell><path d="M4 5h16v14H4z" /><path d="m10 9 5 3-5 3z" /></IconShell>;
}

function AnalyticsIcon() {
  return <IconShell><path d="M4 19V5h16v14z" /><path d="M8 16v-5M12 16V8M16 16v-7" /></IconShell>;
}

function CommunityIcon() {
  return <IconShell><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M3.5 19c.8-3.1 2.3-4.6 4.5-4.6s3.7 1.5 4.5 4.6M11.5 19c.8-3.1 2.3-4.6 4.5-4.6s3.7 1.5 4.5 4.6" /></IconShell>;
}

function CaptionIcon() {
  return <IconShell><path d="M4 6h16v12H4z" /><path d="M8 11h3M13 11h3M8 15h8" /></IconShell>;
}

function CopyrightIcon() {
  return <IconShell><circle cx="12" cy="12" r="8" /><path d="M14.5 9.5a4 4 0 1 0 0 5" /></IconShell>;
}

function MonetizationIcon() {
  return <IconShell><circle cx="12" cy="12" r="8" /><path d="M12 7v10M9 9.2c.7-.7 4.5-1 5 .7.8 2.6-5.1 1.6-4.3 4.3.5 1.6 4.3 1.5 5.3.5" /></IconShell>;
}

function CustomizeIcon() {
  return <IconShell><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10z" /><path d="m13.5 7 3.5 3.5" /><path d="M19 4l1 1" /></IconShell>;
}

function AudioIcon() {
  return <IconShell><path d="M9 18V6l10-2v12" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="16" r="2" /></IconShell>;
}

function SettingsIcon() {
  return <IconShell><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5 6.8 15M17.2 9l2.6-1.5" /></IconShell>;
}

function FeedbackIcon() {
  return <IconShell><path d="M5 5h14v11H8l-3 3z" /><path d="M9 9h6M9 12h4" /></IconShell>;
}

function UploadIllustration() {
  return (
    <svg className="creator-upload-illustration" viewBox="0 0 150 130" aria-hidden="true">
      <path d="M39 92V59c0-22 12-39 33-39 9 0 15 4 18 11 3 8 0 16-8 20l-14 7 28 12c8 4 12 12 9 20-3 7-9 10-17 7L61 85v7c0 10-22 10-22 0z" fill="#08bfe5" stroke="#04161b" strokeWidth="5" />
      <path d="M68 36l18-12 9 15-20 10z" fill="#67e6ff" stroke="#04161b" strokeWidth="4" />
      <path d="M87 75h40v34H87z" fill="#0fc5e8" stroke="#04161b" strokeWidth="5" />
      <path d="M94 83h27M94 93h18" stroke="#e9fbff" strokeWidth="5" strokeLinecap="round" />
      <path d="M37 93h28" stroke="#04161b" strokeWidth="5" strokeLinecap="round" />
      <circle cx="84" cy="61" r="8" fill="#fff" stroke="#04161b" strokeWidth="4" />
    </svg>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value ?? 0));
}

function CreatorDashboard() {
  const fileInputRef = useRef(null);
  const [channel, setChannel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [{ data: channelData }, { data: analyticsData }] = await Promise.all([
          api.get('/creator/channel'),
          api.get('/creator/analytics/summary'),
        ]);

        if (!isMounted) return;
        setChannel(channelData);
        setAnalytics(analyticsData);
      } catch {
        if (!isMounted) return;
        const rawUser = localStorage.getItem('novelv_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        setChannel({
          profileImageUrl: user?.profileImageUrl,
          name: user?.channelName || user?.nickname,
          handle: user?.handle,
        });
        setAnalytics({ subscriberCount: 0, views28Days: 0, watchTime28Days: 0 });
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState({ status: 'uploading', message: '업로드 URL을 요청하는 중입니다.' });

    try {
      const { data } = await api.post('/creator/videos/presigned-url', {
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });

      await fetch(data?.presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      const cdnUrl = data?.cloudFrontUrl || data?.cdnUrl || `${data?.cloudFrontBaseUrl || ''}/${data?.objectKey || ''}`;

      await api.post('/creator/videos', {
        title: file.name.replace(/\.[^/.]+$/, ''),
        originalFileName: file.name,
        objectKey: data?.objectKey,
        videoUrl: cdnUrl,
        contentType: file.type,
        size: file.size,
      });

      setUploadState({ status: 'done', message: '동영상 업로드 요청이 완료되었습니다.' });
    } catch (error) {
      setUploadState({
        status: 'error',
        message: error?.response?.data?.message || '업로드 중 오류가 발생했습니다.',
      });
    } finally {
      event.target.value = '';
    }
  };

  return (
    <section className="creator-dashboard-page">
      <style>{`
        .creator-dashboard-page {
          min-height: 100svh;
          background: #090909;
          color: #f7f8fb;
          font-family: Inter, Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          letter-spacing: 0;
        }

        .creator-dashboard-shell {
          min-height: calc(100svh - 56px);
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          background: #090909;
        }

        .creator-sidebar {
          position: sticky;
          top: 56px;
          height: calc(100svh - 56px);
          display: flex;
          flex-direction: column;
          padding: 28px 12px 18px;
          background: #090909;
          box-sizing: border-box;
        }

        .creator-channel {
          display: grid;
          justify-items: center;
          gap: 8px;
          margin-bottom: 22px;
          text-align: center;
        }

        .creator-avatar {
          width: 112px;
          height: 112px;
          border-radius: 999px;
          object-fit: cover;
          background: linear-gradient(135deg, #58b8d9, #156079);
        }

        .creator-avatar-fallback {
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 34px;
          font-weight: 950;
        }

        .creator-channel strong {
          margin-top: 6px;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.2;
        }

        .creator-channel span {
          color: #a7a7a7;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.2;
        }

        .creator-nav,
        .creator-bottom-nav {
          display: grid;
          gap: 2px;
        }

        .creator-bottom-nav {
          margin-top: auto;
        }

        .creator-nav-item {
          display: flex;
          align-items: center;
          gap: 22px;
          width: 100%;
          height: 40px;
          padding: 0 14px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #d8dde5;
          font-size: 14px;
          font-weight: 800;
          text-align: left;
          cursor: pointer;
        }

        .creator-nav-item.active,
        .creator-nav-item:hover {
          background: #242424;
          color: #fff;
        }

        .creator-nav-item svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2;
        }

        .creator-main {
          min-width: 0;
          padding: 28px 32px 44px;
          background: #090909;
          box-sizing: border-box;
        }

        .creator-main h1 {
          margin: 0 0 28px;
          color: #fff;
          font-size: 34px;
          font-weight: 950;
          line-height: 1;
        }

        .creator-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(320px, 394px) minmax(320px, 394px);
          gap: 24px;
          align-items: start;
        }

        .creator-card {
          border: 1px solid #303030;
          border-radius: 10px;
          background: #101010;
          box-sizing: border-box;
        }

        .upload-card {
          min-height: 548px;
          padding: 24px;
        }

        .upload-dropzone {
          min-height: 496px;
          display: grid;
          place-items: center;
          border: 1px dashed #3d3d3f;
          border-radius: 8px;
        }

        .upload-center {
          display: grid;
          justify-items: center;
          gap: 18px;
          max-width: 280px;
          text-align: center;
        }

        .creator-upload-illustration {
          width: 150px;
          height: 130px;
        }

        .upload-copy {
          margin: 0;
          color: #aab1bd;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.55;
        }

        .video-upload-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 18px;
          border: 0;
          border-radius: 999px;
          background: #f5f5f5;
          color: #111;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .video-upload-button:hover {
          background: #ffffff;
        }

        .upload-status {
          min-height: 18px;
          margin: 0;
          color: #9ea4ad;
          font-size: 12px;
          font-weight: 700;
        }

        .upload-status.error {
          color: #ff7c9e;
        }

        .analytics-card {
          min-height: 454px;
          padding: 24px;
        }

        .analytics-card h2 {
          margin: 0 0 16px;
          color: #fff;
          font-size: 20px;
          font-weight: 950;
        }

        .analytics-label {
          margin: 0;
          color: #e7eaf1;
          font-size: 14px;
          font-weight: 800;
        }

        .subscriber-count {
          margin: 6px 0 46px;
          color: #fff;
          font-size: 34px;
          font-weight: 950;
          line-height: 1;
        }

        .analytics-divider {
          height: 1px;
          margin: 0 0 16px;
          background: #303030;
        }

        .analytics-section-title {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 950;
        }

        .analytics-period {
          margin: 3px 0 14px;
          color: #aab1bd;
          font-size: 13px;
          font-weight: 700;
        }

        .metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 12px 0;
          color: #d8dde5;
          font-size: 14px;
          font-weight: 800;
        }

        .metric-value {
          display: inline-flex;
          gap: 12px;
          color: #fff;
          font-weight: 900;
        }

        .top-content {
          padding-top: 12px;
        }

        .analytics-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          margin-top: 16px;
          padding: 0 16px;
          border-radius: 999px;
          background: #242424;
          color: #d8dde5;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .creator-footer-links {
          display: flex;
          gap: 54px;
          margin-top: 36px;
          color: #aab1bd;
          font-size: 13px;
          font-weight: 800;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 1100px) {
          .creator-dashboard-shell {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          .creator-main {
            padding-right: 24px;
          }

          .creator-dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
            max-width: 620px;
          }
        }

        @media (max-width: 760px) {
          .creator-dashboard-shell {
            grid-template-columns: 1fr;
          }

          .creator-sidebar {
            position: static;
            height: auto;
          }

          .creator-nav-item {
            justify-content: center;
          }

          .creator-main {
            padding: 24px 16px;
          }

          .creator-main h1 {
            font-size: 28px;
          }

          .upload-card {
            min-height: auto;
          }

          .upload-dropzone {
            min-height: 360px;
          }

          .creator-footer-links {
            flex-wrap: wrap;
            gap: 18px;
          }
        }
      `}</style>

      <Header onToggleSidebar={() => {}} />

      <div className="creator-dashboard-shell">

      <aside className="creator-sidebar" aria-label="크리에이터 메뉴">
        <div className="creator-channel">
          {channel?.profileImageUrl ? (
            <img className="creator-avatar" src={channel.profileImageUrl} alt="" />
          ) : (
            <div className="creator-avatar creator-avatar-fallback" aria-hidden="true">
              {(channel?.name || 'N').slice(0, 1).toUpperCase()}
            </div>
          )}
          <strong>{channel?.name || '내 채널'}</strong>
          <span>{channel?.handle || 'woeo'}</span>
        </div>

        <nav className="creator-nav">
          {creatorMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`creator-nav-item${item.active ? ' active' : ''}`} key={item.label} type="button">
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        <nav className="creator-bottom-nav" aria-label="하단 메뉴">
          {bottomMenu.map((item) => {
            const Icon = item.icon;
            return (
              <button className="creator-nav-item" key={item.label} type="button">
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="creator-main">
        <h1>채널 대시보드</h1>

        <div className="creator-dashboard-grid">
          <section className="creator-card upload-card" aria-label="동영상 업로드">
            <div className="upload-dropzone">
              <div className="upload-center">
                <UploadIllustration />
                <p className="upload-copy">
                  최근 동영상의 측정항목을 보고 싶으신가요?<br />
                  시작하려면 동영상을 업로드하고 게시하세요.
                </p>
                <button className="video-upload-button" type="button" onClick={openFilePicker}>
                  동영상 업로드
                </button>
                <p className={`upload-status ${uploadState.status === 'error' ? 'error' : ''}`}>
                  {uploadState.message}
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
            />
          </section>

          <section className="creator-card analytics-card" aria-label="채널 분석">
            <h2>채널 분석</h2>
            <p className="analytics-label">현재 구독자 수</p>
            <strong className="subscriber-count">{formatNumber(analytics?.subscriberCount)}</strong>

            <div className="analytics-divider" />

            <p className="analytics-section-title">요약</p>
            <p className="analytics-period">지난 28일</p>
            <div className="metric-row">
              <span>조회수</span>
              <span className="metric-value">{formatNumber(analytics?.views28Days)} <span>-</span></span>
            </div>
            <div className="metric-row">
              <span>시청 시간(단위: 시간)</span>
              <span className="metric-value">{formatNumber(analytics?.watchTime28Days)} <span>-</span></span>
            </div>

            <div className="analytics-divider" />

            <div className="top-content">
              <p className="analytics-section-title">인기 콘텐츠</p>
              <p className="analytics-period">지난 48시간 · 조회수</p>
              <a className="analytics-link" href="/creator/analytics">채널 분석으로 이동</a>
            </div>
          </section>
        </div>

        <div className="creator-footer-links" aria-label="정책 링크">
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <span>정책 및 안전</span>
        </div>
      </main>
      </div>
    </section>
  );
}

export default CreatorDashboard;
