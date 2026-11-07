import { Navigate } from "react-router";

/** The starter dashboard was replaced by the learning paths hub. */
export default function Dashboard() {
  return <Navigate to="/learn" replace />;
}
