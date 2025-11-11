import React from "react";
import { Info } from "lucide-react";

const SupportBanner: React.FC = () => (
  <div className="w-full flex justify-center mb-8">
    <div
      className="
        w-full flex items-center gap-3 px-5 py-3 md:py-3.5 rounded-xl
        bg-gradient-to-br from-black/80 via-nerfturf-purple/40 to-black/80
        border border-nerfturf-purple/20
        shadow-xl
        max-w-3xl
        "
      style={{
        fontFamily: "'Poppins', 'Inter', sans-serif",
        boxShadow:
          "0 2px 20px 0 rgba(110,89,165,0.12), 0 1.5px 14px 0 rgba(155,135,245,0.15)",
      }}
    >
      <Info className="h-5 w-5 md:h-6 md:w-6 text-nerfturf-lightpurple flex-shrink-0" />
      <span className="text-white text-base md:text-lg font-bold leading-snug">
        For any doubts or support,
        <span className="font-bold text-nerfturf-lightpurple ml-2">
          Contact Ranjith (RK):
        </span>
        <a
          href="tel:8667637565"
          className="ml-1 underline text-nerfturf-lightpurple font-extrabold hover:text-nerfturf-magenta transition-colors"
          style={{ textDecorationThickness: 2 }}
        >
          8667637565
        </a>
      </span>
    </div>
  </div>
);

export default SupportBanner;
