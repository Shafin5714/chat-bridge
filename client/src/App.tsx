import "./App.css";

import { AppRoutes } from "@/routes";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import store from "./store";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </ThemeProvider>
  );
}

export default App;
