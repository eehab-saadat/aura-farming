import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Forecasting from "./pages/Forecasting";
import CostConfig from "./pages/CostConfig";
import Optimization from "./pages/Optimization";
import DataManagement from "./pages/DataManagement";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecasting" element={<Forecasting />} />
          <Route path="/cost-config" element={<CostConfig />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/data-management" element={<DataManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
