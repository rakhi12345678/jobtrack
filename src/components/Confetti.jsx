import { useEffect, useState } from 'react';

const COLORS = ['#5B8DEF', '#B587F5', '#E8A33D', '#45B587', '#E9ECF1'];

// `burstKey` changes each time a celebration should fire (e.g. Date.now()).
// Re-triggering with the same key twice in a row won't fire twice.
export default function Confetti({ burstKey }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!burstKey) return;

    const newPieces = Array.from({ length: 26 }, (_, i) => ({
      id: `${burstKey}-${i}`,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 1.6 + Math.random() * 1.2,
      opacity: 0.7 + Math.random() * 0.3,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), 3000);
    return () => clearTimeout(timer);
  }, [burstKey]);

  if (!pieces.length) return null;

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </>
  );
}
