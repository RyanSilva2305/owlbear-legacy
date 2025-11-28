// Arquivo: owlbear-legacy/src/App.tsx

import { ThemeProvider } from "theme-ui";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import theme from "./theme";
import Home from "./routes/Home";
import Game from "./routes/Game";
import LaravelGame from "./routes/LaravelGame"; // NOVO
import About from "./routes/About";
import FAQ from "./routes/FAQ";
import ReleaseNotes from "./routes/ReleaseNotes";
import HowTo from "./routes/HowTo";

import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { KeyboardProvider } from "./contexts/KeyboardContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import { UserIdProvider } from "./contexts/UserIdContext";

import { ToastProvider } from "./components/Toast";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SettingsProvider>
        <AuthProvider>
          <KeyboardProvider>
            <ToastProvider>
              <Router>
                <Switch>
                  <Route path="/how-to">
                    <HowTo />
                  </Route>
                  <Route path="/release-notes">
                    <ReleaseNotes />
                  </Route>
                  <Route path="/about">
                    <About />
                  </Route>
                  <Route path="/faq">
                    <FAQ />
                  </Route>
                  {/* NOVA ROTA: Auto-start via Laravel */}
                  <Route path="/laravel/:sessaoId">
                    <DatabaseProvider>
                      <UserIdProvider>
                        <LaravelGame />
                      </UserIdProvider>
                    </DatabaseProvider>
                  </Route>
                  {/* Rota normal do jogo */}
                  <Route path="/game/:id">
                    <DatabaseProvider>
                      <UserIdProvider>
                        <Game />
                      </UserIdProvider>
                    </DatabaseProvider>
                  </Route>
                  <Route path="/">
                    <Home />
                  </Route>
                </Switch>
              </Router>
            </ToastProvider>
          </KeyboardProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;