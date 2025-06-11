import React, { useState, useEffect } from 'react';

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
};

const CardSwap = ({ children, cardDistance = 60, verticalDistance = 70, delay = 4000, pauseOnHover = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (pauseOnHover && isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % React.Children.count(children));
    }, delay);

    return () => clearInterval(interval);
  }, [children, delay, pauseOnHover, isHovered]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {React.Children.map(children, (child, index) => {
        const isActive = index === currentIndex;
        const offset = (index - currentIndex) * cardDistance;
        const verticalOffset = Math.abs(index - currentIndex) * verticalDistance;
        
        return (
          <div
            key={index}
            className={`absolute transition-all duration-700 ease-out ${
              isActive ? 'z-20 scale-100 opacity-100' : 'z-10 scale-95 opacity-60'
            }`}
            style={{
              transform: `translateX(${offset}px) translateY(${verticalOffset}px)`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="w-full h-screen bg-white flex items-center px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-100 rounded-full opacity-25 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-100 rounded-full opacity-20 blur-lg"></div>
      </div>

      {/* Main content container - Split layout */}
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left side - Text content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-gray-900 leading-tight">
              Make Decisions with <span className="text-blue-500">Clarity</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Transform complex choices into clear, actionable insights. Navigate through life's toughest decisions with confidence.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-700 font-medium">Visual decision frameworks</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-700 font-medium">Smart pros & cons analysis</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-gray-700 font-medium">Collaborative decision making</span>
            </div>
          </div>

          {/* Stats or social proof */}
          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>10k+ decisions made</span>
              </div>
              <span>•</span>
              <span>95% user satisfaction</span>
            </div>
          </div>
        </div>

        {/* Right side - Cards with original animation */}
        <div className="relative h-96 flex justify-center items-center">
          <CardSwap
            cardDistance={60}
            verticalDistance={70}
            delay={4000}
            pauseOnHover={true}
          >
            <Card className="p-8 bg-white shadow-xl text-gray-800 w-[400px] h-[300px] rounded-2xl border border-gray-50 hover:shadow-2xl transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🎯</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Should I Study or Rest?</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Analyze long-term vs short-term gains easily with our intelligent framework.
                </p>
                <div className="pt-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-500">Decision confidence</span>
                    <span className="text-blue-600 font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white shadow-xl text-gray-800 w-[400px] h-[300px] rounded-2xl border border-gray-50 hover:shadow-2xl transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">⚖️</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Pros & Cons Made Visual</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Let AI help you see both sides clearly with interactive visualizations.
                </p>
                <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-600 font-semibold mb-2">Pros (4)</div>
                    <div className="space-y-1 text-gray-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>Better focus</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>Long-term gains</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-red-600 font-semibold mb-2">Cons (2)</div>
                    <div className="space-y-1 text-gray-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        <span>Mental fatigue</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        <span>Time pressure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-white shadow-xl text-gray-800 w-[400px] h-[300px] rounded-2xl border border-gray-50 hover:shadow-2xl transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🤝</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Share Your Thoughts</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Export and discuss decisions with friends or mentors seamlessly.
                </p>
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Team collaboration</span>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 bg-blue-500 rounded-full border-2 border-white"></div>
                      <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white"></div>
                      <div className="w-7 h-7 bg-purple-500 rounded-full border-2 border-white"></div>
                      <div className="w-7 h-7 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+2</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">5 collaborators</span>
                  </div>
                </div>
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;