import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const R2_BUCKET_URL = import.meta.env.VITE_R2_BUCKET_URL || 'https://novelv.e53ddd024fcaf45c398aa5f81262a740.r2.cloudflarestorage.com';

const slides = [
  {
    id: 1,
    kicker: 'Featured video',
    title: 'NOVELV',
    subtitle: 'Watch the latest creator uploads from Cloudflare R2',
  },
  {
    id: 2,
    kicker: 'New content',
    title: 'R2 PLAY',
    subtitle: 'Private R2 videos are connected through short-lived playback URLs',
  },
  {
    id: 3,
    kicker: 'Creator picks',
    title: 'WATCH',
    subtitle: 'Browse uploaded videos from your creators',
  },
];

function buildR2VideoUrl(objectKey) {
  if (!objectKey) return '';
  return `${R2_BUCKET_URL.replace(/\/$/, '')}/${String(objectKey).replace(/^\//, '')}`;
}

function normalizeWork(video) {
  return {
    id: video.id,
    title: video.title || 'Untitled video',
    channel: video.channel || 'R2',
    time: video.time || '00:00',
    badge: video.badge || 'NEW',
    videoUrl: video.videoUrl || buildR2VideoUrl(video.objectKey),
  };
}

function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const goToSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return undefined;

    timerRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3000);

    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [isPaused]);

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Main banner"
    >
      <div className="slides-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {slides.map((slide, index) => (
          <article className={`hero-slide hero-slide-${index + 1}`} key={slide.id}>
            <div className="hero-copy">
              <p>{slide.kicker}</p>
              <h1>{slide.title}</h1>
              <span>{slide.subtitle}</span>
            </div>
          </article>
        ))}
      </div>

      <button className="carousel-arrow left" type="button" onClick={() => goToSlide(activeIndex - 1)} aria-label="Previous banner">
        &lt;
      </button>
      <button className="carousel-arrow right" type="button" onClick={() => goToSlide(activeIndex + 1)} aria-label="Next banner">
        &gt;
      </button>

      <div className="carousel-dots" aria-label="Banner selector">
        {slides.map((slide, index) => (
          <button
            className={activeIndex === index ? 'active' : ''}
            key={slide.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Show banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function WorkCard({ work }) {
  const navigate = useNavigate();

  const openVideo = () => {
    navigate(`/videos/${work.id}/watch`, { state: { work } });
  };

  return (
    <article className="work-card" onClick={openVideo} role="link" tabIndex={0} onKeyDown={(event) => {
      if (event.key === 'Enter') openVideo();
    }}>
      <div className="thumb-placeholder">
        <span className={`card-badge ${work.badge === 'NEW' ? 'new' : ''}`}>{work.badge}</span>
        <span className="time-stamp">{work.time}</span>
      </div>
      <h3>{work.title}</h3>
      <p>{work.channel}</p>
    </article>
  );
}

function Home() {
  const [works, setWorks] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        const { data } = await api.get('/videos');
        if (!isMounted) return;
        setWorks(Array.isArray(data) ? data.map(normalizeWork) : []);
      } catch {
        if (!isMounted) return;
        setWorks([]);
      }
    }

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="home-content">
      <style>{`
        .home-content {
          min-width: 0;
          padding: 16px 32px 44px;
          background: #090909;
        }

        .hero-carousel {
          position: relative;
          height: clamp(360px, 45vw, 620px);
          overflow: hidden;
          border-radius: 10px;
          background: #555;
        }

        .slides-track {
          display: flex;
          height: 100%;
          transition: transform 560ms ease;
        }

        .hero-slide {
          position: relative;
          flex: 0 0 100%;
          min-width: 100%;
          height: 100%;
          overflow: hidden;
          background:
            radial-gradient(circle at 82% 42%, rgba(232, 236, 242, 0.46) 0 14%, transparent 15%),
            linear-gradient(110deg, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.6) 42%, rgba(126, 126, 126, 0.55) 100%),
            linear-gradient(135deg, #333 0%, #777 48%, #b7b7b7 100%);
        }

        .hero-slide::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0, 0, 0, 0.62), transparent 64%),
            repeating-linear-gradient(90deg, transparent 0 86px, rgba(255, 255, 255, 0.04) 87px 88px);
        }

        .hero-slide-2 {
          background:
            radial-gradient(circle at 76% 36%, rgba(120, 175, 255, 0.45) 0 14%, transparent 15%),
            linear-gradient(115deg, rgba(1, 8, 22, 0.94), rgba(37, 70, 115, 0.6), rgba(148, 158, 172, 0.5)),
            linear-gradient(135deg, #282b31, #7c8796);
        }

        .hero-slide-3 {
          background:
            radial-gradient(circle at 80% 38%, rgba(238, 238, 238, 0.42) 0 14%, transparent 15%),
            linear-gradient(115deg, rgba(2, 2, 2, 0.94), rgba(64, 64, 70, 0.64), rgba(161, 161, 161, 0.5)),
            linear-gradient(135deg, #1d1d1f, #8c8c8c);
        }

        .hero-copy {
          position: relative;
          z-index: 2;
          display: flex;
          max-width: 760px;
          height: 100%;
          flex-direction: column;
          justify-content: center;
          padding: clamp(38px, 7vw, 96px);
          box-sizing: border-box;
        }

        .hero-copy p {
          margin: 0 0 22px;
          color: #ff4f9a;
          font-size: clamp(24px, 3vw, 48px);
          font-weight: 950;
          text-shadow: 0 0 18px rgba(255, 43, 122, 0.32);
        }

        .hero-copy h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(64px, 9vw, 150px);
          font-weight: 950;
          line-height: 0.9;
          letter-spacing: 0;
          text-shadow: 0 0 28px rgba(255, 43, 122, 0.44);
        }

        .hero-copy span {
          margin-top: 28px;
          color: #e7eaf1;
          font-size: clamp(15px, 1.35vw, 22px);
          font-weight: 800;
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          z-index: 4;
          display: inline-grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(23, 23, 23, 0.82);
          color: #fff;
          font-size: 38px;
          line-height: 1;
          transform: translateY(-50%);
          cursor: pointer;
        }

        .carousel-arrow:hover {
          background: #2d2d2d;
        }

        .carousel-arrow.left {
          left: 14px;
        }

        .carousel-arrow.right {
          right: 14px;
        }

        .carousel-dots {
          position: absolute;
          z-index: 5;
          top: 18px;
          left: 50%;
          display: flex;
          gap: 8px;
          transform: translateX(-50%);
        }

        .carousel-dots button {
          width: 9px;
          height: 9px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
        }

        .carousel-dots button.active {
          width: 28px;
          background: #fff;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 22px 0 12px;
        }

        .section-head h2 {
          margin: 0;
          color: #fff;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .section-head button {
          height: 34px;
          padding: 0 16px;
          border: 0;
          border-radius: 999px;
          background: #242424;
          color: #d8dce5;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .work-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .work-card {
          min-width: 0;
          color: #fff;
        }

        .thumb-placeholder {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 8px;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.14), transparent 42%),
            linear-gradient(135deg, #8c8c8c 0%, #6f6f6f 45%, #aaa 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .card-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          display: inline-grid;
          min-width: 42px;
          height: 20px;
          place-items: center;
          padding: 0 7px;
          border-radius: 4px;
          background: #2d2d2d;
          color: #fff;
          font-size: 11px;
          font-weight: 950;
          box-sizing: border-box;
        }

        .card-badge.new {
          background: #ff174f;
        }

        .time-stamp {
          position: absolute;
          right: 6px;
          bottom: 6px;
          padding: 2px 5px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.86);
          color: #fff;
          font-size: 12px;
          font-weight: 800;
        }

        .work-card h3 {
          display: -webkit-box;
          min-height: 38px;
          margin: 10px 0 4px;
          overflow: hidden;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.3;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .work-card p {
          margin: 0;
          color: #aab1bd;
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 1200px) {
          .work-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .home-content {
            padding: 14px 16px 36px;
          }

          .work-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .hero-carousel {
            height: 360px;
          }

          .hero-copy {
            padding: 28px;
          }

          .hero-copy h1 {
            font-size: 58px;
          }

          .hero-copy p {
            font-size: 24px;
          }

          .work-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Carousel />

      <div className="section-head">
        <h2>인기 작품</h2>
        <button type="button">더보기</button>
      </div>

      <div className="work-grid">
        {works.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}

export default Home;
