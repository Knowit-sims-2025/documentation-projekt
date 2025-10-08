import { useTheme } from "./hooks/useTheme";
import Header from "./components/Header";
import Dashboard from "./features/dashboard/Dashboard";
import { AuthProvider } from "./features/AuthContext";

export default function App() {
  const { theme, setTheme } = useTheme();
  return (
    <AuthProvider>
      <Header theme={theme} setTheme={setTheme} />

      <Dashboard />
    </AuthProvider>
  );
}
