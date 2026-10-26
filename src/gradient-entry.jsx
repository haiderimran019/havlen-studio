import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import GradientASCII from './components/GradientASCII.jsx';

const rootElement = document.querySelector('[data-gradient-ascii]');

function HavlenGradient() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.dataset.theme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <GradientASCII
      colors={dark
        ? ['#163029', '#5cc097', '#a6dfc6', '#ece8df']
        : ['#dce9df', '#1d6b51', '#76b99e', '#fffdf8']}
      shape="horizon"
      characters=" .:+xX0#@"
      cellSize={18}
      density={0.76}
      glyphOpacity={dark ? 0.82 : 0.68}
      gradientOpacity={dark ? 0.54 : 0.42}
      glow={0.18}
      depthOfField={0.05}
      flicker={0.12}
      softness={0.7}
      scale={1.06}
      flow={0.42}
      speed={0.55}
      grain={0.035}
      mouseInteraction
      scrambleRadius={0.12}
      clickEffect="wave"
      intro
      lightMode={!dark}
    />
  );
}

if (rootElement) {
  createRoot(rootElement).render(<HavlenGradient />);
}
