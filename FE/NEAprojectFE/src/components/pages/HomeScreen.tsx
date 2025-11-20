import { useEffect, useState } from "react";
import {
  Activity,
  Building2,
  User,
  FileText,
  Inbox,
  Download,
  RefreshCcw,
} from "lucide-react";
import type { dashboard } from "../../interfaces/interfaces";
import api from "../../utils/api";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<dashboard>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/dashboard/");
        setStats(response.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    const res = await api.get("/api/dashboard/export_csv/", {
      responseType: "blob",
      params: { status: "active" },
    });

    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dashboard_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-900 text-white text-xl">
        {t("dashboard.loading")}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-900 text-red-400 text-lg">
        {t("dashboard.error")}
      </div>
    );
  }

  const cards = [
    { title: t("dashboard.letters"), icon: <FileText />, value: stats.total_letters },
    { title: t("dashboard.active_products"), icon: <Activity />, value: stats.total_active_products },
    { title: t("dashboard.active_branches"), icon: <Building2 />, value: stats.total_active_branches },
    { title: t("dashboard.active_offices"), icon: <Building2 />, value: stats.total_active_offices },
    { title: t("dashboard.active_employees"), icon: <User />, value: stats.total_active_employees },
    { title: t("dashboard.total_receivers"), icon: <Inbox />, value: stats.total_receivers }
  ];

  return (
    <div className="flex flex-col flex-1 min-h-fit h-full bg-[#1E2939] text-white p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-5">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm ">
          <div
            className="border-2 p-2 rounded-full cursor-pointer"
            onClick={handleDownload}
          >
            <Download size={16} />
          </div>
          <span className="flex gap-2 items-center" >
            {<RefreshCcw size={20} />}:{new Date(stats.last_updated).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:bg-gray-950 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400">{card.icon}</div>
              <h2 className="text-lg font-semibold">{card.title}</h2>
            </div>
            <p className="text-4xl font-bold text-blue-400">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
