import React, { useMemo } from 'react';

interface AuthPageWrapperProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

// Different PUC Minas aerial images for variety
const pucImages = [
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Campus aerial
  'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // University building
  'https://images.unsplash.com/photo-1427504494785-cdba58dadff6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Campus path
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'  // Modern campus
];

export function AuthPageWrapper({ children, backgroundImage }: AuthPageWrapperProps) {
  // Select random PUC image if not provided, memoized to prevent flickering on re-renders
  const selectedImage = useMemo(
    () => backgroundImage || pucImages[Math.floor(Math.random() * pucImages.length)],
    [backgroundImage]
  );

  return (
    <main
      className="auth-page-wrapper"
      style={{
        backgroundImage: `url(${selectedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="auth-page-wrapper__overlay" />
      <div className="auth-page-wrapper__content">
        {children}
      </div>
    </main>
  );
}
