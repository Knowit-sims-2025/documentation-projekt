// src/App.tsx
import React from "react";
import { useTheme } from "./hooks/useTheme";

import Header from "./layout/Header";
import Dashboard from "./features/dashboard/Dashboard";
import Footer from "./layout/Footer";

import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { LoginOverlay } from "./features/auth/LoginOverlay";
import LoginForm from "./features/auth/LoginForm";

/** Shell: använder både tema och auth (måste ligga under AuthProvider). */
function Shell() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />
      <Dashboard />
      <Footer />

      {(!isAuthenticated || isLoading) && (
        <LoginOverlay title="Välkommen" onClose={() => {}} dismissible={false}>
          <LoginForm />
        </LoginOverlay>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
