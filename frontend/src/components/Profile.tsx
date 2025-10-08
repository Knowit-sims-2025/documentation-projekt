import { ProfileCard } from "../features/profile/ProfileCard";
import { useUsers } from "../hooks/useUsers";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage"; 


export default function profile() {
    const { data: users, loading, error } = useUsers();
    
      if (loading) return <Loading text="Laddar användare..." />;
      if (error) return <ErrorMessage message={error} />;
    
      const user = users && users.length > 0 ? users[4] : null;

      return user
        ? <ProfileCard user={user} />
    : <ErrorMessage message="Ingen användare hittades." />;
}