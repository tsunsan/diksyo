import React from "react";
import { motion } from "framer-motion";

/**
 * Neobrutalist Philippine Jeepney — side-view SVG.
 *
 * Designed to sit ON TOP of a road surface. The bottom of the wheels
 * align with the bottom edge of the viewBox so you can position the
 * SVG with its bottom flush against the road.
 *
 * viewBox: 0 0 120 56  (tight fit, no wasted space)
 */
export const JeepneySVG = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 60"
    fill="none"
    className={className}
    style={{ filter: "drop-shadow(3px 3px 0px #000)" }}
    {...props}
  >
    {/* Back step */}
    <rect x="4" y="32" width="16" height="10" fill="#333" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Main body block */}
    <rect x="14" y="12" width="66" height="32" fill="#FFE500" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Front hood block */}
    <rect x="66" y="24" width="42" height="20" fill="#FF6D00" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Bumper block */}
    <rect x="96" y="34" width="14" height="10" fill="#333" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Stripe */}
    <rect x="18" y="32" width="52" height="6" fill="#0057FF" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Roof rack block */}
    <rect x="22" y="4" width="50" height="12" fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    
    {/* Banderitas (little squares) */}
    <rect x="25" y="14" width="6" height="6" fill="#FF0055" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="35" y="14" width="6" height="6" fill="#00C853" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="45" y="14" width="6" height="6" fill="#FF0055" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="55" y="14" width="6" height="6" fill="#00C853" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="65" y="14" width="6" height="6" fill="#FF0055" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />

    {/* Windows */}
    <rect x="22" y="18" width="10" height="10" fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    <rect x="36" y="18" width="10" height="10" fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    <rect x="50" y="18" width="10" height="10" fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    
    {/* Windshield */}
    <rect x="70" y="24" width="14" height="10" fill="#fff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Headlight (square) */}
    <rect x="99" y="26" width="8" height="8" fill="#FFE500" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

    {/* Back Wheel */}
    <circle cx="32" cy="46" r="10" fill="#fff" stroke="#000" strokeWidth="3" />
    <circle cx="32" cy="46" r="3.5" fill="#333" />
    
    {/* Front Wheel */}
    <circle cx="82" cy="46" r="10" fill="#fff" stroke="#000" strokeWidth="3" />
    <circle cx="82" cy="46" r="3.5" fill="#333" />
  </svg>
);

/**
 * Simple inline stop-sign SVG used for each level marker along the road.
 */
