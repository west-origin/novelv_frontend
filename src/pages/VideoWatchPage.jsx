import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const R2_BUCKET_URL = import.meta.env.VITE_R2_BUCKET_URL || 'https://novelv.e53ddd024fcaf45c398aa5f81262a740.r2.cloudflarestorage.com';

function buildR2VideoUrl(objectKey) {
  if (!objectKey) return '';
  return `${R2_BUCKET_URL.replace(/\/$/, '')}/${String(objectKey).replace(/^\//, '')}`;
}

function normalizeVideo(video) {
  return {
    id: video.id,
    title: video.title || 'Untitled video',
    channel: video.channel || 'Shorts',
    time: video.time || '00:00',
    badge: video.badge || '무료',
    description: video.description || '짧은 영상으로 만나는 NovelV 작품의 주요 장면과 분위기를 감상해 보세요.',
    videoUrl: video.videoUrl || buildR2VideoUrl(video.objectKey),
    thumbnailUrl: video.thumbnailUrl || '',
  };
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function EpisodeItem({ episode, isActive, onSelect }) {
  return (
    <button
      className={`episode-item ${isActive ? 'active' : ''}`}
      type="button"
      onClick={() => onSelect(episode)}
    >
      <div className="episode-thumb">
        {episode.thumbnailUrl ? (
          <img className="episode-thumb__image" src={episode.thumbnailUrl} alt="" />
        ) : (
          <span className="episode-thumb__mark">{episode.title.charAt(0).toUpperCase()}</span>
        )}
        <span className="episode-thumb__overlay">{isActive ? 'Ⅱ' : '▶'}</span>
      </div>
      <div className="episode-copy">
        <strong>{episode.title}</strong>
        <span>{episode.badge || '무료'}</span>
      </div>
    </button>
  );
}

function VideoWatchPage() {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const stateWork = useMemo(() => (
    location.state?.work ? normalizeVideo(location.state.work) : null
  ), [location.state?.work]);

  const [episodes, setEpisodes] = useState(stateWork ? [stateWork] : []);
  const [playback, setPlayback] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('재생 권한을 확인하는 중입니다.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');

  const selectedVideo = useMemo(() => (
    episodes.find((episode) => String(episode.id) === String(videoId)) || stateWork || null
  ), [episodes, stateWork, videoId]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((left, right) => (
      sortOrder === 'newest'
        ? right.createdAt - left.createdAt
        : left.createdAt - right.createdAt
    ));
  }, [comments, sortOrder]);

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        const { data } = await api.get('/videos');
        if (!isMounted) return;
        const nextEpisodes = Array.isArray(data) ? data.map(normalizeVideo) : [];
        setEpisodes(nextEpisodes.length > 0 ? nextEpisodes : stateWork ? [stateWork] : []);
      } catch {
        if (!isMounted && !stateWork) return;
        setEpisodes(stateWork ? [stateWork] : []);
      }
    }

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, [stateWork]);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaybackToken() {
      try {
        setStatus('loading');
        setPlayback(null);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        const { data } = await api.get(`/videos/${videoId}/playback-token`);
        if (!isMounted) return;
        setPlayback(data);
        setStatus('ready');
      } catch (error) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(error?.response?.data?.message || '영상을 재생할 수 없습니다. 로그인 또는 결제 상태를 확인해 주세요.');
      }
    }

    loadPlaybackToken();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate, playback]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video || status !== 'ready') return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  const seekTo = (event) => {
    const video = videoRef.current;
    const nextTime = Number(event.target.value);
    if (!video) return;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.closest('.player-frame');
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const selectEpisode = (episode) => {
    if (String(episode.id) === String(videoId)) return;
    navigate(`/videos/${episode.id}/watch`, { state: { work: episode } });
  };

  const submitComment = () => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    setComments((current) => [
      ...current,
      {
        id: Date.now(),
        body: trimmedComment,
        createdAt: Date.now(),
      },
    ]);
    setCommentText('');
  };

  const title = selectedVideo?.title || '영상 상세';
  const description = selectedVideo?.description || '작품 설명을 불러오고 있습니다.';

  return (
    <section className="watch-page">
      <style>{`
        .watch-page {
          min-height: calc(100svh - 56px);
          padding: 18px 28px 56px;
          box-sizing: border-box;
          background: #0f0f0f;
          color: #f7f8fb;
        }

        .watch-topbar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 18px;
          margin-bottom: 14px;
        }

        .watch-back-link {
          justify-self: start;
          color: #d6d6d6;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .watch-topbar h1 {
          max-width: min(580px, 42vw);
          margin: 0;
          overflow: hidden;
          color: #fff;
          font-size: 17px;
          font-weight: 900;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .watch-side-label {
          justify-self: end;
          color: #f0f0f0;
          font-size: 16px;
          font-weight: 900;
        }

        .watch-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 22px;
          align-items: start;
        }

        .player-frame {
          overflow: hidden;
          border-radius: 8px;
          background: #000;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        }

        .player-stage {
          position: relative;
          display: grid;
          min-height: clamp(420px, 58vw, 720px);
          place-items: center;
          background: #000;
        }

        .shorts-video {
          width: 100%;
          height: 100%;
          min-height: clamp(420px, 58vw, 720px);
          border-radius: 0;
          background: #070707;
          object-fit: contain;
        }

        .player-state {
          display: grid;
          width: 100%;
          height: 100%;
          min-height: clamp(420px, 58vw, 720px);
          place-items: center;
          border-radius: 0;
          background: #070707;
          color: #d7d7d7;
          font-size: 14px;
          font-weight: 800;
          text-align: center;
        }

        .player-controls {
          display: grid;
          gap: 8px;
          padding: 10px 14px 12px;
          background: #050505;
        }

        .progress-range,
        .volume-range {
          width: 100%;
          accent-color: #ff3f92;
        }

        .control-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 34px;
          color: #f3f3f3;
          font-size: 13px;
          font-weight: 800;
        }

        .control-row button,
        .speed-select {
          display: inline-grid;
          min-width: 34px;
          height: 30px;
          place-items: center;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #f5f5f5;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .control-row button:hover,
        .speed-select:hover {
          background: #1f1f1f;
        }

        .time-label {
          min-width: 96px;
          color: #dbdbdb;
        }

        .control-spacer {
          flex: 1;
        }

        .volume-range {
          width: 88px;
        }

        .speed-select {
          width: 62px;
          padding: 0 6px;
          appearance: none;
          text-align: center;
        }

        .watch-info {
          display: grid;
          gap: 16px;
          padding-top: 20px;
        }

        .watch-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .watch-title-row h2 {
          margin: 0;
          color: #fff;
          font-size: 23px;
          font-weight: 950;
          line-height: 1.3;
        }

        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 38px;
          padding: 0 14px;
          border: 0;
          border-radius: 999px;
          background: #252525;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .like-button span:first-child {
          color: #ff4f9a;
          font-size: 17px;
        }

        .channel-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .channel-avatar,
        .comment-avatar {
          display: inline-grid;
          width: 42px;
          height: 42px;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff4f9a, #6f6cff);
          color: #fff;
          font-size: 15px;
          font-weight: 950;
        }

        .channel-row strong {
          color: #fff;
          font-size: 15px;
          font-weight: 900;
        }

        .notice-box {
          padding: 16px 18px;
          border-radius: 8px;
          background: #202020;
          color: #d8d8d8;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.65;
        }

        .notice-box p {
          margin: 8px 0 0;
          color: #b8b8b8;
        }

        .comments-panel {
          padding-top: 8px;
        }

        .comments-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .comments-head h3 {
          margin: 0;
          color: #fff;
          font-size: 18px;
          font-weight: 950;
        }

        .sort-controls {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #686868;
          font-size: 13px;
          font-weight: 850;
        }

        .sort-controls button {
          border: 0;
          background: transparent;
          color: #9b9b9b;
          font: inherit;
          cursor: pointer;
        }

        .sort-controls button.active {
          color: #fff;
        }

        .comment-form {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .comment-input-wrap textarea {
          display: block;
          width: 100%;
          min-height: 36px;
          padding: 4px 0 8px;
          border: 0;
          border-bottom: 1px solid #4a4a4a;
          outline: 0;
          resize: vertical;
          box-sizing: border-box;
          background: transparent;
          color: #fff;
          font: inherit;
        }

        .comment-input-wrap textarea::placeholder {
          color: #8c8c8c;
        }

        .comment-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 10px;
        }

        .comment-actions button {
          height: 34px;
          padding: 0 15px;
          border: 0;
          border-radius: 999px;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .comment-actions button:first-child {
          background: transparent;
          color: #cfcfcf;
        }

        .comment-actions button:last-child {
          background: #ff3f92;
        }

        .comment-actions button:last-child:disabled {
          background: #333;
          color: #777;
          cursor: default;
        }

        .empty-comments {
          padding: 28px 0 12px;
          color: #9a9a9a;
          font-size: 14px;
          font-weight: 750;
          text-align: center;
        }

        .comment-list {
          display: grid;
          gap: 14px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .comment-list li {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          color: #efefef;
        }

        .comment-list strong {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
        }

        .comment-list p {
          margin: 0;
          color: #d2d2d2;
          font-size: 14px;
          line-height: 1.5;
        }

        .watch-sidebar {
          display: grid;
          gap: 14px;
        }

        .promo-banner {
          min-height: 112px;
          overflow: hidden;
          border-radius: 8px;
          background:
            linear-gradient(110deg, rgba(0, 0, 0, 0.82), rgba(16, 16, 16, 0.22)),
            radial-gradient(circle at 78% 32%, rgba(255, 79, 154, 0.72), transparent 28%),
            linear-gradient(135deg, #373737, #111);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .promo-banner__copy {
          display: grid;
          align-content: end;
          min-height: 112px;
          padding: 16px;
          box-sizing: border-box;
        }

        .promo-banner strong {
          color: #fff;
          font-size: 18px;
          font-weight: 950;
        }

        .promo-banner span {
          margin-top: 4px;
          color: #e5e5e5;
          font-size: 12px;
          font-weight: 800;
        }

        .episode-panel {
          overflow: hidden;
          border-radius: 8px;
          background: #1d1d1d;
        }

        .episode-panel__head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 16px 10px;
        }

        .episode-panel__head h2 {
          margin: 0;
          color: #fff;
          font-size: 17px;
          font-weight: 950;
        }

        .episode-panel__head span {
          color: #9a9a9a;
          font-size: 13px;
          font-weight: 800;
        }

        .episode-list {
          display: grid;
          gap: 8px;
          padding: 0 10px 12px;
        }

        .episode-item {
          display: grid;
          grid-template-columns: 108px 1fr;
          gap: 10px;
          width: 100%;
          padding: 8px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #fff;
          text-align: left;
          cursor: pointer;
        }

        .episode-item:hover {
          background: #282828;
        }

        .episode-item.active {
          border-color: #ff4f9a;
          background: rgba(255, 63, 146, 0.14);
        }

        .episode-thumb {
          position: relative;
          display: grid;
          aspect-ratio: 16 / 9;
          place-items: center;
          overflow: hidden;
          border-radius: 6px;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.16), transparent 48%),
            linear-gradient(135deg, #545454, #1f1f1f);
        }

        .episode-thumb__mark {
          color: rgba(255, 255, 255, 0.42);
          font-size: 30px;
          font-weight: 950;
        }

        .episode-thumb__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .episode-thumb__overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.28);
          color: #fff;
          font-size: 19px;
          font-weight: 950;
        }

        .episode-copy {
          display: grid;
          align-content: center;
          gap: 7px;
          min-width: 0;
        }

        .episode-copy strong {
          display: -webkit-box;
          overflow: hidden;
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.35;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .episode-copy span {
          color: #ff7eb7;
          font-size: 12px;
          font-weight: 900;
        }

        @media (max-width: 1180px) {
          .watch-layout {
            grid-template-columns: 1fr;
          }

          .watch-sidebar {
            grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
          }
        }

        @media (max-width: 760px) {
          .watch-page {
            padding: 14px 12px 40px;
          }

          .watch-topbar {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .watch-topbar h1,
          .watch-side-label {
            justify-self: start;
            max-width: 100%;
          }

          .player-stage {
            min-height: 420px;
          }

          .shorts-video,
          .player-state {
            min-height: 420px;
          }

          .watch-sidebar {
            grid-template-columns: 1fr;
          }

          .watch-title-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .volume-range {
            display: none;
          }
        }
      `}</style>

      <div className="watch-topbar">
        <Link className="watch-back-link" to="/">‹ 작품으로 돌아가기</Link>
        <h1>{title}</h1>
        <span className="watch-side-label">회차 목록</span>
      </div>

      <div className="watch-layout">
        <div className="watch-main">
          <div className="player-frame">
            <div className="player-stage" onClick={togglePlay}>
              {status === 'ready' ? (
                <video
                  ref={videoRef}
                  className="shorts-video"
                  src={playback.playbackUrl}
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                  onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                <div className="player-state" role="status">
                  {status === 'loading' ? '재생 준비 중입니다.' : message}
                </div>
              )}
            </div>

            <div className="player-controls">
              <input
                className="progress-range"
                type="range"
                min="0"
                max={duration || 0}
                value={Math.min(currentTime, duration || 0)}
                onChange={seekTo}
                aria-label="재생 위치"
              />
              <div className="control-row">
                <button type="button" onClick={togglePlay} aria-label={isPlaying ? '일시정지' : '재생'}>
                  {isPlaying ? 'Ⅱ' : '▶'}
                </button>
                <span className="time-label">{formatTime(currentTime)} / {formatTime(duration)}</span>
                <div className="control-spacer" />
                <span aria-hidden="true">▮▮</span>
                <input
                  className="volume-range"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  aria-label="음량"
                />
                <select
                  className="speed-select"
                  value={playbackRate}
                  onChange={(event) => setPlaybackRate(Number(event.target.value))}
                  aria-label="배속"
                >
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
                <button type="button" onClick={toggleFullscreen} aria-label="전체화면">⛶</button>
              </div>
            </div>
          </div>

          <div className="watch-info">
            <div className="watch-title-row">
              <h2>{title}</h2>
              <button className="like-button" type="button">
                <span>♥</span>
                <span>1.2만</span>
              </button>
            </div>

            <div className="channel-row">
              <span className="channel-avatar">S</span>
              <strong>Shorts</strong>
            </div>

            <div className="notice-box">
              <strong>[법적 고지] 본 영상은 저작권자의 허가 없이 복제, 배포, 전송할 수 없습니다.</strong>
              <p>{description}</p>
            </div>

            <div className="comments-panel">
              <div className="comments-head">
                <h3>댓글 {comments.length}</h3>
                <div className="sort-controls">
                  <button
                    className={sortOrder === 'newest' ? 'active' : ''}
                    type="button"
                    onClick={() => setSortOrder('newest')}
                  >
                    최신순
                  </button>
                  <span>|</span>
                  <button
                    className={sortOrder === 'oldest' ? 'active' : ''}
                    type="button"
                    onClick={() => setSortOrder('oldest')}
                  >
                    오래된순
                  </button>
                </div>
              </div>

              <div className="comment-form">
                <span className="comment-avatar">U</span>
                <div className="comment-input-wrap">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="댓글을 입력하세요..."
                  />
                  <div className="comment-actions">
                    <button type="button" onClick={() => setCommentText('')}>취소</button>
                    <button type="button" disabled={!commentText.trim()} onClick={submitComment}>등록</button>
                  </div>
                </div>
              </div>

              {comments.length === 0 ? (
                <div className="empty-comments">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</div>
              ) : (
                <ul className="comment-list">
                  {sortedComments.map((comment) => (
                    <li key={comment.id}>
                      <span className="comment-avatar">U</span>
                      <div>
                        <strong>사용자</strong>
                        <p>{comment.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <aside className="watch-sidebar">
          <div className="promo-banner">
            <div className="promo-banner__copy">
              <strong>{title}</strong>
              <span>지금 감상 중인 작품의 쇼츠 시리즈</span>
            </div>
          </div>

          <section className="episode-panel" aria-label="회차 목록">
            <div className="episode-panel__head">
              <h2>회차 목록</h2>
              <span>{episodes.length}개</span>
            </div>
            <div className="episode-list">
              {episodes.map((episode) => (
                <EpisodeItem
                  key={episode.id}
                  episode={episode}
                  isActive={String(episode.id) === String(videoId)}
                  onSelect={selectEpisode}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default VideoWatchPage;
