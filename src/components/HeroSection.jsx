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
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm mb-4">
            <span className="text-sm font-medium text-gray-600">✨ AI-Powered Decision Making</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
            Make Decisions with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Clarity
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            Transform complex choices into clear, visual insights with AI-powered analysis
          </p>
        </div>

        {/* Cards section */}
        <div className="relative w-full h-96 flex items-center justify-center">
          <CardSwap
            cardDistance={80}
            verticalDistance={20}
            delay={4000}
            pauseOnHover={true}
          >
            <Card className="group relative p-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-3xl w-[420px] h-[280px] hover:shadow-3xl transition-all duration-500 hover:bg-white/90">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                  Should I Study or Rest?
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  Analyze long-term vs short-term gains with intelligent insights that help you make the right choice.
                </p>
              </div>
            </Card>

            <Card className="group relative p-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-3xl w-[420px] h-[280px] hover:shadow-3xl transition-all duration-500 hover:bg-white/90">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">⚖️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">
                  Pros & Cons Made Visual
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  Let AI help you see both sides clearly with beautiful, interactive visualizations.
                </p>
              </div>
            </Card>

            <Card className="group relative p-8 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-2xl rounded-3xl w-[420px] h-[280px] hover:shadow-3xl transition-all duration-500 hover:bg-white/90">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-xl">🤝</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors duration-300">
                  Share Your Thoughts
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-light">
                  Export and discuss decisions with friends, mentors, or team members seamlessly.
                </p>
              </div>
            </Card>
          </CardSwap>
        </div>

        {/* Bottom CTA section */}
        <div className="mt-16 flex flex-col sm:flex-row items-center gap-4">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="relative z-10">Start Making Better Decisions</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button className="px-8 py-4 text-gray-700 font-semibold hover:text-gray-900 transition-colors duration-300 border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50">
            Learn More
          </button>
        </div>

        {/* Progress indicators */}
        <div className="mt-12 flex space-x-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 transition-all duration-300"
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;