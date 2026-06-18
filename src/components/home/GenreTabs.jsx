function GenreTabs({ genres, selectedGenre, onSelect }) {
  return (
    <div className="genre-tabs" role="tablist" aria-label="장르 선택">
      {genres.map((genre) => (
        <button
          key={genre}
          type="button"
          className={selectedGenre === genre ? 'active' : ''}
          onClick={() => onSelect(genre)}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

export default GenreTabs;
