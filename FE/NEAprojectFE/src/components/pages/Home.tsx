import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  const renderPage = (activePage:string) => {
    switch (activePage) {
      case "home": navigate("/home"); break;
      case "letters": navigate("/letters"); break;
      case "create-letter": navigate("/letters/create-letter"); break;
      case "all-letters": navigate("/letters/all-letters"); break;
      case "letter-bin": navigate("/letters/letter-bin"); break;
      case "product": navigate("/products"); break;
      case "create-product": navigate("/products/create-product"); break;
      case "active-products": navigate("/products/active-products"); break;
      case "bin-product": navigate("/products/bin-product"); break;
      case "offices": navigate("/offices"); break;
      case "create-office": navigate("/offices/create-office"); break;
      case "office-list": navigate("/offices/office-list"); break;
      case "receiver": navigate("/receiver"); break;
      case "create-receiver": navigate("/receiver/create-receiver"); break;
      case "receiver-list": navigate("/receiver/receiver-list"); break;
      case "branches": navigate("/branches"); break;
      case "all-branches": navigate("/branches/all-branches"); break;
      case "create-branch": navigate("/branches/create-branch"); break;
      case "employee": navigate("/employees"); break;
      case "create-employee": navigate("/employees/create"); break;
      case "manage-employees": navigate("/employees/manage"); break;
      case "profile": navigate("/profile"); break;
    }
  };

  return (
    <div className="flex">
      <Sidebar onSelect={renderPage} />
      <main className="flex-1 max-md:ml-10 p-4 min-h-screen max-h-screen overflow-y-auto bg-[#A7B9D6] " >
      <Outlet/>
      </main>
    </div>
  );

};
export default Home;
