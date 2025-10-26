import { useState, type ReactElement } from "react";
import {
    FaHome,
    FaRegEnvelope,
    FaBoxOpen,
    FaBuilding,
    FaUsers,
    FaNetworkWired,
    FaUserTie,
    FaUserCircle,
    FaPlus,
    FaList,
    FaTrash,
    FaPen,
    FaAngleUp,
    FaAngleDown,
    FaAngleRight,
    FaAngleLeft,
} from "react-icons/fa";
import useAuthStore from "../../store/useAuthStore";

type SidebarProps = {
    onSelect: (pageId: string) => void;
};

type MenuItem = {
    id: string;
    label: string;
    icon: ReactElement;
    children?: { id: string; label: string; icon: ReactElement }[];
    adminOnly?: boolean;
};

const Sidebar = ({ onSelect }: SidebarProps) => {
    const [collapsed, setCollapsed] = useState(true);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const user = useAuthStore((state) => state.user);
    const handleSelect = (pageId: string) => {
        onSelect(pageId);
        toggleCollapse();
    };

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
        setOpenMenus({});
    };

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const menuItems: MenuItem[] = [
        { id: "home", label: "Home", icon: <FaHome /> },

        {
            id: "letters",
            label: "Letters",
            icon: <FaRegEnvelope />,
            children: [
                ...(user?.role === "admin" ? [{ id: "create-letter", label: "Create Letter", icon: <FaPlus /> }] : []),
                { id: "all-letters", label: "All Letters", icon: <FaList /> },
                { id: "letter-bin", label: "Letter Bin", icon: <FaTrash /> },
            ],
        },

        {
            id: "product",
            label: "Product",
            icon: <FaBoxOpen />,
            children: [
                ...(user?.role === "admin" ? [{ id: "create-product", label: "Create Product", icon: <FaPlus /> }] : []),
                { id: "active-products", label: "Active Products", icon: <FaList /> },
                { id: "bin-product", label: "Bin Product", icon: <FaTrash /> },
            ],
        },

        {
            id: "offices",
            label: "Offices",
            icon: <FaBuilding />,
            children: [
                ...(user?.role === "admin" ? [{ id: "create-office", label: "Create Office", icon: <FaPlus /> }] : []),
                { id: "office-list", label: "Office List", icon: <FaList /> },
            ],
        },

        {
            id: "receiver",
            label: "Receiver",
            icon: <FaUsers />,
            children: [
                ...(user?.role === "admin" ? [{ id: "create-receiver", label: "Create Receiver", icon: <FaPlus /> }] : []),
                { id: "receiver-list", label: "Receiver List", icon: <FaList /> },
            ],
        },

        {
            id: "branches",
            label: "Branches",
            icon: <FaNetworkWired />,
            children: [
                ...(user?.role === "admin" ? [{ id: "create-branch", label: "Create Branch", icon: <FaPlus /> }] : []),
                { id: "all-branches", label: "All Branches", icon: <FaList /> },
            ],
        },

        {
            id: "employee",
            label: "Employee",
            icon: <FaUserTie />,
            children: [
                ...(user?.role === "admin" ? [{ id: "create-employee", label: "Create Employee", icon: <FaPen /> }] : []),
                { id: "manage-employees", label: "Manage Employees", icon: <FaList /> },
            ],
        },

        { id: "profile", label: user?.name!, icon: <FaUserCircle /> },
    ];

    return (
        <div
            className={`flex max-h-screen flex-col ${collapsed ? "w-10" : "w-55"} bg-gray-800 text-white min-h-screen max-md:absolute z-[99999]`}
        >
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} p-4`}>
                {!collapsed && (
                    <h2 className="font-bold text-lg whitespace-nowrap truncate">DASHBOARD</h2>
                )}
                <button onClick={toggleCollapse} className="text-white hover:text-gray-300">
                    {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
                </button>
            </div>

            <ul className="flex-1 space-y-1 max-h-screen overflow-y-scroll" style={{ scrollbarWidth: "none" }}>
                {menuItems.map((item) => (
                    <li key={item.id}>
                        <div
                            className="flex items-center gap-3 p-3 justify-center cursor-pointer hover:bg-gray-700"
                            onClick={() =>
                                item.children
                                    ? collapsed
                                        ? (toggleCollapse(), toggleMenu(item.id))
                                        : toggleMenu(item.id)
                                    : onSelect(item.id)
                            }
                        >
                            <span className="text-xl">{item.icon}</span>
                            {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                            {!collapsed && item.children && (
                                <span className="text-sm">
                                    {openMenus[item.id] ? <FaAngleUp /> : <FaAngleDown />}
                                </span>
                            )}
                        </div>

                        {!collapsed &&
                            item.children &&
                            openMenus[item.id] &&
                            item.children.map((child) => (
                                <ul key={child.id} className="ml-8">
                                    <li
                                        onClick={() => handleSelect(child.id)}
                                        className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-700 text-sm"
                                    >
                                        <span className="text-base">{child.icon}</span>
                                        <span className="truncate">{child.label}</span>
                                    </li>
                                </ul>
                            ))}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
