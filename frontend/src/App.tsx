import { useTheme } from "./hooks/useTheme";
import Header from "./components/Header";
import Dashboard from "./features/dashboard/Dashboard";
import { AuthProvider } from "./features/AuthContext";
import Footer from "./components/Footer";

export default function App() {
  const { theme, setTheme } = useTheme();
  return (
    <AuthProvider>
      <Header theme={theme} setTheme={setTheme} />
      <Dashboard />
      <Footer />
    </AuthProvider>
  );
}
