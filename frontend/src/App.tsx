import { useTheme } from "./hooks/useTheme";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

export default function App() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <Header theme={theme} setTheme={setTheme} />
      <Dashboard />
    </>
  );
}
