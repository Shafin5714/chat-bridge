import "./App.css";
import { Toaster } from "@/components/ui/sonner";
import { AppRoutes } from "@/routes";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import store from "./store";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </Provider>
    </ThemeProvider>
  );
}

export default App;
