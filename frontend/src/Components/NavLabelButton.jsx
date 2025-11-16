import React from "react";
import { useState } from "react";

export default function NavLabelButton({
  title,
  iconClass,
  sectionId,
  currentSection,
  setCurrentSection
}) {
  const handleClick = () => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      if (setCurrentSection) {
        setCurrentSection(sectionId);
      }
    }
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  return (
<button
  className="icon-text-group flex items-center gap-5 font-bold-label transition-all duration-300"
  title={title}
  onClick={handleClick}
>
  <div
    className={`icon-button-setup ${iconClass}`}
    style={{
      backgroundColor:
        windowWidth <= 500 && currentSection === sectionId
          ? "var(--color-primary)" // primary color at ≤500px when active
          : "var(--color-black)",  // default color
    }}
  ></div>

  {/* Expanding label only above 500px */}
  <p
    className="icon-text-label overflow-hidden whitespace-nowrap transition-all duration-300"
    style={{
      maxWidth:
        windowWidth > 500
          ? currentSection === sectionId
            ? "20rem"
            : "0rem"
          : "0rem", // collapse text below 500px
      color:
        windowWidth <= 500 && currentSection === sectionId
          ? "var(--color-primary)" // optional text tint at ≤500px
          : "inherit",
    }}
  >
    {title}
  </p>
</button>


  );
}
