import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
// import Letters from "./Letters";
// import Product from "./Product";
// import Offices from "./Offices";
// import Receiver from "./Receiver";
// import Branches from "./Branches";
// import Employee from "./Employee";
// import Profile from "./Profile";
import { Outlet } from "react-router";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("home");
  useEffect(() => {
    renderPage();
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case "home": navigate("/home"); break;
      case "letters": navigate("/letters"); break;
      case "product": navigate("/product"); break;
      case "offices": navigate("/offices"); break;
      case "receiver": navigate("/receiver"); break;
      case "branches": navigate("/branches"); break;
      case "employee": navigate("/employee"); break;
      case "profile": navigate("/profile"); break;
    }
  };

  return (
    <div className="flex ">
      <Sidebar onSelect={setActivePage} />
      <main style={{ flex: 1, padding: "20px" }}>
      <Outlet/>
      </main>
    </div>
  );

};
export default Home;
