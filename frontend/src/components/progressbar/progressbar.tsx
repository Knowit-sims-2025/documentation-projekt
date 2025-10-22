import React, { useImperativeHandle } from "react";
import { getCompletionPercentage } from "../../features/achivements/badgeUtils";
import type { UserBadge } from "../../types/userBadge";

interface ProgressBarProps {
  value: number;      // current user progress
  max?: number; // next threshold
  min?: number;      // previous threshold
  description?: string; // description of widget
  label?: string;     // label of widget
  src?: string;       // optional image URL
  claimText: string; // Text for the claim status/button
  onClaim?: () => void; // Optional click handler for the claim button
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 1,
  min = 0,
  label, 
  description = "",
  src = undefined,
  claimText = "",
  onClaim,
}) => { 
  const percentage = Math.min(Math.max(((value-min) / (max - min)) * 100, 0), 100);
   return (
    <div className={`progress-card ${claimText === 'Claimed' ? 'isClaimed' : ''}`}>
      <div className="progress-header">
        {label && <span className="progress-label">{label}</span>}
        {src && <img src={src} alt="badge icon" className="progress-header-icon" />}
      </div>
      
      {description && <span className="progress-description">{description}</span>}
      
      {onClaim && value >= max && claimText !== 'Claimed' ? (
        <button className="claim-button" onClick={onClaim}>{claimText}</button>
      ) : (
        <>
          <div className="progress-bar-outer">
            <div className="progress-bar" style={{width: `${percentage}%`}}></div>
          </div>
          <div className="progress-numbers">
            {/* This invisible span pushes the other content to the right */}
            <span style={{ visibility: "hidden" }} />
            {claimText && claimText !== "COLLECT" 
              ? <p className="claim-status-text">{claimText}</p>
              : <span>{value}/{max}</span>
            }
          </div>
        </>
      )}
    </div>
  );
};


export default ProgressBar;