import { useState } from 'react';
import { Link } from 'react-router-dom';

const workTitle = '[Shorts] 여우 무녀님은 소원의 대가로 나를 원하신다';

const comments = [
  {
    id: 1,
    author: 'demo_user',
    createdAt: '방금 전',
    content: '플레이어와 회차 목록 UI 테스트용 댓글입니다.',
  },
];

const episodes = [
  {
    id: 1,
    title: '[Shorts] 여우 무녀님은 소원의 대가로 나를 원하신다',
    badge: 'FREE',
    isActive: true,
  },
];

function PlayIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M24 17v30l25-15z" />
    </svg>
  );
}

function VideoPlayerMock() {
  const [ratio, setRatio] = useState('shorts');

  return (
    <section className="player-shell">
      <div className="ratio-toggle" aria-label="비디오 비율 선택">
        <button className={ratio === 'wide' ? 'active' : ''} type="button" onClick={() => setRatio('wide')}>16:9</button>
        <button className={ratio === 'shorts' ? 'active' : ''} type="button" onClick={() => setRatio('shorts')}>9:16</button>
      </div>

      <div className={`video-placeholder ${ratio === 'shorts' ? 'shorts' : 'wide'}`}>
        {/* 추후 실제 영상 연동 시 이 영역을 <video controls src="..." />로 교체하면 됩니다. */}
        <div className="video-frame">
          <div className="play-circle">
            <PlayIcon />
          </div>
        </div>

        <div className="player-progress">
          <span />
        </div>

        <div className="player-controls" aria-label="플레이어 컨트롤 모형">
          <div className="control-left">
            <button type="button">▶</button>
            <button type="button">◀◀</button>
            <button type="button">▶▶</button>
            <strong>0:00 / 0:28</strong>
          </div>
          <div className="control-right">
            <button type="button">🔊</button>
            <strong>1x</strong>
            <button type="button">▣</button>
            <button type="button">⛶</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CreatorInfo() {
  return (
    <div className="creator-row">
      <div className="creator-meta">
        <div className="avatar" aria-hidden="true" />
        <strong>Shorts</strong>
      </div>
      <button className="like-button" type="button" aria-label="좋아요">
        ♡ <span>2</span>
      </button>
    </div>
  );
}

function NoticeBox() {
  return (
    <section className="story-box">
      <div className="legal-notice">
        <strong>[법적 고지]</strong>
        <span>
          본 작품에 등장하는 모든 인물, 명칭, 사건은 실제와 무관한 가상의 설정이며, 등장하는 모든 캐릭터는 만 19세 이상의 성인임을 명시합니다.
          당사는 아동·청소년 보호법 등 관련 법령을 엄격히 준수하고 있습니다.
        </span>
      </div>
      <p>더 많은 이야기는 인증 후 “[여우 무녀님은 소원의 대가로 나를 원하신다]” 작품 검색해주세요!</p>
    </section>
  );
}

function CommentSection() {
  return (
    <section className="comments-section">
      <div className="comments-head">
        <h2>댓글 <span>{comments.length}</span></h2>
        <div>
          <button type="button">최신순</button>
          <span>|</span>
          <button type="button">오래된순</button>
        </div>
      </div>

      <div className="comment-form">
        <div className="avatar muted" aria-hidden="true">H</div>
        <div className="comment-input-wrap">
          <input type="text" placeholder="댓글을 입력하세요..." aria-label="댓글 입력" />
          <div className="comment-actions">
            <button type="button">취소</button>
            <button type="button">등록</button>
          </div>
        </div>
      </div>

      <div className="comment-list">
        {comments.map((comment) => (
          <article className="comment-item" key={comment.id}>
            <div className="avatar muted" aria-hidden="true">{comment.author.slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="comment-meta">
                <strong>{comment.author}</strong>
                <span>{comment.createdAt}</span>
              </div>
              <p>{comment.content}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EpisodeList() {
  return (
    <aside className="episode-panel">
      <div className="episode-head">
        <h2>회차 목록</h2>
        <span>{episodes.length}화</span>
      </div>

      <div className="episode-list">
        {episodes.map((episode) => (
          <button className={`episode-card ${episode.isActive ? 'active' : ''}`} key={episode.id} type="button">
            <div className="episode-thumb">
              <span>Ⅱ</span>
            </div>
            <div className="episode-info">
              <strong>{episode.title}</strong>
              <em>{episode.badge}</em>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function WorkDetail() {
  return (
    <section className="detail-page">
      <style>{`
        .detail-page {
          min-height: calc(100svh - 56px);
          padding: 18px 28px 56px;
          box-sizing: border-box;
          background: #090909;
          color: #f7f8fb;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          color: #cbd1dc;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
        }

        .back-link:hover {
          color: #fff;
        }

        .detail-layout {
          display: grid;
          grid-template-columns: minmax(0, 3fr) minmax(280px, 1fr);
          gap: 28px;
          align-items: start;
        }

        .detail-main {
          min-width: 0;
        }

        .player-shell {
          position: relative;
          width: 100%;
        }

        .ratio-toggle {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 3;
          display: inline-flex;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.42);
        }

        .ratio-toggle button {
          height: 28px;
          padding: 0 10px;
          border: 0;
          background: transparent;
          color: #b8bec8;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .ratio-toggle button.active {
          background: #ff2b7a;
          color: #fff;
        }

        .video-placeholder {
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 10px;
          background: #000;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .video-placeholder.wide {
          aspect-ratio: 16 / 9;
        }

        .video-placeholder.shorts {
          aspect-ratio: 16 / 9;
        }

        .video-frame {
          display: grid;
          place-items: center;
          width: min(36%, 340px);
          height: 100%;
          background:
            linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.88) 88%, rgba(255, 255, 255, 0.18) 100%),
            #2a2a2a;
        }

        .video-placeholder.wide .video-frame {
          width: 100%;
          background: #2a2a2a;
        }

        .play-circle {
          display: grid;
          width: 72px;
          height: 72px;
          place-items: center;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.46);
          color: #fff;
        }

        .play-circle svg {
          width: 38px;
          height: 38px;
          fill: currentColor;
        }

        .player-progress {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 58px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.35);
        }

        .player-progress span {
          display: block;
          width: 0%;
          height: 100%;
          border-radius: inherit;
          background: #ff2b7a;
        }

        .player-controls {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 54px;
          padding: 0 18px;
          box-sizing: border-box;
          background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.82));
        }

        .control-left,
        .control-right {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
        }

        .player-controls button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #fff;
          font: inherit;
          cursor: pointer;
        }

        .work-title {
          margin: 18px 0 8px;
          color: #fff;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0;
          line-height: 1.35;
        }

        .tag-pill {
          display: inline-flex;
          height: 26px;
          align-items: center;
          padding: 0 11px;
          border-radius: 999px;
          background: #242424;
          color: #cdd3de;
          font-size: 13px;
          font-weight: 800;
        }

        .creator-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 18px 0 26px;
        }

        .creator-meta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border-radius: 999px;
          background: linear-gradient(135deg, #737373, #2f2f2f);
          color: #fff;
          font-size: 14px;
          font-weight: 900;
        }

        .avatar.muted {
          background: #272727;
          color: #d8dce5;
        }

        .creator-meta strong {
          color: #fff;
          font-size: 15px;
          font-weight: 900;
        }

        .like-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 15px;
          border: 0;
          border-radius: 999px;
          background: #2a2a2a;
          color: #d8dce5;
          font-size: 18px;
          cursor: pointer;
        }

        .like-button:hover {
          color: #ff6fa6;
        }

        .like-button span {
          font-size: 13px;
          font-weight: 900;
        }

        .story-box {
          padding: 16px;
          border-radius: 10px;
          background: #222;
        }

        .legal-notice {
          display: flex;
          gap: 8px;
          padding: 16px;
          border: 1px solid #343434;
          border-radius: 8px;
          background: #111;
          color: #eef1f7;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.65;
        }

        .legal-notice strong {
          color: #fff;
          white-space: nowrap;
        }

        .story-box p {
          margin: 22px 0 2px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.6;
        }

        .comments-section {
          margin-top: 34px;
        }

        .comments-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .comments-head h2 {
          margin: 0;
          color: #fff;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .comments-head h2 span {
          margin-left: 6px;
          color: #cbd1dc;
        }

        .comments-head div {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #515966;
        }

        .comments-head button {
          border: 0;
          background: transparent;
          color: #cfd5df;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .comment-form,
        .comment-item {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 12px;
          align-items: start;
        }

        .comment-input-wrap input {
          width: 100%;
          height: 42px;
          border: 0;
          border-bottom: 1px solid #333;
          outline: none;
          background: transparent;
          color: #fff;
          font-size: 15px;
          box-sizing: border-box;
        }

        .comment-input-wrap input::placeholder {
          color: #aeb4bf;
        }

        .comment-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }

        .comment-actions button {
          height: 34px;
          padding: 0 18px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .comment-actions button:last-child {
          background: #2b2b2b;
        }

        .comment-list {
          display: grid;
          gap: 18px;
          margin-top: 24px;
        }

        .comment-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 14px;
        }

        .comment-meta span {
          color: #8f96a3;
          font-size: 12px;
        }

        .comment-item p {
          margin: 6px 0 0;
          color: #d4dae4;
          font-size: 14px;
          line-height: 1.55;
        }

        .episode-panel {
          position: sticky;
          top: 74px;
          min-width: 0;
        }

        .episode-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .episode-head h2 {
          margin: 0;
          color: #fff;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: 0;
        }

        .episode-head span {
          color: #cfd5df;
          font-size: 13px;
          font-weight: 800;
        }

        .episode-list {
          display: grid;
          gap: 12px;
        }

        .episode-card {
          display: grid;
          grid-template-columns: 46% 1fr;
          gap: 10px;
          width: 100%;
          padding: 6px;
          border: 1px solid transparent;
          border-radius: 9px;
          background: #151015;
          color: #fff;
          text-align: left;
          cursor: pointer;
        }

        .episode-card.active {
          border-color: #ff2b7a;
          box-shadow: inset 4px 0 0 #ff2b7a;
        }

        .episode-thumb {
          display: grid;
          aspect-ratio: 16 / 9;
          place-items: center;
          overflow: hidden;
          border-radius: 7px;
          background:
            radial-gradient(circle at 65% 30%, rgba(255, 255, 255, 0.42) 0 13%, transparent 14%),
            linear-gradient(135deg, #7b7b7b, #3b3b3b);
          color: #fff;
          font-size: 28px;
          font-weight: 950;
        }

        .episode-info {
          min-width: 0;
          padding: 4px 4px 4px 0;
        }

        .episode-info strong {
          display: -webkit-box;
          overflow: hidden;
          color: #ff2b7a;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.35;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .episode-info em {
          display: block;
          margin-top: 6px;
          color: #ff2b7a;
          font-size: 12px;
          font-style: normal;
          font-weight: 950;
        }

        @media (max-width: 1100px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }

          .episode-panel {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .detail-page {
            padding: 16px 14px 42px;
          }

          .video-frame {
            width: 56%;
          }

          .player-controls {
            padding: 0 12px;
          }

          .control-left,
          .control-right {
            gap: 8px;
            font-size: 12px;
          }

          .legal-notice {
            flex-direction: column;
          }
        }
      `}</style>

      <Link className="back-link" to="/">&lt; 작품으로 돌아가기</Link>

      <div className="detail-layout">
        <main className="detail-main">
          <VideoPlayerMock />

          <h1 className="work-title">{workTitle}</h1>
          <span className="tag-pill">#신인/데뷔</span>

          <CreatorInfo />
          <NoticeBox />
          <CommentSection />
        </main>

        <EpisodeList />
      </div>
    </section>
  );
}

export default WorkDetail;
