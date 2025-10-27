import { ProfileCard } from "./ProfileCard";
import { useAuth } from "../auth/AuthContext";
import { Loading } from "../../components/ui/Loading";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

export default function Profile() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return <Loading text="Laddar profil..." />;

  return currentUser ? (
    <ProfileCard user={currentUser} />
  ) : (
    <ErrorMessage message="Ingen användare är inloggad." />
  );
}
