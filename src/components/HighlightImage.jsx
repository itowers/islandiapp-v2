import { useState, useEffect } from 'react';

export function HighlightImage({ imageUrl, highlightId }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      return;
    }

    setImageSrc(imageUrl);
    setHasError(false);
  }, [imageUrl]);

  const handleError = () => {
    if (imageSrc === imageUrl && !imageSrc.startsWith('/images/')) {
      setImageSrc(`/images/${highlightId}.jpg`);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !imageSrc) {
    return (
      <div className="highlight-image-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt="Highlight"
      className="highlight-image-thumbnail"
      onError={handleError}
    />
  );
}
