import {
  Box,
  Spacer,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Flex,
  Container,
  Text,
  background,
} from "@chakra-ui/react";
import {
  AppShell,
  Sidebar,
  SidebarToggleButton,
  SidebarSection,
  NavItem,
  PersonaAvatar,
  SearchInput,
} from "@saas-ui/react";
import { FiHome, FiUsers, FiSettings, FiX, FiSearch } from "react-icons/fi";
import {
  Page,
  PageHeader,
  PageBody,
  DataGrid,
  DataGridPagination,
  Toolbar,
  ToolbarButton,
} from "@saas-ui-pro/react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import "./Mod.css";
import Main from "./components/layout/Main";
import Home from "./pages/home/Home.jsx";
// import Logs from "./pages/logs/Logs.jsx";
import Metrics from "./pages/metric/Metric.jsx";
import Dashboard from "./pages/dashboard/Custom_dashboard.jsx";
import Alerts from "./pages/alert/Alerts.jsx";
import Traces from "./pages/traces/Traces.jsx";

export default function App() {
  const toolbar = (
    <Toolbar size="sm">
      <SearchInput
        size={"50px"}
        icon={<FiSearch />}
        resetIcon={<FiX size="1.6em" />}
      />
      {/* {primaryAction} */}
    </Toolbar>
  );

  return (
    <Router>
      <Main>
        <Routes>
          <Route path="/logs" element={<Home />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alert" element={<Alerts />} />
          <Route path="/trace" element={<Traces />} />
          <Route path="/" element={<Navigate to="/metrics" replace />} />
        </Routes>
      </Main>
    </Router>
  );
}
