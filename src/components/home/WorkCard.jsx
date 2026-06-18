function WorkCard({ item }) {
  return (
    <article className="work-card">
      <div className="poster" style={{ background: item.color }}>
        <span>{item.badge}</span>
      </div>
      <div className="work-card__body">
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <small>{item.meta}</small>
      </div>
    </article>
  );
}

export default WorkCard;
