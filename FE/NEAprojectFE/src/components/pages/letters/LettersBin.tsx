import { useEffect, useRef, useState } from "react";
import type { Letter } from "app/interfaces/interfaces";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useOnClickOutside } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import api from "app/utils/api";
import { useNavigate } from "react-router";

const LettersBin = () => {
	const { t } = useTranslation();
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
	const [letterCount, setLetterCount] = useState(0);
	const [letters, setLetters] = useState<Letter[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [nextPage, setNextPage] = useState<string | null>(null);
	const [prevPage, setPrevPage] = useState<string | null>(null);
	const ref = useRef(null);
	useOnClickOutside<any>(ref, () => setOpenDropdownId(null));

	const [dropdownPosition, setDropdownPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);

	const toggleDropdown = (branchId: number, e?: React.MouseEvent) => {
		if (openDropdownId === branchId) {
			setOpenDropdownId(null);
			return;
		}

		const rect = (e?.currentTarget as HTMLElement)?.getBoundingClientRect();
		setDropdownPosition({
			top: rect.bottom + window.scrollY + 5,
			left: rect.right - 180,
		});
		setOpenDropdownId(branchId);
	};

	const fetchletters = async (pageUrl?: string, pageNum?: number) => {
		try {
			const apiUrl =
				pageUrl || `/api/letters/?page=${pageNum || currentPage}&status=bin`;
			const res = await api.get(apiUrl);
			setLetters(res.data.results.data);
			setLetterCount(res.data.count);
			setNextPage(res.data.next);
			setPrevPage(res.data.previous);
			if (pageNum) setCurrentPage(pageNum);
		} catch (err: any) {
			if (err.response?.status === 404 && currentPage > 1) {
				await fetchletters(undefined, currentPage - 1);
				return;
			}
			console.error("Error fetching letters:", err);
			return [];
		}
	};

	useEffect(() => {
		fetchletters();
	}, []);
	const navigate = useNavigate();

	const handleDownload = async () => {
		const res = await api.get("/api/letters/export_csv/", {
			responseType: "blob",
			params: {
				status: "bin",
			},
		});
		const blob = new Blob([res.data], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `letters_${new Date().toISOString()}.csv`);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	};

	const totalPages = Math.ceil(letterCount / 10);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">{t("lettersBinPage.title")}</h1>
				<button
					onClick={handleDownload}
					className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5"
				>
					Download
				</button>
			</div>
			<div
				className="w-full  overflow-x-auto overflow-y-visible"
				style={{ scrollbarWidth: "thin" }}
			>
				<table className="w-full text-sm text-left text-gray-400">
					<thead className="text-xs uppercase bg-gray-700 text-gray-400 border-b">
						<tr>
							<th className="px-6 py-3">
								{t("allletters.table.receiver_office_name")}
							</th>
							<th className="px-6 py-3">{t("allletters.table.voucher_no")}</th>
							<th className="px-6 py-3">{t("allletters.table.chalani_no")}</th>
							<th className="px-6 py-3">{t("allletters.table.gatepass_no")}</th>
							<th className="px-6 py-3">{t("allletters.table.subject")}</th>
							<th className="px-6 py-3">
								{t("allletters.table.request_date")}
							</th>
							<th className="px-6 py-3">
								{t("allletters.table.receiver_name")}
							</th>
							<th className="px-6 py-3">
								{t("allletters.table.receiver_id_card_number")}
							</th>
							<th className="px-6 py-3">
								{t("allletters.table.receiver_phone_number")}
							</th>
							<th className="px-6 py-3">{t("allletters.table.action")}</th>
						</tr>
					</thead>
					<tbody className="relative ">
						{letters?.length === 0 && (
							<tr className="border-b bg-gray-800 border-gray-700">
								<td
									className="px-6 py-4 font-medium text-center text-white"
									colSpan={10}
								>
									{t("allletters.noletters")}
								</td>
							</tr>
						)}
						{letters?.map((letter) => (
							<tr
								key={letter.id}
								className="border-b bg-gray-800 border-gray-700"
							>
								<td className="px-6 py-4 font-medium text-white">
									{letter.office_name}
								</td>
								<td className="px-6 py-4">{letter.voucher_no}</td>
								<td className="px-6 py-4">{letter.chalani_no}</td>
								<td className="px-6 py-4">{letter.gatepass_no}</td>
								<td className="px-6 py-4">{letter.subject}</td>
								<td className="px-6 py-4">{letter.request_date}</td>
								<td className="px-6 py-4">{letter.receiver.name}</td>
								<td className="px-6 py-4">{letter.receiver.id_card_number}</td>
								<td className="px-6 py-4">{letter.receiver.phone_number}</td>
								<td className="px-6 py-4 ">
									<button
										onClick={(e) => toggleDropdown(letter.id, e)}
										className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-3 py-1.5"
									>
										⋮
									</button>
									{openDropdownId === letter.id && (
										<div
											ref={ref}
											className="fixed z-[99999] w-44 divide-y divide-gray-100 rounded-lg shadow-lg bg-gray-700"
											style={{
												top: dropdownPosition?.top ?? 0,
												left: dropdownPosition?.left ?? 0,
											}}
										>
											<ul className="py-2 text-sm text-gray-200">
												<li>
													<button
														onClick={() =>
															navigate(`/letters/view-letter/${letter.id}`)
														}
														className="block w-full text-left px-4 py-2 hover:bg-gray-600"
													>
														{t("allletters.actions.view")}
													</button>
												</li>
												{/* <li>
                                                    <button
                                                        onClick={() => navigate(`/letters/${letter.id}/edit`)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        {t("allletters.actions.edit")}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => navigate(`/letters/${letter.organization_id}/employee/create-employee`)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        {t("allletters.actions.addEmployees")}
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => navigate(`/letters/${letter.organization_id}/employee/all-employees`)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-600"
                                                    >
                                                        {t("allletters.actions.allEmployees")}
                                                    </button>
                                                </li> */}
											</ul>
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{letterCount > 10 && (
				<ul className="flex items-center justify-center h-8 text-sm">
					<li>
						<button
							onClick={() =>
								prevPage && fetchletters(prevPage, currentPage - 1)
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
								onClick={() => fetchletters(undefined, i + 1)}
								className={`flex items-center justify-center px-3 h-8 border bg-gray-800 border-gray-700 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
							>
								{i + 1}
							</button>
						</li>
					))}

					<li>
						<button
							onClick={() =>
								nextPage && fetchletters(nextPage, currentPage + 1)
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

export default LettersBin;
