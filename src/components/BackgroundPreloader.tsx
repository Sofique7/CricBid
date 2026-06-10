'use client';

import { useEffect } from 'react';

export const BackgroundPreloader = () => {
  useEffect(() => {
    // List of WebP team backgrounds to preload globally
    const backgrounds = [
      "/team-backgrounds/csk-background.webp",
      "/team-backgrounds/mi-background.webp",
      "/team-backgrounds/rcb-background.webp",
      "/team-backgrounds/kkr-background.webp",
      "/team-backgrounds/srh-background.webp",
      "/team-backgrounds/dc-background.webp",
      "/team-backgrounds/rr-background.webp",
      "/team-backgrounds/pbks-background.webp",
      "/team-backgrounds/gt-background.webp",
      "/team-backgrounds/lsg-background.webp"
    ];

    backgrounds.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
};

export default BackgroundPreloader;
