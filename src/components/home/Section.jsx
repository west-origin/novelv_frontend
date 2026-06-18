function Section({ title, description, children }) {
  return (
    <section className="home-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <button type="button">전체보기</button>
      </div>
      {children}
    </section>
  );
}

export default Section;
