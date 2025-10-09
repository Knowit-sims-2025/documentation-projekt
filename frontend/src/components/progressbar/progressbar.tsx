import React from "react";

interface ProgressBarProps {
  value: number;      // current user progress
  max?: number; // next threshold
  min?: number;      // previous threshold
  label?: string;     // label of widget
  src?: string;       // optional image URL
}
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 1,
  min = 1,
  label, 
  src = undefined
}) => {
  const percentage = Math.min(Math.max(((value-min) / (max - min)) * 100, 0), 100);
  const hideLabel = percentage < 10;
   return (
    <div className="progress-card">
      {label && <span className="progress-label">{label}</span>}
      {src && <img src={src} alt="" />}
      <div className="progress-bar-outer">
        <div
          className="progress-bar"
          style={{
            width: `${percentage}%`,
          }}>
            {!hideLabel && <span>{value}</span>}
            </div>
      </div>
      <div className="progress-numbers">
        {label && <span>{min}</span>}
        {label && <span>{max}</span>}
    </div>
    </div>
  );
};


export default ProgressBar;