import { AchivementCard } from "../features/achivements/achivementCard.tsx";
import { useUsers } from "../hooks/useUsers";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage"; 


export default function Achievements() {
    const { data: users, loading, error } = useUsers();
    
      if (loading) return <Loading text="Laddar badges..." />;
      if (error) return <ErrorMessage message={error} />;
    
      const user = users && users.length > 0 ? users[4] : null;

      return user
        ? <AchivementCard />
    : <ErrorMessage message="Inga badges hittades." />;
}