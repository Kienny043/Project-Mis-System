import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "230px",
        minHeight: "100vh",
        background: "#1f1f1f",
        color: "white",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>Maintenance MIS</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/" style={{ color: "white" }}>Dashboard</Link></li>
        <li><Link to="/create" style={{ color: "white" }}>File a Request</Link></li>
        <li><Link to="/track" style={{ color: "white" }}>Track Status</Link></li>
        <li><Link to="/staff" style={{ color: "white" }}>Staff Panel</Link></li>
        <li><Link to="/admin" style={{ color: "white" }}>Admin Panel</Link></li>
      </ul>
    </div>
  );
}
