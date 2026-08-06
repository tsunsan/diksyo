"use client";

import React, { useState } from "react";

export function WeeklyWordsChart({ data }: { data: any[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  if (!data || data.length === 0) return null;
  // If max words is 0, we still want a minimum scale
  const maxWords = Math.max(...data.map(d => d.words), 1); 

  return (
    <div className="w-full h-[200px] flex items-end justify-between px-0 pt-10 pb-6 relative font-['Geist','Inter',sans-serif]">
      
      {/* Grid Lines & Y Axis Labels */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col-reverse justify-between pt-10 pb-[26px] pr-2 pl-8">
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const val = pct * maxWords;
          return (
            <div key={i} className="w-full relative">
              <div className="absolute right-full mr-2 -translate-y-1/2 text-[#888] text-[10px] font-bold">
                {Number.isInteger(val) ? val : val.toFixed(2)}
              </div>
              <div className="w-full h-[1px] bg-[#eee]" />
            </div>
          );
        })}
      </div>

      {/* Bars */}
      <div className="flex w-full h-full justify-around items-end relative z-10 gap-2 px-2 sm:px-6">
        {data.map((item, i) => {
          const heightPct = Math.max((item.words / maxWords) * 100, 1);
          return (
            <div 
              key={i}
              className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group relative"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {/* Background Highlight */}
              {hoverIndex === i && (
                <div className="absolute inset-x-0 bottom-[20px] top-0 bg-[#FEF08A] bg-opacity-50 z-0" />
              )}
              
              {/* Invisible taller hover area */}
              <div className="absolute inset-x-0 bottom-0 h-[150%] z-20" />
              
              {/* Tooltip */}
              {hoverIndex === i && (
                <div className="absolute bottom-1/2 left-full ml-2 bg-black border-[2px] border-[#FFE500] px-3 py-2 z-30 pointer-events-none w-max shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                  <p className="text-[#FFE500] text-xs uppercase tracking-wider" style={{ fontWeight: 800 }}>
                    {item.day}
                  </p>
                  <p className="text-white text-sm" style={{ fontWeight: 900 }}>
                    {item.words} words
                  </p>
                </div>
              )}

              {/* Bar */}
              <div 
                className="w-full max-w-[28px] bg-[#0057FF] border-[2px] border-black transition-colors duration-200 z-10 relative"
                style={{ height: `calc(${heightPct}% - 24px)` }}
              />
              <span className="text-black text-[10px] font-extrabold uppercase mt-2 z-10 relative h-[16px]">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-6 left-8 right-0 h-[2px] bg-black z-10 pointer-events-none" />
    </div>
  );
}

export function AccuracyTrendChart({ data }: { data: any[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 1000;
  const height = 200;
  const paddingX = 40;
  const paddingY = 24;

  const getPoints = (pointsData: any[], isStep: boolean = false) => {
    if (pointsData.length <= 1) return "";
    let path = "";
    
    for (let i = 0; i < pointsData.length; i++) {
      const item = pointsData[i];
      const x = paddingX + (i / (pointsData.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - (item.accuracy / 100) * (height - 2 * paddingY - 10);
      
      if (i === 0) {
        path += `M ${x},${y} `;
      } else {
        if (isStep) {
          const prevX = paddingX + ((i - 1) / (pointsData.length - 1)) * (width - 2 * paddingX);
          const prevY = height - paddingY - (pointsData[i-1].accuracy / 100) * (height - 2 * paddingY - 10);
          const midX = (prevX + x) / 2;
          
          path += `L ${midX},${prevY} `;
          path += `L ${midX},${y} `;
        }
        path += `L ${x},${y} `;
      }
      
      if (i === pointsData.length - 1) {
        path += `L ${width},${y} `;
      }
    }
    return path;
  };

  const linePath = getPoints(data, true);
  let areaPath = "";
  if (data.length > 1) {
    areaPath = `${linePath} L ${width},${height - paddingY} L ${paddingX},${height - paddingY} Z`;
  }

  return (
    <div className="w-full h-[200px] relative font-['Geist','Inter',sans-serif]">
      
      {/* HTML Y-axis labels to prevent stretching */}
      <div className="absolute inset-0 pointer-events-none z-0 flex flex-col-reverse justify-between pt-[10px] pb-[24px] pr-2 pl-[30px]">
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const val = pct * 100;
          return (
            <div key={i} className="w-full relative h-0">
              <div className="absolute right-full mr-[14px] -translate-y-1/2 text-[#888] text-[10px] font-bold">
                {val}%
              </div>
            </div>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible relative z-10" preserveAspectRatio="none">
        
        {/* Grid Lines */}
        {[0, 25, 50, 75, 100].map(val => {
          const yPos = height - paddingY - (val/100) * (height - 2*paddingY - 10);
          return (
            <line 
              key={val}
              x1={paddingX} y1={yPos}
              x2={width} y2={yPos}
              stroke="#eee" strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* X Axis Line */}
        <line x1={paddingX} y1={height - paddingY} x2={width} y2={height - paddingY} stroke="#000" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        
        {/* Area & Line */}
        {data.length > 1 && (
          <>
            <path d={areaPath} fill="rgba(0, 200, 83, 0.15)" />
            <path d={linePath} fill="none" stroke="#00C853" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </>
        )}

        {/* Hover Points */}
        {data.map((item, i) => {
          const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - 2 * paddingX);
          const y = height - paddingY - (item.accuracy / 100) * (height - 2 * paddingY - 10);
          const rectWidth = width / Math.max(1, data.length);
          const rectX = x - rectWidth / 2;
          
          return (
            <g key={i} 
               onMouseEnter={() => setHoverIndex(i)}
               onMouseLeave={() => setHoverIndex(null)}
               className="cursor-pointer"
            >
              <rect 
                x={rectX} 
                y={0} 
                width={rectWidth} 
                height={height} 
                fill="transparent" 
              />
              
              {/* Tooltip via foreignObject to easily use HTML/CSS inside SVG */}
              {hoverIndex === i && (
                <foreignObject x={x - 40} y={y - 65} width={100} height={60} className="overflow-visible pointer-events-none">
                  <div className="bg-black border-[2px] border-[#FFE500] px-3 py-2 flex flex-col items-center justify-center w-max mx-auto shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                    <p className="text-[#FFE500] text-xs uppercase tracking-wider m-0 leading-tight" style={{ fontWeight: 800 }}>
                      {item.week}
                    </p>
                    <p className="text-white text-sm m-0 leading-tight" style={{ fontWeight: 900 }}>
                      {item.accuracy}%
                    </p>
                  </div>
                </foreignObject>
              )}
              
              <circle 
                cx={x} cy={y} r={hoverIndex === i ? 7 : 0} 
                fill="#FFE500" 
                stroke="#000" 
                strokeWidth={2} 
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-200 pointer-events-none"
              />
              <text x={x} y={height - 6} textAnchor="middle" fill="#000" fontSize="12" fontWeight="800" className="pointer-events-none" style={{ fontFamily: "'Geist', 'Inter', sans-serif" }}>
                {item.week}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
