import React from "react";
import { RANK_THRESHOLDS } from "../services/config/rank";

export default function RankInfo() {
  return (
    <div>
      <h2>Rank Tiers</h2>
      <p>This is the points required for each tier.</p>
      <ul>
        {RANK_THRESHOLDS.map(({ min, tier }) => (
          <li key={tier}>
            <strong>{tier}:</strong> {min} points
          </li>
        ))}
      </ul>
    </div>
  );
}
