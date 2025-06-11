// src/components/Navbar.jsx
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how" },
    { name: "Get Started", link: "#start" },
  ];

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800 tracking-wide">
          Clarity<span className="text-purple-600">.</span>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.link}
                className="hover:text-purple-600 transition-colors duration-200"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t">
          <ul className="flex flex-col items-start px-6 py-4 space-y-4 text-gray-700 font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.link}
                  onClick={() => setOpen(false)}
                  className="hover:text-purple-600 transition-colors duration-200"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
