import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../components/Dashboard.jsx";
import CreateRequest from "../pages/CreateRequest";
import TrackRequest from "../pages/TrackRequest";
import StaffDashboard from "../pages/StaffDashboard";
import AdminPanel from "../pages/AdminPanel";
import MaintenanceRequestForms from "../components/MaintenanceRequestForm.jsx";
import AccountSettingsDashboard from "../components/Account.jsx";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <div className="app-container" style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/request-form" element={<MaintenanceRequestForms />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateRequest />} />
            <Route path="/track" element={<TrackRequest />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
