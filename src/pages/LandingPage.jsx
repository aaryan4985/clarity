// src/pages/LandingPage.jsx

import HeroSection from "../components/HeroSection";
import ClarityFeatures from "../components/ClarityFeatures";

const clarityFeatures = [
  {
    text: "AI-Driven Verdicts",
    image: "/assets/clarity1.png"
  },
  {
    text: "Weighted Pros/Cons Analyzer",
    image: "/assets/clarity2.png"
  },
  {
    text: "Mind-Mapping Interface",
    image: "/assets/clarity3.png"
  },
  {
    text: "Save & Share Decisions",
    image: "/assets/clarity4.png"
  }
];

const LandingPage = () => {
  return (
    <div className="w-full overflow-x-hidden bg-[#fdfdfd] text-[#060010]">
      <section id="hero">
        <HeroSection />
      </section>

      <section id="features" className="h-screen">
        <ClarityFeatures items={clarityFeatures} />
      </section>
    </div>
  );
};

export default LandingPage;
