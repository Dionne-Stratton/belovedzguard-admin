import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AuthWrapper from "./components/AuthWrapper.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Songs from "./components/Songs.jsx";
import Albums from "./components/Albums.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="songs" element={<Songs />} />
              <Route path="albums" element={<Albums />} />
            </Route>
          </Routes>
        </AuthWrapper>
      </ToastProvider>
    </Router>
  );
}

export default App;
