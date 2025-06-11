import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Get Started", link: "#start" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, link) => {
    e.preventDefault();
    const element = document.querySelector(link);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      setOpen(false);
    }
  };

  return (
    <nav className={`w-full fixed top-0 left-0 z-50 transition-all duration-700 ease-out ${
      scrolled 
        ? 'backdrop-blur-md bg-white/90 border-b border-gray-200/60 shadow-lg py-3' 
        : 'backdrop-blur-sm bg-white/70 border-b border-gray-100/40 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className={`text-2xl font-bold tracking-wide transition-all duration-500 ${
          scrolled ? 'scale-95' : ''
        }`}>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Clarity
          </span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            .
          </span>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-8 text-gray-700 font-medium ml-auto">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.link}
                onClick={(e) => scrollToSection(e, item.link)}
                className="relative hover:text-purple-600 transition-all duration-300 hover:scale-105 group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-lg transition-all duration-300 ${
              open 
                ? 'bg-gray-100 text-gray-700 rotate-90' 
                : 'hover:bg-gray-100/50 text-gray-600 hover:scale-110'
            }`}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
        open 
          ? 'max-h-64 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100/50 shadow-lg">
          <ul className="flex flex-col px-6 py-4 space-y-4">
            {navItems.map((item, index) => (
              <li 
                key={item.name}
                className={`transform transition-all duration-500 ${
                  open ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <a
                  href={item.link}
                  onClick={(e) => scrollToSection(e, item.link)}
                  className="block text-gray-700 font-medium hover:text-purple-600 hover:bg-purple-50 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  {item.name}
                </a>
              </li>
            ))}
            

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;