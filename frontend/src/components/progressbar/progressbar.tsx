import React from "react";

interface ProgressBarProps {
  value: number;      // current user progress
  max?: number; // next threshold
  min?: number;      // previous threshold
  description?: string; // description of widget
  label?: string;     // label of widget
  src?: string;       // optional image URL
}
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 1,
  min = 0,
  label, 
  description = "",
  src = undefined
}) => {
  const percentage = Math.min(Math.max(((value-min) / (max - min)) * 100, 0), 100);
   return (
    <div className="progress-card">
      <div className="progress-header">
        {label && <span className="progress-label">{label}</span>}
        {src && <img src={src} alt="badge icon" className="progress-header-icon" />}
        
      </div>
      
        {description && <span className="progress-description">{description}</span>}
      <div className="progress-bar-outer">
        <div className="progress-bar" style={{width: `${percentage}%`,}}>
        </div>
      </div>
      <div className="progress-numbers">
        {label && (min !== 0 ? <span>{min}</span> : <span className="invisible" style={{ visibility: "hidden" }}>0</span>)}
        {label && <span>{value}/{max}</span>}
    </div>
    </div>
  );
};


export default ProgressBar;