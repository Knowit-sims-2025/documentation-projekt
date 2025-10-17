import AchivementCard from "../features/achivements/achievementCard.tsx";
import { useCurrentUser } from "../hooks/useCurrentUser.ts";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage"; 


export default function Achievements() {
    const { user, loading, error } = useCurrentUser();
    
      if (loading) return <Loading text="Laddar din profil..." />;
      if (error) return <ErrorMessage message={error} />;

      return user
        ? <AchivementCard user={user} />
        : <ErrorMessage message="Inga badges hittades." />;
}