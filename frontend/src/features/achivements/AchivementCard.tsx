import ProgressBar from "../../components/progressbar/progressbar";
import { useBadges } from "../../hooks/useBages";
import { ErrorMessage } from "../../components/ErrorMessage";


export function AchivementCard() {
  const { data: badges, loading, error } = useBadges();

  if (loading) return <div>Laddar badges...</div>;
  if (error) return <div>Kunde inte hämta badges: {error}</div>;

  return (
    <div className="achievements-list">
      {badges.map((badge) => (
        <div className="achievement-item" key={badge.id ?? Math.random()}>
          <ProgressBar
            value={5} //ADD USER PROGRESS HERE
            max={badge.criteriaValue ?? 100}
            label={badge.name}
            src={badge.iconUrl}
          />
        </div>
      ))}
    </div>
  );
}