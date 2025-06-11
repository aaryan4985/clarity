import { useState, useEffect, useRef } from "react";

const ClaritySlide = ({ bgColor = "bg-blue-600", textColor = "text-white" }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const slideRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (slideRef.current) {
        const rect = slideRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress based on scroll position through the section
        const progress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + rect.height)
        ));
        
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={slideRef}
      className={`h-screen w-full flex items-center justify-center ${bgColor} relative overflow-hidden fixed-section`}
    >
      {/* Color wipe overlay that moves based on scroll */}
      <div 
        className="absolute inset-0 bg-purple-600"
        style={{
          transform: `translateY(${100 - (scrollProgress * 100)}%)`,
          transition: 'transform 0.1s ease-out'
        }}
      />

      {/* CLARITY text - stays fixed in center */}
      <h1 className={`text-[20vw] font-black tracking-tight ${textColor} leading-none relative z-10 fixed-text`}>
        CLARITY
      </h1>
    </section>
  );
};

export default ClaritySlide;