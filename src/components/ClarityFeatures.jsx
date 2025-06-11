import React from 'react';
import { gsap } from 'gsap';

function ClarityFeatures({ items = [] }) {
  return (
    <div className="w-full h-full overflow-hidden bg-white relative">
      {/* Subtle background decorative elements matching hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/3 right-20 w-40 h-40 bg-purple-100 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute top-2/3 left-1/3 w-24 h-24 bg-pink-100 rounded-full opacity-10 blur-lg"></div>
      </div>
      
      <div className="flex flex-col h-full m-0 p-0 relative z-10">
        {items.map((item, idx) => (
          <FeatureItem key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}

function FeatureItem({ text, image }) {
  const itemRef = React.useRef(null);
  const marqueeRef = React.useRef(null);
  const marqueeInnerRef = React.useRef(null);
  const timelineRef = React.useRef(null);

  const animationDefaults = { duration: 0.4, ease: 'power2.out' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    
    // Kill any existing animations to prevent conflicts
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    const titleElement = itemRef.current.querySelector('.feature-title');

    // Instantly hide title
    gsap.set(titleElement, { opacity: 0 });
    
    timelineRef.current = gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' });
  };

  const handleMouseLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    
    // Kill any existing animations to prevent conflicts
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    const titleElement = itemRef.current.querySelector('.feature-title');

    // Instantly show title first
    gsap.set(titleElement, { opacity: 1 });

    timelineRef.current = gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' })
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' });
  };

  const repeatedMarqueeContent = Array.from({ length: 4 }).map((_, idx) => (
    <React.Fragment key={idx}>
      <span className="text-gray-800 uppercase font-bold text-[3.5vh] leading-[1.2] p-[1vh_1vw_0] tracking-wide drop-shadow-sm">
        {text}
      </span>
      <div
        className="w-[200px] h-[7vh] my-[2em] mx-[2vw] p-[1em_0] rounded-2xl bg-cover bg-center shadow-xl border-2 border-white backdrop-blur-sm"
        style={{ backgroundImage: `url(${image})` }}
      />
    </React.Fragment>
  ));

  return (
    <div
      className="flex-1 relative overflow-hidden text-center border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-purple-50/20 transition-all duration-300 ease-out cursor-pointer group"
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enhanced subtle decorative gradient behind text */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-center justify-center h-full relative">
        <div className="relative">
          <h2 className="feature-title uppercase font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 bg-clip-text text-transparent text-[4vh] tracking-wider relative z-10 transition-opacity duration-200">
            {text}
          </h2>
        </div>
      </div>
      
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 translate-y-[101%] shadow-2xl backdrop-blur-sm border-t-2 border-blue-200/50"
        ref={marqueeRef}
      >
        <div className="h-full w-[200%] flex" ref={marqueeInnerRef}>
          <div className="flex items-center relative h-full w-[200%] will-change-transform animate-marquee">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClarityFeatures;