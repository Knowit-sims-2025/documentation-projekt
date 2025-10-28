import AchivementCard from "./achievementCard.tsx";
import type { User } from "../../types/types";

interface UserAchievementsProps {
  user: User;
  /** Om ett ID skickas med, öppnas overlayen för den badgen direkt. */
  initialSelectedBadgeId?: number | null;
}

/**
 * En wrapper-komponent som renderar AchievementCard för en specifik användare.
 * Den kan också ta emot ett initialt valt badge-ID för att visa detaljer direkt.
 */
export default function UserAchievements({
  user,
  initialSelectedBadgeId,
}: UserAchievementsProps) {
  return (
    <AchivementCard
      user={user}
      initialSelectedBadgeId={initialSelectedBadgeId}
    />
  );
}
