import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import api from '../api/axios';

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value ?? 0));
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainSeconds = String(rounded % 60).padStart(2, '0');
  return `${minutes}:${remainSeconds}`;
}

function captureFirstFrame(file) {
  return new Promise((resolve) => {
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = previewUrl;

    const finish = (thumbnailUrl = '', durationSeconds = 0) => {
      resolve({ previewUrl, thumbnailUrl, durationSeconds });
    };

    video.onloadeddata = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/jpeg', 0.86), Number.isFinite(video.duration) ? video.duration : 0);
      } catch {
        finish('', Number.isFinite(video.duration) ? video.duration : 0);
      }
    };

    video.onerror = () => finish('', 0);
  });
}

function CreatorDashboard() {
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const uploadAbortRef = useRef(null);
  const activeVideoIdRef = useRef(null);
  const previewUrlRef = useRef(null);
  const [channel, setChannel] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '' });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [modalStep, setModalStep] = useState('select');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isCancellingUpload, setIsCancellingUpload] = useState(false);

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
          name: user?.channelName || user?.nickname || 'Creator',
          handle: user?.handle || '@creator',
        });
        setAnalytics({ subscriberCount: 0, views28Days: 0, watchTime28Days: 0 });
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      uploadAbortRef.current?.abort();
    };
  }, []);

  const resetUploadModalState = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    activeVideoIdRef.current = null;
    uploadAbortRef.current = null;
    setSelectedVideo(null);
    setModalStep('select');
    setIsDraggingUpload(false);
    setUploadState({ status: 'idle', message: '' });
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
    resetUploadModalState();
  };

  const closeUploadModal = async () => {
    if (isCancellingUpload) return;

    const videoId = activeVideoIdRef.current;
    uploadAbortRef.current?.abort();

    if (!videoId) {
      setIsUploadModalOpen(false);
      resetUploadModalState();
      return;
    }

    setIsCancellingUpload(true);
    setUploadState({ status: 'uploading', message: '업로드를 취소하고 R2 파일을 삭제하는 중입니다...' });

    try {
      await api.post(`/creator/videos/${videoId}/cancel`, {});
    } catch (error) {
      setUploadState({
        status: 'error',
        message: error?.response?.data?.message || error?.message || '업로드 취소 중 오류가 발생했습니다.',
      });
      setIsCancellingUpload(false);
      return;
    }

    setIsCancellingUpload(false);
    setIsUploadModalOpen(false);
    resetUploadModalState();
  };

  const openFilePicker = () => {
    if (uploadState.status === 'uploading' || isCancellingUpload) return;
    fileInputRef.current?.click();
  };

  const openThumbnailPicker = () => {
    thumbnailInputRef.current?.click();
  };

  const uploadFile = async (file) => {
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const title = file.name.replace(/\.[^/.]+$/, '') || 'untitled-video';
    const contentType = file.type || 'application/octet-stream';
    const metadata = await captureFirstFrame(file);
    previewUrlRef.current = metadata.previewUrl;
    activeVideoIdRef.current = null;

    setModalStep('details');
    setSelectedVideo({
      fileName: file.name,
      title,
      description: '',
      previewUrl: metadata.previewUrl,
      thumbnailUrl: metadata.thumbnailUrl,
      durationSeconds: Math.floor(metadata.durationSeconds || 0),
      durationLabel: formatDuration(metadata.durationSeconds),
      videoId: null,
    });
    setUploadState({ status: 'uploading', message: 'R2 업로드 URL을 발급하는 중입니다...' });

    const abortController = new AbortController();
    uploadAbortRef.current = abortController;

    try {
      const { data } = await api.post('/creator/videos/direct-upload', {
        title,
        fileName: file.name,
        contentType,
        fileSizeBytes: file.size,
        durationSeconds: Math.floor(metadata.durationSeconds || 0),
      }, { signal: abortController.signal });

      activeVideoIdRef.current = data.videoId;
      setSelectedVideo((current) => current ? { ...current, videoId: data.videoId } : current);
      setUploadState({ status: 'uploading', message: 'Cloudflare R2에 업로드하는 중입니다...' });

      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
        signal: abortController.signal,
      });

      if (!uploadResponse.ok) {
        throw new Error(`R2 업로드 실패 (${uploadResponse.status})`);
      }

      await api.post(`/creator/videos/${data.videoId}/complete`, {
        durationSeconds: Math.floor(metadata.durationSeconds || 0),
      }, { signal: abortController.signal });

      setUploadState({
        status: 'done',
        message: `업로드가 완료되었습니다. 영상 ID: ${data.videoId}`,
      });
      uploadAbortRef.current = null;
    } catch (error) {
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        setUploadState({ status: 'idle', message: '업로드가 취소되었습니다.' });
        return;
      }

      setUploadState({
        status: 'error',
        message: error?.response?.data?.message || error?.message || '업로드 중 오류가 발생했습니다.',
      });
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    await uploadFile(file);
    event.target.value = '';
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedVideo((current) => current ? { ...current, thumbnailUrl: String(reader.result || '') } : current);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleUploadDragOver = (event) => {
    event.preventDefault();
    if (uploadState.status !== 'uploading') {
      setIsDraggingUpload(true);
    }
  };

  const handleUploadDragLeave = (event) => {
    event.preventDefault();
    setIsDraggingUpload(false);
  };

  const handleUploadDrop = async (event) => {
    event.preventDefault();
    setIsDraggingUpload(false);
    if (uploadState.status === 'uploading') return;
    const file = event.dataTransfer.files?.[0];
    await uploadFile(file);
  };

  const updateSelectedVideo = (field, value) => {
    setSelectedVideo((current) => current ? { ...current, [field]: value } : current);
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
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          padding: 28px 12px;
          background: #0f0f0f;
        }

        .creator-channel {
          display: grid;
          justify-items: center;
          gap: 8px;
          margin-bottom: 24px;
          text-align: center;
        }

        .creator-avatar {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #1c2938;
          color: #fff;
          object-fit: cover;
          font-size: 34px;
          font-weight: 900;
        }

        .creator-channel strong {
          font-size: 14px;
          font-weight: 900;
        }

        .creator-channel span {
          color: #8f949d;
          font-size: 12px;
          font-weight: 700;
        }

        .creator-nav {
          display: grid;
          gap: 6px;
        }

        .creator-nav-item {
          width: 100%;
          height: 40px;
          border: 0;
          border-radius: 8px;
          padding: 0 16px;
          background: transparent;
          color: #c9cdd4;
          text-align: left;
          font-weight: 800;
          cursor: pointer;
        }

        .creator-nav-item.active,
        .creator-nav-item:hover {
          background: #1b1b1b;
          color: #fff;
        }

        .creator-main {
          padding: 36px clamp(20px, 5vw, 64px);
        }

        .creator-main h1 {
          margin: 0 0 24px;
          font-size: 34px;
          line-height: 1.15;
          font-weight: 950;
        }

        .creator-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
          gap: 18px;
          align-items: start;
        }

        .creator-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
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
          border: 1px dashed rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          background: #0c0c0c;
        }

        .upload-center {
          width: min(360px, 100%);
          display: grid;
          justify-items: center;
          gap: 16px;
          text-align: center;
        }

        .upload-icon {
          width: 96px;
          height: 96px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #242424;
          color: #f7f8fb;
          font-size: 44px;
          font-weight: 900;
        }

        .upload-copy {
          margin: 0;
          color: #b6bbc4;
          font-size: 13px;
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
          border-radius: 18px;
          background: #fff;
          color: #101010;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .upload-status,
        .upload-modal-status {
          min-height: 18px;
          margin: 0;
          color: #9ea4ad;
          font-size: 12px;
          font-weight: 700;
        }

        .upload-status.error,
        .upload-modal-status.error {
          color: #ff7c9e;
        }

        .upload-status.done,
        .upload-modal-status.done {
          color: #6ee7a8;
        }

        .analytics-card {
          min-height: 310px;
          padding: 24px;
        }

        .analytics-card h2 {
          margin: 0 0 18px;
          font-size: 20px;
          font-weight: 950;
        }

        .metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #b9bec7;
          font-size: 13px;
          font-weight: 800;
        }

        .metric-row:last-child {
          border-bottom: 0;
        }

        .metric-value {
          color: #fff;
          font-size: 22px;
          font-weight: 950;
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

        .upload-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: start center;
          padding: 12px 20px 32px;
          background: rgba(0, 0, 0, 0.82);
        }

        .upload-modal {
          width: min(960px, calc(100vw - 40px));
          min-height: min(820px, calc(100svh - 24px));
          max-height: calc(100svh - 24px);
          display: grid;
          grid-template-rows: 60px minmax(0, 1fr) 66px;
          overflow: hidden;
          border-radius: 22px;
          background: #242424;
          color: #fff;
          box-shadow: 0 30px 120px rgba(0, 0, 0, 0.7);
        }

        .upload-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 22px 0 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        .upload-modal-header h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1;
          font-weight: 950;
        }

        .upload-modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .upload-save-badge {
          border-radius: 4px;
          padding: 4px 7px;
          background: #5d5d5d;
          color: #f4f4f4;
          font-size: 11px;
          font-weight: 900;
        }

        .upload-modal-icon-button {
          width: 36px;
          height: 36px;
          display: inline-grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #f5f5f5;
          cursor: pointer;
        }

        .upload-modal-icon-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .upload-modal-body {
          min-height: 0;
          overflow-y: auto;
        }

        .upload-modal-dropzone {
          min-height: 600px;
          display: grid;
          place-items: center;
          padding: 44px 24px;
          transition: background 160ms ease, box-shadow 160ms ease;
        }

        .upload-modal-dropzone.dragging {
          background: rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.16);
        }

        .upload-modal-center {
          width: min(480px, 100%);
          display: grid;
          justify-items: center;
          gap: 20px;
          text-align: center;
        }

        .upload-modal-upload-circle {
          width: 136px;
          height: 136px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #444;
          color: #d7d7d7;
        }

        .upload-modal-copy {
          margin: 0;
          color: #f3f3f3;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.5;
        }

        .upload-modal-select-button,
        .upload-next-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 18px;
          border: 0;
          border-radius: 19px;
          background: #fff;
          color: #111;
          font-size: 13px;
          font-weight: 950;
          cursor: pointer;
        }

        .upload-modal-select-button:disabled,
        .upload-next-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .upload-details {
          padding: 24px 48px 34px;
        }

        .upload-progress-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
          margin: -10px -12px 32px;
          color: #8b8b8b;
          font-size: 13px;
          font-weight: 950;
          text-align: center;
        }

        .upload-progress-step {
          position: relative;
          display: grid;
          justify-items: center;
          gap: 8px;
        }

        .upload-progress-step::before {
          content: "";
          position: absolute;
          top: 29px;
          left: -50%;
          width: 100%;
          height: 2px;
          background: #565656;
        }

        .upload-progress-step:first-child::before {
          display: none;
        }

        .upload-progress-step.active,
        .upload-progress-step.done {
          color: #fff;
        }

        .upload-progress-dot {
          position: relative;
          z-index: 1;
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 4px solid #242424;
          background: #777;
          box-shadow: 0 0 0 2px #777;
          color: #111;
          font-size: 11px;
          line-height: 1;
        }

        .upload-progress-step.active .upload-progress-dot,
        .upload-progress-step.done .upload-progress-dot {
          background: #fff;
          box-shadow: 0 0 0 2px #fff;
        }

        .upload-details-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 304px;
          gap: 24px;
          align-items: start;
        }

        .upload-details-title {
          margin: 0 0 18px;
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
        }

        .upload-form-group {
          display: grid;
          gap: 7px;
          margin-bottom: 24px;
        }

        .upload-field {
          display: grid;
          border: 1px solid #555;
          border-radius: 6px;
          background: #242424;
        }

        .upload-field:focus-within {
          border-color: #e7e7e7;
        }

        .upload-field label {
          padding: 10px 12px 0;
          color: #bdbdbd;
          font-size: 12px;
          font-weight: 900;
        }

        .upload-field input,
        .upload-field textarea {
          width: 100%;
          border: 0;
          outline: 0;
          box-sizing: border-box;
          background: transparent;
          color: #fff;
          font: inherit;
          font-size: 15px;
          font-weight: 700;
        }

        .upload-field input {
          min-height: 36px;
          padding: 0 12px 10px;
        }

        .upload-field textarea {
          min-height: 132px;
          resize: vertical;
          padding: 4px 12px 28px;
        }

        .upload-description-field {
          position: relative;
        }

        .upload-count {
          position: absolute;
          right: 12px;
          bottom: 10px;
          color: #aaa;
          font-size: 12px;
          font-weight: 800;
        }

        .upload-section-title {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 950;
        }

        .upload-section-copy {
          margin: 0 0 14px;
          color: #aaa;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.45;
        }

        .thumbnail-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .thumbnail-option {
          width: 154px;
          height: 84px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px dashed #777;
          background: #202020;
          color: #cfcfcf;
          font-size: 12px;
          font-weight: 900;
          text-align: center;
          cursor: pointer;
        }

        .thumbnail-option img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-preview-card {
          overflow: hidden;
          border-radius: 6px;
          background: #373737;
        }

        .upload-preview-video-wrap {
          position: relative;
          aspect-ratio: 16 / 9;
          background: #111;
        }

        .upload-preview-video-wrap video,
        .upload-preview-video-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .upload-preview-meta {
          display: grid;
          gap: 10px;
          padding: 14px 16px 18px;
        }

        .upload-preview-label {
          margin: 0;
          color: #bdbdbd;
          font-size: 12px;
          font-weight: 900;
        }

        .upload-preview-link {
          margin: 0;
          color: #3ea6ff;
          font-size: 14px;
          font-weight: 950;
          word-break: break-all;
        }

        .upload-preview-file {
          margin: 0;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          word-break: break-all;
        }

        .upload-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 0 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          background: #242424;
          color: #a8adb5;
          font-size: 12px;
          font-weight: 800;
        }

        .upload-footer-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .upload-footer-icon {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          color: #fff;
        }

        @media (max-width: 860px) {
          .creator-dashboard-shell {
            grid-template-columns: 1fr;
          }

          .creator-sidebar {
            display: none;
          }

          .creator-main {
            padding: 26px 16px 40px;
          }

          .creator-dashboard-grid,
          .upload-details-grid {
            grid-template-columns: 1fr;
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

          .upload-modal-overlay {
            align-items: stretch;
            padding: 10px;
          }

          .upload-modal {
            width: 100%;
            min-height: calc(100svh - 20px);
            max-height: calc(100svh - 20px);
            border-radius: 18px;
          }

          .upload-details {
            padding: 22px 18px 30px;
          }

          .upload-details-title {
            font-size: 28px;
          }

          .upload-progress-steps {
            font-size: 11px;
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
              <div className="creator-avatar" aria-hidden="true">
                {(channel?.name || 'N').slice(0, 1).toUpperCase()}
              </div>
            )}
            <strong>{channel?.name || '내 채널'}</strong>
            <span>{channel?.handle || '@creator'}</span>
          </div>

          <nav className="creator-nav">
            <button className="creator-nav-item active" type="button">Dashboard</button>
            <button className="creator-nav-item" type="button">Content</button>
            <button className="creator-nav-item" type="button">Analytics</button>
            <button className="creator-nav-item" type="button">Settings</button>
          </nav>
        </aside>

        <main className="creator-main">
          <h1>채널 대시보드</h1>

          <div className="creator-dashboard-grid">
            <section className="creator-card upload-card" aria-label="영상 업로드">
              <div className="upload-dropzone">
                <div className="upload-center">
                  <div className="upload-icon" aria-hidden="true">↑</div>
                  <p className="upload-copy">
                    영상 파일을 선택하면 서버가 Cloudflare R2 presigned URL을 발급하고,
                    브라우저가 R2 private 버킷에 직접 업로드합니다.
                  </p>
                  <button className="video-upload-button" type="button" onClick={openUploadModal}>
                    영상 업로드
                  </button>
                  <p className={`upload-status ${uploadState.status}`}>
                    {uploadState.message}
                  </p>
                </div>
              </div>
            </section>

            <section className="creator-card analytics-card" aria-label="채널 분석">
              <h2>채널 분석</h2>
              <div className="metric-row">
                <span>구독자</span>
                <span className="metric-value">{formatNumber(analytics?.subscriberCount)}</span>
              </div>
              <div className="metric-row">
                <span>최근 28일 조회수</span>
                <span className="metric-value">{formatNumber(analytics?.views28Days)}</span>
              </div>
              <div className="metric-row">
                <span>최근 28일 시청 시간</span>
                <span className="metric-value">{formatNumber(analytics?.watchTime28Days)}</span>
              </div>
            </section>
          </div>
        </main>
      </div>

      {isUploadModalOpen && (
        <div className="upload-modal-overlay" role="presentation">
          <section
            className="upload-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
          >
            <header className="upload-modal-header">
              <h2 id="upload-modal-title">{modalStep === 'details' ? '만드는 중' : '동영상 업로드'}</h2>
              <div className="upload-modal-actions">
                <button
                  className="upload-modal-icon-button"
                  type="button"
                  aria-label="닫기"
                  onClick={closeUploadModal}
                  disabled={isCancellingUpload}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </header>

            <div className="upload-modal-body">
              {modalStep === 'select' ? (
                <div
                  className={`upload-modal-dropzone ${isDraggingUpload ? 'dragging' : ''}`}
                  onDragOver={handleUploadDragOver}
                  onDragLeave={handleUploadDragLeave}
                  onDrop={handleUploadDrop}
                >
                  <div className="upload-modal-center">
                    <div className="upload-modal-upload-circle" aria-hidden="true">
                      <svg width="70" height="70" viewBox="0 0 72 72" fill="none">
                        <path d="M36 14 19 33h10v17h14V33h10L36 14Z" fill="currentColor" />
                        <path d="M22 58h28" stroke="currentColor" strokeWidth="6" strokeLinecap="square" />
                      </svg>
                    </div>
                    <p className="upload-modal-copy">동영상 파일을 드래그 앤 드롭하여 업로드</p>
                    <button className="upload-modal-select-button" type="button" onClick={openFilePicker}>
                      파일 선택
                    </button>
                    <p className={`upload-modal-status ${uploadState.status}`}>{uploadState.message}</p>
                  </div>
                </div>
              ) : (
                <div className="upload-details">
                  <div className="upload-progress-steps" aria-label="업로드 단계">
                    <div className="upload-progress-step active">
                      <span>세부정보</span>
                      <span className="upload-progress-dot" />
                    </div>
                    <div className="upload-progress-step">
                      <span>동영상 요소</span>
                      <span className="upload-progress-dot" />
                    </div>
                    <div className="upload-progress-step done">
                      <span>검토</span>
                      <span className="upload-progress-dot">✓</span>
                    </div>
                    <div className="upload-progress-step">
                      <span>공개 상태</span>
                      <span className="upload-progress-dot" />
                    </div>
                  </div>

                  <div className="upload-details-grid">
                    <div>
                      <h3 className="upload-details-title">세부정보</h3>
                      <div className="upload-form-group">
                        <div className="upload-field">
                          <label htmlFor="upload-title">제목(필수 항목)</label>
                          <input
                            id="upload-title"
                            type="text"
                            value={selectedVideo?.title || ''}
                            maxLength={200}
                            onChange={(event) => updateSelectedVideo('title', event.target.value)}
                          />
                        </div>
                      </div>

                      <div className="upload-form-group">
                        <div className="upload-field upload-description-field">
                          <label htmlFor="upload-description">설명</label>
                          <textarea
                            id="upload-description"
                            value={selectedVideo?.description || ''}
                            maxLength={5000}
                            placeholder="시청자에게 동영상에 대해 설명해 주세요"
                            onChange={(event) => updateSelectedVideo('description', event.target.value)}
                          />
                          <span className="upload-count">{selectedVideo?.description?.length || 0}/5000</span>
                        </div>
                      </div>

                      <section aria-label="썸네일">
                        <h4 className="upload-section-title">썸네일</h4>
                        <p className="upload-section-copy">눈에 띄고 시청자의 관심을 끄는 썸네일을 설정하세요.</p>
                        <div className="thumbnail-options">
                          <button className="thumbnail-option" type="button" onClick={openThumbnailPicker}>
                            파일 업로드
                          </button>
                          <div className="thumbnail-option" aria-label="자동 생성된 썸네일">
                            {selectedVideo?.thumbnailUrl ? <img src={selectedVideo.thumbnailUrl} alt="자동 생성된 썸네일" /> : '자동 생성됨'}
                          </div>
                        </div>
                      </section>
                    </div>

                    <aside className="upload-preview-card" aria-label="업로드 미리보기">
                      <div className="upload-preview-video-wrap">
                        {selectedVideo?.previewUrl ? (
                          <video src={selectedVideo.previewUrl} poster={selectedVideo.thumbnailUrl || undefined} controls />
                        ) : selectedVideo?.thumbnailUrl ? (
                          <img src={selectedVideo.thumbnailUrl} alt="동영상 썸네일" />
                        ) : null}
                      </div>
                      <div className="upload-preview-meta">
                        <div>
                          <p className="upload-preview-label">동영상 링크</p>
                          <p className="upload-preview-link">{selectedVideo?.videoId ? `/videos/${selectedVideo.videoId}/watch` : '업로드 준비 중'}</p>
                        </div>
                        <div>
                          <p className="upload-preview-label">파일 이름</p>
                          <p className="upload-preview-file">{selectedVideo?.fileName}</p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              )}
            </div>

            <footer className="upload-modal-footer">
              <div className="upload-footer-left">
                <span className="upload-footer-icon" aria-hidden="true">↥</span>
                <span className="upload-footer-icon" aria-hidden="true">HD</span>
                <p className={`upload-modal-status ${uploadState.status}`}>{uploadState.message || '파일을 선택해 업로드를 시작하세요.'}</p>
              </div>
              <button className="upload-next-button" type="button" disabled={uploadState.status === 'uploading' || isCancellingUpload}>
                다음
              </button>
            </footer>

            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
            />
            <input
              ref={thumbnailInputRef}
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
            />
          </section>
        </div>
      )}
    </section>
  );
}

export default CreatorDashboard;
