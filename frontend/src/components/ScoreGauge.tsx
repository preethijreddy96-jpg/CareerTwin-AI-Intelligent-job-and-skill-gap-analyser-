import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showSubtitle?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
  label = 'Compatibility',
  showSubtitle = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const validScore = Math.max(0, Math.min(100, score || 0));
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  let colorClass = 'text-emerald-500 stroke-emerald-500';
  let badgeText = 'Strong Match';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (validScore < 50) {
    colorClass = 'text-rose-500 stroke-rose-500';
    badgeText = 'Skill Gap Alert';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (validScore < 75) {
    colorClass = 'text-amber-500 stroke-amber-500';
    badgeText = 'Moderate Fit';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-800">
            {Math.round(validScore)}%
          </span>
          {label && <span className="text-xs font-medium text-slate-400 mt-0.5">{label}</span>}
        </div>
      </div>

      {showSubtitle && (
        <span className={`mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeBg}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
};

