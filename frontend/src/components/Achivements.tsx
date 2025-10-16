import AchivementCard from "../features/achivements/achievementCard.tsx";
import type { User } from "../types/user.ts";

interface UserAchievementsProps {
  user: User;
}

export default function UserAchievements({ user }: UserAchievementsProps) {
  return <AchivementCard user={user} />;
}
