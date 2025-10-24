import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router";
import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const renderPage = (activePage: string) => {
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

  // Close info card if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };
    if (showInfo) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo]);

  return (
    <div className="flex relative">
      <Sidebar onSelect={renderPage} />
      <main className="flex-1 max-md:ml-10 p-4 min-h-screen max-h-screen overflow-y-auto bg-[#A7B9D6]">
        <Outlet />

        {/* Info icon and card */}
        <div className="fixed bottom-6 right-6 z-50">
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg transition-all duration-300"
            title="Click for info"
          >
            <FaInfoCircle size={16} />
          </div>

          <div
            ref={cardRef}
            className={`absolute bottom-10 right-0 bg-white text-black shadow-xl rounded-lg w-64 p-4 transition-all duration-300 ${
              showInfo ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <p className="text-sm text-gray-600">
              Made with ❤️ by Hashtag Web Solutions Pvt. Ltd
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
