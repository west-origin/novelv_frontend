function ContinueCard({ item }) {
  return (
    <article className="continue-card">
      <div className="poster poster--wide" style={{ background: item.color }}>
        <span>{item.episode}</span>
      </div>
      <div>
        <h3>{item.title}</h3>
        <p>{item.progress}% 시청</p>
        <div className="progress" aria-label={`${item.title} 진행률 ${item.progress}%`}>
          <span style={{ width: `${item.progress}%` }} />
        </div>
      </div>
    </article>
  );
}

export default ContinueCard;