export const StopSignSVG = ({
  color,
  isUnlocked,
  isCurrent,
  className,
  ...props
}: {
  color: string;
  isUnlocked: boolean;
  isCurrent: boolean;
} & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 44"
    fill="none"
    className={className}
    {...props}
  >
    {/* Post */}
    <rect
      x="12"
      y="24"
      width="4"
      height="20"
      fill={isUnlocked ? "#555" : "#ccc"}
      stroke={isUnlocked ? "#000" : "#bbb"}
      strokeWidth="2"
    />
    {/* Sign board */}
    <rect
      x="2"
      y="2"
      width="24"
      height="24"
      fill={isUnlocked ? color : "#eee"}
      stroke={isUnlocked ? "#000" : "#ccc"}
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {(isCurrent || isUnlocked) && (
      <rect
        x="0"
        y="0"
        width="28"
        height="44"
        fill="none"
        stroke={isCurrent ? "#FFE500" : "#888"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="opacity-50"
      />
    )}
  </svg>
);

// ────────────────────────────────────────────────────────────
// ENVIRONMENT BACKGROUND COMPONENTS
// ────────────────────────────────────────────────────────────

export const EnvManila = () => (
  <>
    {/* Sun */}
    <div className="absolute top-4 right-[15%] w-10 h-10 bg-[#FFE500] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full" />
    
    {/* Birds */}
    <motion.div animate={{ left: ['110%', '-10%'], y: [0, -15, 10, -5, 15, 0] }} transition={{ left: { repeat: Infinity, duration: 10, ease: "linear" }, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }} className="absolute top-8 z-0">
      <svg width="28" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(2px 2px 0px #000)' }}>
        <path d="M2 10 Q6 2 12 10 Q18 2 22 10" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
    <motion.div animate={{ left: ['120%', '-20%'], y: [0, 20, -10, 5, -15, 0] }} transition={{ left: { repeat: Infinity, duration: 14, ease: "linear", delay: 2 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }} className="absolute top-14 z-0">
      <svg width="20" height="10" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(2px 2px 0px #000)' }}>
        <path d="M2 10 Q6 2 12 10 Q18 2 22 10" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg width="16" height="8" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(2px 2px 0px #000)' }} className="absolute top-4 left-6">
        <path d="M2 10 Q6 2 12 10 Q18 2 22 10" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>

    {/* Clouds */}
    <motion.div animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-6 left-[10%]">
      <div className="w-16 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full" />
    </motion.div>
    <motion.div animate={{ x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-10 left-[55%]">
      <div className="w-20 h-10 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full" />
    </motion.div>

    {/* Trees */}
    <div className="absolute bottom-[56px] left-[5%] flex flex-col items-center">
      <div className="w-10 h-10 bg-[#2E7D32] border-[3px] border-black shadow-[3px_3px_0_#000] z-10 rounded-full" />
      <div className="w-[12px] h-[30px] bg-[#8B5E3C] border-[3px] border-black border-t-0 shadow-[3px_3px_0_#000] -mt-2" />
    </div>
    <div className="absolute bottom-[56px] right-[8%] flex flex-col items-center">
      <div className="w-8 h-8 bg-[#2E7D32] border-[3px] border-black shadow-[3px_3px_0_#000] z-10 rounded-full" />
      <div className="w-[10px] h-[24px] bg-[#8B5E3C] border-[3px] border-black border-t-0 shadow-[3px_3px_0_#000] -mt-1.5" />
    </div>
  </>
);

export const EnvLuneta = () => (
  <>
    {/* Moon */}
    <div className="absolute top-4 right-[20%] w-12 h-12 bg-[#F3F4F6] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full" />
    
    {/* Shining Stars */}
    <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute top-8 left-[15%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#fff]" />
    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }} className="absolute top-12 left-[30%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
    <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-6 left-[60%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#fff]" />
    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1.5 }} className="absolute top-16 right-[35%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
    
    {/* Shooting Star */}
    <motion.div 
      initial={{ x: '100vw', y: -20, opacity: 0 }}
      animate={{ x: '-20vw', y: 80, opacity: [0, 1, 1, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeIn", delay: 2 }}
      className="absolute top-0 right-0 w-8 h-[2px] bg-white z-0"
      style={{ transform: 'rotate(-30deg)', filter: 'drop-shadow(0 0 4px #fff)' }}
    />

    {/* Luneta Monument (Shifted Left to avoid overlapping with center signboard) */}
    <div className="absolute bottom-[56px] left-[20%] -translate-x-1/2 flex flex-col items-center z-10">
      <div className="w-4 h-6 bg-[#4B5563] border-[3px] border-black shadow-[3px_3px_0_#000]" />
      <div className="w-8 h-20 bg-[#D1D5DB] border-[3px] border-black border-t-0 shadow-[3px_3px_0_#000]" />
      <div className="w-16 h-4 bg-[#9CA3AF] border-[3px] border-black border-t-0 shadow-[3px_3px_0_#000]" />
    </div>

    {/* Luneta Park Lamp Posts (Symmetrical around Monument at left-[20%]) */}
    <div className="absolute bottom-[56px] left-[10%] -translate-x-1/2 flex flex-col items-center z-10">
      <div className="w-3 h-3 bg-[#FCD34D] border-[2px] border-black rounded-full shadow-[0_0_8px_#FCD34D]" />
      <div className="w-1.5 h-12 bg-[#374151] border-[2px] border-black border-t-0 shadow-[1px_1px_0_#000]" />
    </div>
    <div className="absolute bottom-[56px] left-[30%] -translate-x-1/2 flex flex-col items-center z-10">
      <div className="w-3 h-3 bg-[#FCD34D] border-[2px] border-black rounded-full shadow-[0_0_8px_#FCD34D]" />
      <div className="w-1.5 h-12 bg-[#374151] border-[2px] border-black border-t-0 shadow-[1px_1px_0_#000]" />
    </div>
  </>
);

export const EnvMayon = () => (
  <>
    {/* Setting Sun & Sunset Clouds */}
    <motion.div 
      animate={{ y: [0, 8, 0], scale: [1, 1.05, 1] }} 
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      className="absolute top-10 left-[40%] w-20 h-20 bg-[#FF4500] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full z-0" 
    />
    <motion.div 
      animate={{ x: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      className="absolute top-16 left-[20%] w-32 h-3 bg-[#FF7F50] border-[2px] border-black shadow-[2px_2px_0_#000] rounded-full z-0" 
    />
    <motion.div 
      animate={{ x: [0, 15, 0] }}
      transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      className="absolute top-24 left-[50%] w-24 h-3 bg-[#FF7F50] border-[2px] border-black shadow-[2px_2px_0_#000] rounded-full z-0" 
    />
    
    {/* Mayon Volcano SVG (Shifted Right) */}
    <div className="absolute bottom-[56px] right-[-2%] w-[320px] h-[140px] z-10">
      <svg viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ filter: 'drop-shadow(4px 4px 0px #000)' }} preserveAspectRatio="none">
        <path d="M150 10 L260 120 L40 120 Z" fill="#2E7D32" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        {/* Ash/clouds near peak */}
        <path d="M135 40 Q150 20 165 40 Q150 60 135 40 Z" fill="#E5E7EB" stroke="#000" strokeWidth="2" />
        <path d="M142 10 Q160 -10 175 10 Q160 30 142 10 Z" fill="#E5E7EB" stroke="#000" strokeWidth="2" />
      </svg>
    </div>

    {/* Cagsawa Ruins Church Tower (Foreground Left) */}
    <div className="absolute bottom-[56px] left-[15%] flex flex-col items-center z-20">
      <div className="w-4 h-5 bg-[#78716C] border-[3px] border-black border-b-0 shadow-[3px_0_0_#000] rounded-t-full flex items-end justify-center pb-1">
        {/* Bell inside */}
        <div className="w-1 h-2 bg-[#444] rounded-t-sm" />
      </div>
      <div className="w-8 h-6 bg-[#A8A29E] border-[3px] border-black border-b-0 shadow-[3px_0_0_#000] flex justify-center items-center">
        {/* Window */}
        <div className="w-2 h-3 bg-[#444] border-[2px] border-black rounded-t-full" />
      </div>
      <div className="w-12 h-16 bg-[#78716C] border-[3px] border-black border-b-0 shadow-[3px_0_0_#000] flex flex-col justify-end pb-2 items-center">
        {/* Door */}
        <div className="w-4 h-6 bg-[#444] border-[2px] border-black border-b-0 rounded-t-full" />
      </div>
      <div className="w-20 h-5 bg-[#A8A29E] border-[3px] border-black shadow-[3px_3px_0_#000]" />
    </div>
  </>
);

export const EnvKayangan = () => (
  <>
    {/* Sun */}
    <div className="absolute top-4 right-[10%] w-10 h-10 bg-[#FFEA00] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full" />
    
    {/* Clouds */}
    <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} className="absolute top-8 left-[20%] w-12 h-6 bg-white border-[3px] border-black shadow-[2px_2px_0_#000] rounded-full" />
    <motion.div animate={{ x: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} className="absolute top-12 left-[60%] w-16 h-8 bg-white border-[3px] border-black shadow-[2px_2px_0_#000] rounded-full" />

    {/* Distant Center Island */}
    <div className="absolute bottom-[56px] left-[50%] -translate-x-1/2 flex items-end opacity-80 z-0">
      <div className="w-10 h-16 bg-[#4B5563] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-t-lg" />
      <div className="w-14 h-24 bg-[#374151] border-[3px] border-black shadow-[3px_3px_0_#000] -ml-4 rounded-t-xl" />
      <div className="w-12 h-14 bg-[#4B5563] border-[3px] border-black shadow-[3px_3px_0_#000] -ml-2 rounded-t-lg" />
    </div>

    {/* Gentle Water Waves (Animated) */}
    <motion.div 
      animate={{ x: [0, -20, 0] }} 
      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      className="absolute bottom-[66px] left-[30%] w-10 h-1.5 bg-[#4FC3F7] border-[1.5px] border-black rounded-full shadow-[1px_1px_0_#000] z-0" 
    />
    <motion.div 
      animate={{ x: [0, 15, 0] }} 
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      className="absolute bottom-[72px] left-[65%] w-16 h-1.5 bg-[#4FC3F7] border-[1.5px] border-black rounded-full shadow-[1px_1px_0_#000] z-0" 
    />

    {/* Foreground Karst Formations (Limestone blocks) */}
    <div className="absolute bottom-[56px] left-[5%] flex items-end z-10">
      <div className="w-12 h-24 bg-[#4B5563] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-t-md" />
      <div className="w-16 h-32 bg-[#374151] border-[3px] border-black shadow-[3px_3px_0_#000] -ml-4 rounded-t-lg" />
      <div className="w-10 h-16 bg-[#6B7280] border-[3px] border-black shadow-[3px_3px_0_#000] -ml-2 rounded-t-sm" />
    </div>
    
    <div className="absolute bottom-[56px] right-[8%] flex items-end z-10">
      <div className="w-14 h-28 bg-[#374151] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-t-lg" />
      <div className="w-12 h-20 bg-[#4B5563] border-[3px] border-black shadow-[3px_3px_0_#000] -ml-4 rounded-t-md" />
    </div>
  </>
);

export const EnvChocolateHills = () => (
  <>
    {/* Sun */}
    <div className="absolute top-4 left-[20%] w-12 h-12 bg-[#FFE500] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full flex items-center justify-center">
      {/* Optional: Simple face or nothing. Let's just leave it plain neobrutalist yellow */}
    </div>

    {/* Hot Air Balloon */}
    <motion.div animate={{ y: [0, -10, 0], x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-10 right-[5%] flex flex-col items-center z-0">
      <div className="w-10 h-12 bg-[#EF4444] border-[3px] border-black shadow-[2px_2px_0_#000]" style={{ borderTopLeftRadius: '50px', borderTopRightRadius: '50px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }} />
      <div className="w-4 h-3 bg-[#D97706] border-[2px] border-black shadow-[2px_2px_0_#000] mt-1" />
    </motion.div>
    
    {/* Distant Hills (Background) */}
    <div className="absolute bottom-[56px] left-[25%] w-20 h-10 bg-[#A16207] border-[3px] border-black shadow-[3px_3px_0_#000] z-0 opacity-80" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />
    <div className="absolute bottom-[56px] right-[40%] w-20 h-10 bg-[#A16207] border-[3px] border-black shadow-[3px_3px_0_#000] z-0 opacity-80" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />

    {/* Tarsier Peeking Sideways Behind a Hill */}
    <div className="absolute bottom-[66px] left-[17%] flex flex-col items-center z-10">
      {/* Exclamation Mark */}
      <motion.div 
        animate={{ opacity: [0, 0, 1, 1, 0, 0], x: [0, 0, -25, -25, 0, 0], rotate: 15 }}
        transition={{ repeat: Infinity, duration: 8, times: [0, 0.25, 0.28, 0.35, 0.38, 1] }}
        className="absolute -left-8 -top-2 text-[#EF4444] font-black text-xl z-20 filter drop-shadow-[2px_2px_0_#000]"
      >
        !
      </motion.div>

      <motion.div 
        animate={{ x: [0, 0, 0, -50, -50, -20, -20, 0], rotate: -90 }} 
        transition={{ repeat: Infinity, duration: 8, times: [0, 0.25, 0.35, 0.4, 0.6, 0.65, 0.85, 1], ease: "easeInOut" }}
        className="flex flex-col items-center origin-center"
      >
        {/* Tarsier Ears */}
        <div className="flex gap-4 mb-[-8px] z-0">
          <div className="w-3 h-3 bg-[#78350F] border-[2px] border-black rounded-full" />
          <div className="w-3 h-3 bg-[#78350F] border-[2px] border-black rounded-full" />
        </div>
        {/* Tarsier Head */}
        <div className="w-8 h-8 bg-[#78350F] border-[2px] border-black rounded-full flex flex-col items-center justify-start pt-1 z-10">
          {/* Big Tarsier Eyes */}
          <div className="flex gap-0.5">
            <div className="w-3 h-3 bg-[#FCD34D] border-[1.5px] border-black rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
            <div className="w-3 h-3 bg-[#FCD34D] border-[1.5px] border-black rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
          </div>
          {/* Tiny nose */}
          <div className="w-1 h-1 bg-black rounded-full mt-0.5" />
        </div>
        {/* Tiny Hands Gripping Hill */}
        <div className="flex gap-4 mt-[-4px] z-20">
          <div className="w-2 h-2 bg-[#78350F] border-[1.5px] border-black rounded-full" />
          <div className="w-2 h-2 bg-[#78350F] border-[1.5px] border-black rounded-full" />
        </div>
      </motion.div>
    </div>

    {/* Foreground Hills */}
    <div className="absolute bottom-[56px] left-[5%] w-24 h-12 bg-[#8B5E3C] border-[3px] border-black shadow-[3px_3px_0_#000] z-10" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />
    <div className="absolute bottom-[56px] left-[15%] w-32 h-16 bg-[#2E7D32] border-[3px] border-black shadow-[3px_3px_0_#000] z-20" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />
    <div className="absolute bottom-[56px] left-[35%] w-28 h-14 bg-[#8B5E3C] border-[3px] border-black shadow-[3px_3px_0_#000] z-10" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />
    
    <div className="absolute bottom-[56px] right-[25%] w-32 h-16 bg-[#2E7D32] border-[3px] border-black shadow-[3px_3px_0_#000] z-20" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />
    <div className="absolute bottom-[56px] right-[5%] w-24 h-12 bg-[#8B5E3C] border-[3px] border-black shadow-[3px_3px_0_#000] z-10" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }} />
  </>
);

export const EnvMactan = () => (
  <>
    {/* Sky Color Change Effect (Sunrise) */}
    <motion.div 
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(180deg, #ea580c 0%, #fb923c 50%, #fde047 100%)' }}
    />

    {/* Rising Sun */}
    <motion.div 
      animate={{ y: [80, -40, -40, 80], scale: [0.8, 1.2, 1.2, 0.8] }} 
      transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      className="absolute bottom-[56px] left-[25%] -translate-x-1/2 w-24 h-24 bg-[#FFE500] border-[3px] border-black shadow-[0_0_30px_#FFE500] rounded-full z-0"
    />

    {/* Distant Clouds */}
    <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-6 left-[15%] w-16 h-6 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full z-10" />
    <motion.div animate={{ x: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} className="absolute top-10 right-[20%] w-20 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full z-10" />

    {/* Floating Particles */}
    <motion.div animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute bottom-[100px] left-[30%] w-2 h-2 bg-[#FCD34D] rounded-full shadow-[0_0_8px_#FCD34D] z-20" />
    <motion.div animate={{ y: [0, -25, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute bottom-[120px] right-[25%] w-1.5 h-1.5 bg-[#FCD34D] rounded-full shadow-[0_0_8px_#FCD34D] z-20" />
    <motion.div animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-[90px] left-[60%] w-2 h-2 bg-[#FCD34D] rounded-full shadow-[0_0_8px_#FCD34D] z-20" />

    {/* Lapu-Lapu Monument - Moved to the left and made slightly smaller */}
    <div className="absolute bottom-[56px] left-[25%] -translate-x-1/2 flex flex-col items-center z-30">
      {/* Statue */}
      <div className="relative flex flex-col items-center -mb-1">
        {/* Head */}
        <div className="w-5 h-5 bg-[#B45309] border-[3px] border-black shadow-[2px_2px_0_#000] rounded-full z-20 flex items-center justify-center">
          <div className="w-3 h-1.5 bg-black opacity-20 rounded-full" />
        </div>
        {/* Body */}
        <div className="w-6 h-10 bg-[#D97706] border-[3px] border-black shadow-[2px_2px_0_#000] z-10 relative mt-[-2px]">
          {/* Shield */}
          <div className="absolute -left-3 top-2 w-3 h-6 bg-[#92400E] border-[2px] border-black shadow-[2px_2px_0_#000] rounded-full" />
          {/* Sword (Kampilan) */}
          <div className="absolute -right-5 top-1 w-6 h-2 bg-[#E5E7EB] border-[2px] border-black shadow-[2px_2px_0_#000] rotate-[-20deg]" />
        </div>
        {/* Legs */}
        <div className="flex gap-2 -mt-1 z-0">
          <div className="w-2.5 h-5 bg-[#B45309] border-[3px] border-black shadow-[2px_2px_0_#000]" />
          <div className="w-2.5 h-5 bg-[#B45309] border-[3px] border-black shadow-[2px_2px_0_#000]" />
        </div>
      </div>
      
      {/* Pedestal Base */}
      <div className="w-10 h-4 bg-[#9CA3AF] border-[3px] border-black border-b-0 shadow-[3px_0_0_#000] z-20" />
      <div className="w-16 h-5 bg-[#6B7280] border-[3px] border-black border-b-0 shadow-[3px_0_0_#000] z-30" />
      <div className="w-24 h-6 bg-[#4B5563] border-[3px] border-black shadow-[3px_3px_0_#000] z-40 flex items-center justify-center">
        {/* Small detail on the base */}
        <div className="w-6 h-1.5 bg-[#D1D5DB] border-[2px] border-black" />
      </div>
    </div>
  </>
);

export const EnvVigan = () => (
  <>
    {/* Sun */}
    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute top-8 left-[10%] w-12 h-12 bg-[#FFD700] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full z-0" />
    
    {/* Clouds */}
    <motion.div animate={{ x: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} className="absolute top-12 left-[30%] w-16 h-6 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full z-0" />
    <motion.div animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }} className="absolute top-6 right-[10%] w-24 h-8 bg-white border-[3px] border-black shadow-[3px_3px_0_#000] rounded-full z-0" />

    {/* Falling Bougainvillea Petals (Enhancement) */}
    <motion.div 
      animate={{ y: [-10, 80], x: [0, -30, -10], rotate: [0, 180], opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      className="absolute top-10 left-[40%] w-1.5 h-1.5 bg-[#BE123C] border-[1px] border-black rounded-sm z-20"
    />
    <motion.div 
      animate={{ y: [-20, 100], x: [0, -40, -20], rotate: [0, -180], opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 10, ease: "linear", delay: 2 }}
      className="absolute top-0 left-[60%] w-2 h-2 bg-[#E11D48] border-[1px] border-black rounded-sm z-20"
    />
    <motion.div 
      animate={{ y: [-10, 70], x: [0, 20, 40], rotate: [0, 90], opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 9, ease: "linear", delay: 1.5 }}
      className="absolute top-12 left-[20%] w-1.5 h-1.5 bg-[#9F1239] border-[1px] border-black rounded-sm z-20"
    />
    <motion.div 
      animate={{ y: [-30, 90], x: [0, 15, -15], rotate: [0, -90], opacity: [0, 1, 0] }}
      transition={{ repeat: Infinity, duration: 11, ease: "linear", delay: 3 }}
      className="absolute top-4 left-[80%] w-2 h-2 bg-[#BE123C] border-[1px] border-black rounded-sm z-20"
    />

    {/* Vintage Streetlamps (Farolas) */}
    <div className="absolute bottom-[56px] left-[45%] -translate-x-1/2 flex flex-col items-center z-10 scale-[0.8] origin-bottom">
      <motion.div animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="w-8 h-8 bg-[#FEF08A] rounded-full absolute -top-3 opacity-60 blur-[6px] z-0 pointer-events-none" />
      <div className="w-3 h-4 bg-[#FEF08A] border-[1.5px] border-black z-10 rounded-t-sm" />
      <div className="w-1 h-14 bg-[#1F2937] border-x-[1px] border-black z-0" />
    </div>
    <div className="absolute bottom-[56px] left-[95%] -translate-x-1/2 flex flex-col items-center z-10 scale-[0.7] origin-bottom">
      <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1 }} className="w-8 h-8 bg-[#FEF08A] rounded-full absolute -top-3 opacity-60 blur-[6px] z-0 pointer-events-none" />
      <div className="w-3 h-4 bg-[#FEF08A] border-[1.5px] border-black z-10 rounded-t-sm" />
      <div className="w-1 h-12 bg-[#1F2937] border-x-[1px] border-black z-0" />
    </div>

    {/* Vigan Heritage House (Left) */}
    <div className="absolute bottom-[56px] left-[20%] -translate-x-1/2 flex flex-col items-center z-10 scale-[0.75] origin-bottom">
      {/* Roof */}
      <div className="w-28 h-6 bg-[#991B1B] border-[3px] border-black shadow-[3px_3px_0_#000] z-20 relative overflow-hidden">
        <div className="absolute inset-0 flex justify-evenly">
           <div className="w-[1.5px] h-full bg-black opacity-40" />
           <div className="w-[1.5px] h-full bg-black opacity-40" />
           <div className="w-[1.5px] h-full bg-black opacity-40" />
           <div className="w-[1.5px] h-full bg-black opacity-40" />
        </div>
      </div>
      
      {/* Second Floor (Wood + Capiz Windows) */}
      <div className="w-24 h-12 bg-[#D97706] border-[3px] border-black border-t-0 shadow-[3px_3px_0_#000] flex justify-evenly items-center z-10 -mt-1 p-1">
        {/* Capiz Window 1 */}
        <div className="w-8 h-8 bg-[#FEF08A] border-[2px] border-black grid grid-cols-2 grid-rows-2">
          <div className="border-r-[1.5px] border-b-[1.5px] border-black/50" />
          <div className="border-b-[1.5px] border-black/50" />
          <div className="border-r-[1.5px] border-black/50" />
          <div className="" />
        </div>
        {/* Capiz Window 2 */}
        <div className="w-8 h-8 bg-[#FEF08A] border-[2px] border-black grid grid-cols-2 grid-rows-2">
          <div className="border-r-[1.5px] border-b-[1.5px] border-black/50" />
          <div className="border-b-[1.5px] border-black/50" />
          <div className="border-r-[1.5px] border-black/50" />
          <div className="" />
        </div>
      </div>

      {/* Ground Floor (Stone) */}
      <div className="w-[80px] h-12 bg-[#A8A29E] border-[3px] border-black border-t-0 shadow-[3px_3px_0_#000] flex justify-center items-end z-0 pb-0 relative">
        {/* Stone texture lines */}
        <div className="absolute top-2 left-2 w-4 h-1.5 bg-[#78716C] border-[1px] border-black" />
        <div className="absolute top-6 right-2 w-5 h-1.5 bg-[#78716C] border-[1px] border-black" />
        
        {/* Arched Double Door */}
        <div className="w-8 h-10 bg-[#78350F] border-[2px] border-black border-b-0 rounded-t-full flex justify-center">
          <div className="w-[1.5px] h-full bg-black" />
        </div>
      </div>
    </div>

    {/* Baroque Church (Right) */}
    <div className="absolute bottom-[56px] left-[75%] -translate-x-1/2 flex items-end z-10 scale-[0.75] origin-bottom">
      
      {/* Left Buttress */}
      <div className="w-8 h-16 bg-[#D1D5DB] border-[3px] border-black border-r-0 shadow-[3px_3px_0_#000] origin-bottom-right transform -skew-x-[20deg] translate-x-3 z-10" />

      {/* Main Church Building */}
      <div className="flex flex-col items-center z-20 relative">
        {/* Cross */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
           <div className="w-1.5 h-6 bg-[#4B5563] border-[1.5px] border-black relative">
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-[#4B5563] border-[1.5px] border-black" />
           </div>
        </div>

        {/* Pediment (Triangular top) */}
        <div className="w-[88px] h-10 relative z-10 -mb-1 flex justify-center">
          <svg viewBox="0 0 100 50" className="w-full h-full" style={{ filter: 'drop-shadow(3px 3px 0px #000)' }}>
             <polygon points="50,5 95,50 5,50" fill="#E5E7EB" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
             <circle cx="50" cy="35" r="6" fill="#1F2937" stroke="#000" strokeWidth="3" />
          </svg>
        </div>

        {/* Facade Body */}
        <div className="w-20 h-24 bg-[#E5E7EB] border-[3px] border-black shadow-[3px_3px_0_#000] flex flex-col items-center p-2 relative z-20">
          {/* Rose Window */}
          <div className="w-8 h-8 bg-[#1F2937] border-[2px] border-black rounded-full mb-3 flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-8 h-[1.5px] bg-black rotate-45" />
            <div className="absolute h-8 w-[1.5px] bg-black -rotate-45" />
            <div className="w-4 h-4 border-[1.5px] border-black rounded-full z-10 bg-[#1F2937]" />
          </div>

          {/* Pillars */}
          <div className="absolute left-1 top-0 w-2 h-full bg-[#D1D5DB] border-x-[1.5px] border-black" />
          <div className="absolute right-1 top-0 w-2 h-full bg-[#D1D5DB] border-x-[1.5px] border-black" />

          {/* Main Arched Door */}
          <div className="absolute bottom-0 w-10 h-12 bg-[#78350F] border-[3px] border-black border-b-0 rounded-t-full flex justify-center">
            <div className="w-[1.5px] h-full bg-black" />
          </div>
        </div>
      </div>

      {/* Right Buttress */}
      <div className="w-8 h-16 bg-[#D1D5DB] border-[3px] border-black border-l-0 shadow-[3px_3px_0_#000] origin-bottom-left transform skew-x-[20deg] -translate-x-3 z-10" />

      {/* Detached Bell Tower */}
      <div className="flex flex-col items-center ml-1 z-10">
        <div className="w-5 h-6 bg-[#9CA3AF] border-[3px] border-black shadow-[3px_3px_0_#000] rounded-t-full flex items-end pb-1 justify-center relative -mb-1 z-30">
          <div className="w-2 h-2 bg-[#F59E0B] rounded-full border-[1.5px] border-black" />
        </div>
        <div className="w-8 h-8 bg-[#D1D5DB] border-[3px] border-black shadow-[3px_3px_0_#000] flex justify-center items-center relative -mb-1 z-20">
           <div className="w-2 h-4 bg-[#1F2937] border-[1.5px] border-black rounded-t-full" />
        </div>
        <div className="w-10 h-16 bg-[#E5E7EB] border-[3px] border-black shadow-[3px_3px_0_#000] flex flex-col justify-end items-center pb-2 z-10">
           <div className="w-2 h-6 bg-[#1F2937] border-[1.5px] border-black rounded-t-full" />
        </div>
      </div>

    </div>
  </>
);

export const EnvApo = () => (
  <>
    {/* Cosmic Night Sky with Stars, Moon, Galaxy & Comets */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Neobrutalist Galaxy Band */}
      <div className="absolute top-[-20px] left-[-10%] w-[120%] h-[150px] rotate-[15deg] z-0 overflow-visible pointer-events-none">
        {/* Main galaxy ribbons */}
        <div className="absolute top-4 w-full h-[60px] bg-[#2563EB] opacity-40 border-y-[2px] border-black skew-x-[30deg]" />
        <div className="absolute top-8 w-full h-[40px] bg-[#0EA5E9] opacity-40 border-[2px] border-black -skew-x-[20deg]" />
        <div className="absolute top-12 left-[10%] w-[80%] h-[50px] bg-[#2DD4BF] opacity-30 border-[2px] border-black skew-x-[45deg]" />
        
        {/* Dense Galaxy Stars */}
        <div className="absolute top-2 left-[15%] w-2 h-2 bg-white border-[1px] border-black rounded-sm shadow-[2px_2px_0_#FCD34D]" />
        <div className="absolute top-10 left-[25%] w-3 h-3 bg-[#FCD34D] border-[1px] border-black rounded-full shadow-[2px_2px_0_#fff]" />
        <div className="absolute top-6 left-[40%] w-1.5 h-1.5 bg-white border-[1px] border-black rounded-sm" />
        <div className="absolute top-14 left-[55%] w-2.5 h-2.5 bg-[#BAE6FD] border-[1px] border-black rounded-sm shadow-[2px_2px_0_#fff]" />
        <div className="absolute top-4 left-[75%] w-2 h-2 bg-white border-[1px] border-black rounded-full" />
        <div className="absolute top-12 left-[85%] w-3 h-3 bg-[#67E8F9] border-[1px] border-black rounded-sm shadow-[2px_2px_0_#fff]" />
      </div>

      {/* Massive Glowing Neobrutalist Moon */}
      <div className="absolute top-[20px] left-[65%] w-24 h-24 bg-[#FEF08A] border-[4px] border-black rounded-full shadow-[8px_8px_0_#F59E0B] flex items-center justify-center">
        {/* Craters */}
        <div className="absolute top-4 left-4 w-6 h-6 bg-[#FDE047] border-[2px] border-black rounded-full" />
        <div className="absolute bottom-4 right-6 w-4 h-4 bg-[#FDE047] border-[2px] border-black rounded-full" />
        <div className="absolute top-10 right-3 w-3 h-3 bg-[#FDE047] border-[2px] border-black rounded-full" />
      </div>

      {/* Shooting Star / Comet */}
      <motion.div 
        animate={{ x: ['150vw', '-50vw'], y: [-50, 150] }}
        transition={{ repeat: Infinity, duration: 8, delay: 2, ease: "linear" }}
        className="absolute top-0 left-0 flex items-center z-0"
      >
        <div className="w-16 h-1 bg-gradient-to-r from-transparent to-white" />
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff]" />
      </motion.div>

      {/* Twinkling Stars */}
      <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="absolute top-4 left-[20%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }} className="absolute top-12 left-[50%] w-2 h-2 bg-[#FCD34D] rounded-full shadow-[0_0_10px_#FCD34D]" />
      <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-8 right-[30%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }} className="absolute top-16 right-[15%] w-1 h-1 bg-white rounded-full shadow-[0_0_6px_#fff]" />
      <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1.5 }} className="absolute top-6 left-[70%] w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#fff]" />
      <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.8 }} className="absolute top-20 left-[10%] w-1.5 h-1.5 bg-[#FCD34D] rounded-full shadow-[0_0_8px_#FCD34D]" />
    </div>

    {/* Stylized Floating Clouds (Neobrutalist) */}
    <motion.div 
      animate={{ x: [-20, 20, -20] }} 
      transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      className="absolute bottom-[100px] left-[15%] z-0"
    >
      <div className="w-24 h-8 bg-white border-[3px] border-black shadow-[4px_4px_0_#000] rounded-full opacity-90" />
      <div className="absolute -top-4 left-4 w-12 h-8 bg-white border-[3px] border-black border-b-0 rounded-t-full" />
    </motion.div>

    <motion.div 
      animate={{ x: [20, -20, 20] }} 
      transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[130px] right-[10%] z-0"
    >
      <div className="w-32 h-10 bg-white border-[3px] border-black shadow-[4px_4px_0_#000] rounded-full opacity-90" />
      <div className="absolute -top-5 left-6 w-16 h-10 bg-white border-[3px] border-black border-b-0 rounded-t-full" />
    </motion.div>

    {/* Distant Mountain Silhouettes */}
    <div className="absolute bottom-[56px] left-[0%] w-[150px] h-[80px] z-0 opacity-80">
      <svg viewBox="0 0 150 80" className="w-full h-full" style={{ filter: 'drop-shadow(3px 3px 0px #000)' }} preserveAspectRatio="none">
        <path d="M75 10 L150 80 L0 80 Z" fill="#1E1B4B" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>
    <div className="absolute bottom-[56px] right-[-5%] w-[200px] h-[100px] z-0 opacity-80">
      <svg viewBox="0 0 200 100" className="w-full h-full" style={{ filter: 'drop-shadow(3px 3px 0px #000)' }} preserveAspectRatio="none">
        <path d="M100 20 L200 100 L0 100 Z" fill="#1E1B4B" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>

    {/* Main Mount Apo Summit */}
    <div className="absolute bottom-[56px] right-[5%] w-[280px] h-[130px] z-10">
      <svg viewBox="0 0 350 160" className="w-full h-full" style={{ filter: 'drop-shadow(5px 5px 0px #000)' }} preserveAspectRatio="none">
        {/* Right Secondary Peak */}
        <path d="M260 60 L350 160 L180 160 Z" fill="#4338CA" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        <path d="M260 60 L290 95 L270 105 L250 90 Z" fill="#C7D2FE" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
        
        {/* Main Peak */}
        <path d="M150 10 L280 160 L20 160 Z" fill="#312E81" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        
        {/* Main Peak Snow Cap (Jagged Neobrutalism) */}
        <path d="M150 10 L195 65 L170 80 L150 60 L130 75 L105 60 Z" fill="#E0E7FF" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>

    {/* The Mythical Philippine Eagle (Haring Ibon) - Realistic Geometric Phoenix Style */}
    <motion.div 
      animate={{ left: ['-40%', '15%', '65%', '120%'], y: [-100, -60, -80, -110], rotate: [15, -5, -15, 15] }} 
      transition={{ 
        repeat: Infinity, 
        duration: 14, 
        ease: "linear"
      }}
      className="absolute top-[0px] z-[5] scale-[0.25] origin-center flex items-center justify-center"
    >
      {/* Phoenix Golden Fire Trail */}
      <div className="absolute top-[110px] left-[-30px] z-0 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1.2, 0], opacity: [0.9, 0], x: [0, 100] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
            className="w-16 h-16 bg-[#FCD34D] border-[3px] border-[#EA580C] shadow-[0_0_20px_#F59E0B] rounded-full absolute"
            style={{ left: `${-i * 25}px` }}
          />
        ))}
      </div>

      <svg viewBox="0 0 400 250" className="w-[400px] h-[250px] relative z-10" style={{ filter: 'drop-shadow(0px 0px 15px #F59E0B)' }}>
        {/* Right (Background) Wing (Flapping) */}
        <motion.g 
          animate={{ rotate: [-25, 20, -25] }} 
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          style={{ transformOrigin: "210px 75px" }}
        >
          <polygon points="180,90 260,30 320,20 240,60" fill="#EA580C" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="320,20 370,10 330,35 380,30 325,50 360,50 300,70 240,60" fill="#DC2626" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        </motion.g>

        {/* Tail */}
        <polygon points="120,100 40,80 20,110 90,120" fill="#EA580C" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="40,80 10,95 20,110" fill="#FCD34D" stroke="#000" strokeWidth="2" strokeLinejoin="round" />

        {/* Body (Chest & Back) */}
        <polygon points="120,100 180,85 220,100 160,115" fill="#DC2626" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="120,100 160,115 220,100 230,130 180,140 130,125" fill="#FEF08A" stroke="#000" strokeWidth="3" strokeLinejoin="round" />

        {/* Neck & Shaggy Crest */}
        <polygon points="200,90 230,70 250,90 220,110" fill="#F97316" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="210,80 190,50 230,65 240,40 250,70 270,55 260,85" fill="#F59E0B" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="230,65 205,45 225,55" fill="#FEF08A" stroke="#000" strokeWidth="2" strokeLinejoin="round" />

        {/* Head */}
        <polygon points="240,85 260,75 280,85 275,105 245,100" fill="#FEF08A" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        
        {/* Beak */}
        <polygon points="275,85 305,85 315,110 295,98 275,100" fill="#1E293B" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="275,85 300,90 280,95" fill="#334155" stroke="#000" strokeWidth="2" />

        {/* Eye */}
        <polygon points="260,85 268,83 270,88 262,90" fill="#EF4444" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="266" cy="87" r="1.5" fill="#000" />
        <line x1="255" y1="80" x2="275" y2="85" stroke="#000" strokeWidth="3" />

        {/* Left (Foreground) Wing (Flapping) */}
        <motion.g 
          animate={{ rotate: [25, -20, 25] }} 
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          style={{ transformOrigin: "140px 120px" }}
        >
          <polygon points="160,110 210,125 150,170 120,130" fill="#DC2626" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="150,170 160,220 130,185 120,230 105,185 80,220 90,170 120,130" fill="#B91C1C" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="150,170 155,190 140,175" fill="#FCD34D" stroke="#000" strokeWidth="2" />
        </motion.g>
      </svg>
    </motion.div>
  </>
);

/**
 * Jeepney Signboard component for level markers.
 * Mimics the aesthetic of Philippine jeepney signboards.
 */
export const JeepneySignboard = ({
  levelName,
  isUnlocked,
  isCurrent,
  index,
}: {
  levelName: string;
  isUnlocked: boolean;
  isCurrent: boolean;
  index: number;
}) => {
  const templates = [
    // 0: Classic Arch (Manila)
    { 
      type: 'arch', 
      bg: '#FFE500', 
      primaryText: '#D32F2F', 
      primaryStroke: '#fff',
      subBg: '#000', 
      subText: '#FFE500',
      subtitle: 'BUSY MANILA' 
    },
    // 1: Bottom Dome (Luneta)
    { 
      type: 'bottom-dome', 
      bg: '#FFE500', 
      primaryText: '#D32F2F', 
      primaryStroke: 'transparent',
      subBg: '#fff', 
      subText: '#1E3A8A',
      subtitle: 'LUNETA PARK' 
    },
    // 2: Gradient Text (Mayon)
    { 
      type: 'gradient-text', 
      bg: '#000000', 
      primaryText: 'transparent', 
      primaryStroke: 'transparent',
      subBg: '#000000', 
      subText: '#86EFAC',
      subtitle: 'MAYON VOLCANO' 
    },
    // 3: Center Ellipse (Kayangan)
    { 
      type: 'center-ellipse', 
      bg: '#FFFFFF', 
      primaryText: '#FF0000', 
      primaryStroke: 'transparent',
      subBg: '#FEF08A', 
      subText: '#000000',
      subtitle: 'KAYANGAN LAKE' 
    },
    // 4: Shadow Arch (Chocolate Hills)
    { 
      type: 'shadow-arch', 
      bg: '#7F1D1D', 
      primaryText: '#FEF3C7', 
      primaryStroke: 'transparent',
      subBg: '#450A0A', 
      subText: '#F59E0B',
      subtitle: 'CHOCO HILLS' 
    },
    // 5: Split Hill (Mactan)
    { 
      type: 'split-hill', 
      bg: '#DC2626', 
      primaryText: '#FFFFFF', 
      primaryStroke: '#000000',
      subBg: '#FDE047', 
      subText: '#000000',
      subtitle: '~ MACTAN SHRINE ~' 
    },
    // 6: Three Stripes (Vigan)
    { 
      type: 'three-stripes', 
      bg: '#FACC15', 
      primaryText: '#DC2626', 
      primaryStroke: 'transparent',
      subBg: '#60A5FA', 
      subText: '#000000',
      subtitle: 'VIGAN CITY' 
    },
    // 7: Split Arch (Apo)
    { 
      type: 'split-arch', 
      bg: '#000000', 
      primaryText: '#FFE500', 
      primaryStroke: 'transparent',
      subBg: '#000000', 
      subText: '#D32F2F',
      subtitle: 'MOUNT APO' 
    },
  ];

  const t = templates[index % templates.length];

  if (!isUnlocked) {
    return (
      <div className="w-24 h-12 sm:w-28 sm:h-14 bg-[#e8e8e8] border-[3px] border-[#bbb] rounded-sm flex items-center justify-center shadow-[4px_4px_0_#ccc]">
        <span className="text-[#aaa] text-[10px]">🔒</span>
      </div>
    );
  }

  const w = 120;
  const h = 56;

  return (
    <motion.div
      whileHover={{ scale: 1.12, y: -2 }}
      className="relative"
    >
      <div
        className="w-24 h-12 sm:w-28 sm:h-14 border-[3px] border-black rounded-sm flex items-center justify-center overflow-hidden transition-colors relative"
        style={{
          boxShadow: isCurrent ? '0 0 0 3px #000, 0 0 0 6px #FFE500' : '4px 4px 0 #000',
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ fontFamily: "Impact, 'Arial Black', sans-serif" }} preserveAspectRatio="none">
          <rect width={w} height={h} fill={t.bg} />
          
          {t.type === 'arch' && (
            <>
              {/* Inner Border */}
              <rect x="3" y="3" width={w - 6} height={h - 6} fill="none" stroke="#fff" strokeWidth="1.5" rx="2" />
              
              {/* Corner Markers */}
              <path d="M 7 12 L 7 7 L 12 7" fill="none" stroke="#fff" strokeWidth="1.5" />
              <path d="M 113 12 L 113 7 L 108 7" fill="none" stroke="#fff" strokeWidth="1.5" />
              <path d="M 7 44 L 7 49 L 12 49" fill="none" stroke="#fff" strokeWidth="1.5" />
              <path d="M 113 44 L 113 49 L 108 49" fill="none" stroke="#fff" strokeWidth="1.5" />

              {/* Center White Ellipse */}
              <ellipse cx={w/2} cy="26" rx="50" ry="15" fill="#fff" />
              
              {/* Flat Primary Text */}
              <text x={w/2} y="34" fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="3" paintOrder="stroke fill" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                {levelName}
              </text>
              
              {/* Subtitle at the bottom */}
              <text x={w/2} y={h - 7} fill={t.subBg} fontSize="9" fontWeight="800" textAnchor="middle" letterSpacing="0.5" style={{ fontFamily: "'Geist', sans-serif" }}>
                {t.subtitle}
              </text>
            </>
          )}

          {t.type === 'bottom-dome' && (
            <>
              {/* Bottom White Dome */}
              <path d={`M 0 ${h} Q ${w/2} 18 ${w} ${h} Z`} fill={t.subBg} />
              
              {/* Primary Text (Straight) */}
              <text x={w/2} y="28" fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="2" paintOrder="stroke fill" fontSize="26" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                {levelName}
              </text>
              
              {/* Subtitle (Arched along the dome) */}
              <path id={`dome-sub-${index}`} d={`M 15 ${h - 3} Q ${w/2} ${h - 18} ${w - 15} ${h - 3}`} fill="transparent" />
              <text fill={t.subText} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="1">
                <textPath href={`#dome-sub-${index}`} startOffset="50%">{t.subtitle}</textPath>
              </text>
            </>
          )}

          {t.type === 'gradient-text' && (
            <>
              <defs>
                <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="50%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#4ADE80" />
                </linearGradient>
              </defs>
              
              {/* Subtitle at the top */}
              <text x={w/2} y="16" fill={t.subText} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.5">
                {t.subtitle}
              </text>

              {/* Primary Text (Gradient) at the bottom */}
              <g transform={`translate(${w/2}, 46) scale(1, 1.25)`}>
                <text x="0" y="0" fill={`url(#grad-${index})`} fontSize="26" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                  {levelName}
                </text>
              </g>
            </>
          )}

          {t.type === 'center-ellipse' && (
            <>
              {/* Central Yellow Ellipse */}
              <ellipse cx={w/2} cy="26" rx="46" ry="16" fill={t.subBg} />

              {/* Primary Text (Slightly Arched) */}
              <path id={`ellipse-arch-${index}`} d={`M 5 33 Q ${w/2} 18 ${w - 5} 33`} fill="transparent" />
              <text fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="2" paintOrder="stroke fill" fontSize="24" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                <textPath href={`#ellipse-arch-${index}`} startOffset="50%">{levelName}</textPath>
              </text>
              
              {/* Ornaments (Left and Right stars) */}
              <g transform={`translate(22, ${h - 10}) scale(0.6)`}>
                <path d="M -20 0 L -4 -1 L 0 -6 L 4 -1 L 20 0 L 4 1 L 0 6 L -4 1 Z" fill={t.primaryText} />
                <polygon points="0,-3 2,0 0,3 -2,0" fill="#000" />
              </g>
              <g transform={`translate(${w - 22}, ${h - 10}) scale(0.6)`}>
                <path d="M -20 0 L -4 -1 L 0 -6 L 4 -1 L 20 0 L 4 1 L 0 6 L -4 1 Z" fill={t.primaryText} />
                <polygon points="0,-3 2,0 0,3 -2,0" fill="#000" />
              </g>
              
              {/* Subtitle at the bottom */}
              <text x={w/2} y={h - 6} fill={t.subText} fontSize="11" fontWeight="800" fontStyle="italic" textAnchor="middle" letterSpacing="0">
                {t.subtitle}
              </text>
            </>
          )}

          {t.type === 'slanted' && (
            <>
              <polygon points={`0,0 ${w},0 ${w},20 0,40`} fill={t.subBg} opacity="0.2" />
              <text x={w/2} y={h/2 + 2} fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="3" paintOrder="stroke fill" fontSize="18" fontWeight="900" textAnchor="middle" transform={`rotate(-5, ${w/2}, ${h/2})`} letterSpacing="1">{levelName}</text>
              <g transform={`translate(${w - 5}, ${h - 5}) rotate(-5)`}>
                <rect x="-66" y="-14" width={66} height={14} fill={t.subBg} stroke="#000" strokeWidth="1.5" />
                <text x="-33" y="-3" fill={t.subText} fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="0.5" style={{ fontFamily: "'Geist', sans-serif" }}>{t.subtitle}</text>
              </g>
            </>
          )}

          {t.type === 'split-hill' && (
            <>
              {/* Bottom Yellow Hill */}
              <path d={`M 0 ${h} L 0 ${h - 22} Q ${w/2} ${h - 34} ${w} ${h - 22} L ${w} ${h} Z`} fill={t.subBg} />

              {/* Primary Text (DALUBHASA) */}
              <text x={w/2} y="32" fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="2.5" paintOrder="stroke fill" fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                {levelName}
              </text>
              
              {/* Subtitle (~ MACTAN SHRINE ~) */}
              <text x={w/2} y={h - 6} fill={t.subText} fontSize="10" fontWeight="800" textAnchor="middle" letterSpacing="0" style={{ fontFamily: "'Geist', sans-serif" }}>
                {t.subtitle}
              </text>
            </>
          )}

          {t.type === 'three-stripes' && (
            <>
              {/* Middle White Stripe */}
              <rect x="0" y="18.67" width={w} height="18.67" fill="#FFFFFF" />
              {/* Bottom Blue Stripe */}
              <rect x="0" y="37.33" width={w} height="18.67" fill={t.subBg} />

              {/* Primary Text (PANTAS) */}
              <g transform={`translate(${w/2}, 42) scale(1, 1.5)`}>
                <text x="0" y="0" fill={t.primaryText} fontSize="28" fontWeight="900" fontStyle="italic" textAnchor="middle" letterSpacing="0">
                  {levelName}
                </text>
              </g>
              
              {/* Subtitle (VIGAN CITY) */}
              <text x={w - 6} y={h - 4} fill={t.subText} fontSize="10" fontWeight="800" textAnchor="end" letterSpacing="0.5" style={{ fontFamily: "'Geist', sans-serif" }}>
                {t.subtitle}
              </text>
            </>
          )}

          {t.type === 'zigzag' && (
            <>
              <path d={`M 0 ${h/2} L 30 ${h/2-8} L 60 ${h/2+8} L 90 ${h/2-8} L 120 ${h/2+8} L 120 ${h} L 0 ${h} Z`} fill={t.subBg} stroke="#000" strokeWidth="2" />
              <text x={w/2} y={22} fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="3" paintOrder="stroke fill" fontSize="16" fontWeight="900" textAnchor="middle" letterSpacing="1">{levelName}</text>
              <text x={w/2} y={h - 6} fill={t.subText} fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="1" style={{ fontFamily: "'Geist', sans-serif" }}>{t.subtitle}</text>
            </>
          )}

          {t.type === 'split-arch' && (
            <>
              {/* Primary Text (ALAMAT) */}
              <path id={`split-arch-top-${index}`} d={`M -5 32 Q ${w/2} 18 ${w + 5} 32`} fill="transparent" />
              <text fill={t.primaryText} stroke={t.primaryStroke} strokeWidth="1" paintOrder="stroke fill" fontSize="30" fontWeight="900" textAnchor="middle" letterSpacing="0">
                <textPath href={`#split-arch-top-${index}`} startOffset="50%">{levelName}</textPath>
              </text>

              {/* Subtitle (MOUNT APO) */}
              <path id={`split-arch-bot-${index}`} d={`M -5 54 Q ${w/2} 40 ${w + 5} 54`} fill="transparent" />
              <text fill={t.subText} fontSize="22" fontWeight="900" textAnchor="middle" letterSpacing="0">
                <textPath href={`#split-arch-bot-${index}`} startOffset="50%">{t.subtitle}</textPath>
              </text>
            </>
          )}

          {t.type === 'shadow-arch' && (
            <>
              {/* Primary Text Path */}
              <path id={`shadow-arch-top-${index}`} d={`M 2 34 Q ${w/2} 16 ${w - 2} 34`} fill="transparent" />
              
              {/* Drop Shadow for Primary Text */}
              <g transform="translate(2.5, 2.5)">
                <text fill={t.subBg} fontSize="26" fontWeight="900" textAnchor="middle" letterSpacing="0">
                  <textPath href={`#shadow-arch-top-${index}`} startOffset="50%">{levelName}</textPath>
                </text>
              </g>
              
              {/* Primary Text (BATIKAN) */}
              <text fill={t.primaryText} fontSize="26" fontWeight="900" textAnchor="middle" letterSpacing="0">
                <textPath href={`#shadow-arch-top-${index}`} startOffset="50%">{levelName}</textPath>
              </text>
              
              {/* Subtitle Path */}
              <path id={`shadow-arch-bot-${index}`} d={`M 15 50 Q ${w/2} 36 ${w - 15} 50`} fill="transparent" />
              
              {/* Subtitle (CHOCO HILLS) */}
              <text fill={t.subText} fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                <textPath href={`#shadow-arch-bot-${index}`} startOffset="50%">{t.subtitle}</textPath>
              </text>
            </>
          )}
        </svg>
      </div>
      
      {isCurrent && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-3 -right-3 z-20"
        >
          <div className="w-5 h-5 bg-[#FFE500] border-[2px] border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_#000]">
             <svg width="10" height="10" viewBox="0 0 24 24" fill="#000" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
             </svg>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};