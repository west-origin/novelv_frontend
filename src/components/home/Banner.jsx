function Banner({ item, variant = 'main' }) {
  if (!item) return null;

  return (
    <section className={`banner banner--${variant}`}>
      <div>
        <p className="eyebrow">{item.label}</p>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
      </div>
      <button type="button">{variant === 'main' ? '바로 보기' : '자세히 보기'}</button>
    </section>
  );
}

export default Banner;
