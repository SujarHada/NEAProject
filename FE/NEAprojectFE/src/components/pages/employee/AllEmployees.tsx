import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { Employee } from "app/interfaces/interfaces";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useOnClickOutside } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import api from "app/utils/api";

const AllEmployees = () => {
	const params = useParams();
	const { t } = useTranslation();
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
	const [employeesCount, setEmployeesCount] = useState(0);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [nextPage, setNextPage] = useState<string | null>(null);
	const [prevPage, setPrevPage] = useState<string | null>(null);
	const navigate = useNavigate();
	const ref = useRef(null);
	useOnClickOutside<any>(ref, () => setOpenDropdownId(null));

	const [dropdownPosition, setDropdownPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);

	const toggleDropdown = (serial_number: number, e?: React.MouseEvent) => {
		if (openDropdownId === serial_number) {
			setOpenDropdownId(null);
			return;
		}

		const rect = (e?.currentTarget as HTMLElement)?.getBoundingClientRect();
		setDropdownPosition({
			top: rect.bottom + window.scrollY + 5,
			left: rect.right - 180,
		});
		setOpenDropdownId(serial_number);
	};

	const fetchEmployees = async (
		pageUrl?: string,
		pageNum?: number,
		orgId?: string,
	) => {
		try {
			let apiUrl: string;
			if (orgId) {
				apiUrl =
					pageUrl ||
					`/api/employees/by-organization-id/${orgId}/?page=${pageNum || currentPage}`;
			} else {
				apiUrl = pageUrl || `/api/employees/?page=${pageNum || currentPage}`;
			}
			const res = await api.get(apiUrl);
			setEmployees(res.data.results);
			setEmployeesCount(res.data.count);
			setNextPage(res.data.next);
			setPrevPage(res.data.previous);
			if (pageNum) setCurrentPage(pageNum);
		} catch (err: any) {
			if (err.response?.status === 404 && currentPage > 1) {
				await fetchEmployees(undefined, currentPage - 1);
				return;
			}
			console.error("Error fetching employees:", err);
			return [];
		}
	};

	useEffect(() => {
		if (params.id) {
			fetchEmployees(undefined, undefined, params.id);
		} else {
			fetchEmployees();
		}
	}, [params.id]);

	const handleDownload = async () => {
		let apiUrl: string;
		let fileName: string;
		if (params.id) {
			apiUrl = `/api/employees/export-by-organization/${params.id}/`;
			fileName = `employees_${employees[0].branch_name}_${new Date().toISOString()}.csv`;
		} else {
			apiUrl = "/api/employees/export_csv/";
			fileName = `employees_${new Date().toISOString()}.csv`;
		}
		const res = await api.get(apiUrl, {
			responseType: "blob",
			params: {
				status: "active",
			},
		});
		const blob = new Blob([res.data], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", fileName);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	};

	const totalPages = Math.ceil(employeesCount / 10);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">{t("allEmployees.title")}</h1>
				<button
					onClick={handleDownload}
					className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5"
				>
					Download
				</button>
			</div>
			<div
				className="w-full overflow-x-auto"
				style={{ scrollbarWidth: "thin" }}
			>
				<table className="w-full text-sm text-left text-gray-400">
					<thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
						<tr>
							<th className="px-6 py-3">{t("allEmployees.headers.id")}</th>
							<th className="px-6 py-3">{t("allEmployees.headers.name")}</th>
							<th className="px-6 py-3">{t("allEmployees.headers.email")}</th>
							<th className="px-6 py-3">{t("allEmployees.headers.role")}</th>
							<th className="px-6 py-3">{t("allEmployees.headers.branch")}</th>
							<th className="px-6 py-3">{t("allEmployees.headers.action")}</th>
						</tr>
					</thead>
					<tbody>
						{employees?.length === 0 && (
							<tr className="border-b bg-gray-800 border-gray-700">
								<td
									className="px-6 py-4 font-medium text-center text-white"
									colSpan={6}
								>
									{t("allEmployees.noData")}
								</td>
							</tr>
						)}

						{employees?.map((employee) => (
							<tr
								key={employee.id}
								className="border-b bg-gray-800 border-gray-700"
							>
								<td className="px-6 py-4">
									{employee.serial_number || employee.id}
								</td>
								<td className="px-6 py-4">
									{employee.first_name} {employee?.middle_name}{" "}
									{employee.last_name}
								</td>
								<td className="px-6 py-4">{employee.email}</td>
								<td className="px-6 py-4">{employee.role}</td>
								<td className="px-6 py-4">{employee.branch_name}</td>
								<td className="px-6 py-4 relative">
									<button
										onClick={(e) => toggleDropdown(employee.id, e)}
										className="text-white outline-none bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 items-center"
									>
										⋮
									</button>
									{openDropdownId === employee.id && (
										<div
											ref={ref}
											className="fixed z-[99999] w-44 divide-y divide-gray-100 rounded-lg shadow-lg bg-gray-700"
											style={{
												top: dropdownPosition?.top ?? 0,
												left: dropdownPosition?.left ?? 0,
											}}
										>
											<ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
												<li>
													<button
														onClick={() =>
															navigate(`/employees/edit/${employee.id}`)
														}
														className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
													>
														{t("allEmployees.edit")}
													</button>
												</li>
											</ul>
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{employeesCount > 10 && (
				<ul className="flex items-center justify-center h-8 text-sm">
					<li>
						<button
							onClick={() =>
								prevPage && fetchEmployees(prevPage, currentPage - 1)
							}
							disabled={!prevPage}
							className={`flex items-center justify-center px-3 h-8 border rounded-s-lg bg-gray-800 border-gray-700 ${prevPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
						>
							<FaChevronLeft />
						</button>
					</li>

					{Array.from({ length: totalPages }).map((_, i) => (
						<li key={i}>
							<button
								onClick={() => fetchEmployees(undefined, i + 1, params?.id)}
								className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
							>
								{i + 1}
							</button>
						</li>
					))}

					<li>
						<button
							onClick={() =>
								nextPage && fetchEmployees(nextPage, currentPage + 1)
							}
							disabled={!nextPage}
							className={`flex items-center justify-center px-3 h-8 border rounded-e-lg bg-gray-800 border-gray-700 ${nextPage ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-600 cursor-not-allowed"}`}
						>
							<FaChevronRight />
						</button>
					</li>
				</ul>
			)}
		</div>
	);
};

export default AllEmployees;
