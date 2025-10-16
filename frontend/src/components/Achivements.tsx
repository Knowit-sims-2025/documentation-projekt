import AchivementCard from "../features/achivements/achievementCard.tsx";
import { useUsers } from "../hooks/useUsers";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage"; 


export default function Achievements() {
    const { data: users, loading, error } = useUsers();
    
      if (loading) return <Loading text="Laddar badges..." />;
      if (error) return <ErrorMessage message={error} />;
    
      // To test with a specific user, find them by their ID from the fetched list.
      const user = users?.find(u => u.id === 1); // Example: Hardcoding for user with ID 5

      return user
        ? <AchivementCard user={user} />
        : <ErrorMessage message="Inga badges hittades." />;
}