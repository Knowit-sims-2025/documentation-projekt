import { useTheme } from "./hooks/useTheme";
import Header from "./layout/Header";
import Dashboard from "./features/pages/Dashboard";
import { AuthProvider } from "./features/AuthContext";
import Footer from "./layout/Footer";

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
