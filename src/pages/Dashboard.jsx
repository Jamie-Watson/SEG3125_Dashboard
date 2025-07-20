import Navbar from "../components/Navbar";
import UniversitySelector from "../components/UniversitySelector";

function Dashboard() {

  return (
    <div className="container-fluid p-0">
        <Navbar />
        <UniversitySelector />
    </div>
  );
}

export default Dashboard;