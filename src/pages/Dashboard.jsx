import Navbar from "../components/Navbar";
import UniversitySelector from "../components/UniversitySelector";

function Dashboard() {

  return (
    <div className="container-fluid">
        <Navbar />
        <UniversitySelector />
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
}

export default Dashboard;