import { ProfileCard } from "../features/profile/ProfileCard";
import { useAuth } from "../features/auth/AuthContext";
import { Loading } from "./Loading";
import { ErrorMessage } from "./ErrorMessage";

export default function Profile() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return <Loading text="Laddar profil..." />;

  return currentUser ? (
    <ProfileCard user={currentUser} />
  ) : (
    <ErrorMessage message="Ingen användare är inloggad." />
  );
}
