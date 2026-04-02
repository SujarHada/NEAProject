import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./ShowLetterStyle.css";
import nepal_electricity_authority_logo from "app/assets/nepal_electricity_authority_logo.png";
import { id_types } from "app/enum/id_types";
import type { Letter } from "app/interfaces/interfaces";
import api from "app/utils/api";
import { engToNep, nepToEng } from "app/utils/englishtonepaliNumber";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams } from "react-router";

const ShowLetter = () => {
	const { id } = useParams();
	const [letter, setLetter] = useState<Letter>();
	const [isLoading, setIsLoading] = useState(false);
	const pageRefs = useRef<HTMLDivElement[]>([]);

	// Dynamic Pagination Refs and State
	const [paginatedItems, setPaginatedItems] = useState<Letter["items"][]>([]);
	const hiddenContainerRef = useRef<HTMLDivElement>(null);

	// Refs for height measurement
	const firstPageTopRef = useRef<HTMLDivElement>(null);
	const subsequentPageTopRef = useRef<HTMLDivElement>(null);
	const tableTitleRef = useRef<HTMLDivElement>(null);
	const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
	const footerRef = useRef<HTMLElement>(null);
	const lastPageContentRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLTableRowElement | null)[]>([]);

	const idType = useMemo(() => {
		return id_types.find(
			(id_type) => id_type.value === letter?.receiver.id_card_type,
		)?.name;
	}, [letter]);

	// Fetch Letter
	useEffect(() => {
		const fetchLetter = async () => {
			try {
				const response = await api.get<{ data: Letter }>(`/api/letters/${id}/`);
				setLetter(response.data.data);
			} catch (error) {
				console.error("Error fetching letter:", error);
			}
		};

		fetchLetter();
	}, [id]);

	// Dynamic Pagination Logic
	useLayoutEffect(() => {
		if (!letter || !hiddenContainerRef.current) return;

		const measurePagination = () => {
			const container = hiddenContainerRef.current;
			if (!container) return;

			// Get available height
			const computedStyle = window.getComputedStyle(container);
			const paddingTop = parseFloat(computedStyle.paddingTop);
			const paddingBottom = parseFloat(computedStyle.paddingBottom);
			// Height of A4 (297mm) in pixels usually around 1122px, but we rely on the rendered height
			const totalPageHeight = container.clientHeight;
			const availableHeight = totalPageHeight - paddingTop - paddingBottom;

			// Measure static sections
			const firstPageTopHeight = firstPageTopRef.current?.offsetHeight || 0;
			const subsequentPageTopHeight =
				subsequentPageTopRef.current?.offsetHeight || 0;
			const tableTitleHeight = tableTitleRef.current?.offsetHeight || 0;
			const tableHeaderHeight = tableHeaderRef.current?.offsetHeight || 0;
			const footerHeight = (footerRef.current?.offsetHeight || 0) + 15; // Page number footer + buffer
			const lastPageExtraHeight = lastPageContentRef.current?.offsetHeight || 0; // Supplier + Signatures

			// Calculate Fixed Header Heights - NOW INCLUDES Supplier + Signatures on ALL pages
			// Page 1: Full Header + Title + Table Header + Supplier Info + Signatures + Footer
			const firstPageFixedHeight =
				firstPageTopHeight +
				tableTitleHeight +
				tableHeaderHeight +
				lastPageExtraHeight +
				footerHeight;

			// Page 2+: Minimal Header + Title + Table Header + Supplier Info + Signatures + Footer
			const subsequentPageFixedHeight =
				subsequentPageTopHeight +
				tableTitleHeight +
				tableHeaderHeight +
				lastPageExtraHeight +
				footerHeight;

			// Measure rows
			const rowHeights = letter.items.map(
				(_, i) => itemRefs.current[i]?.offsetHeight || 0,
			);

			const chunks: Letter["items"][] = [];
			let currentChunk: Letter["items"] = [];

			// Start with First Page Height
			let currentHeight = firstPageFixedHeight;

			for (let i = 0; i < letter.items.length; i++) {
				const itemH = rowHeights[i];

				// Check overflow - need to ensure room for header + at least one item + supplier + footer
				if (
					currentChunk.length > 0 &&
					currentHeight + itemH > availableHeight
				) {
					chunks.push(currentChunk);
					currentChunk = [];

					// New Page settings - use subsequent page height which includes supplier info
					currentHeight = subsequentPageFixedHeight;
				}

				currentChunk.push(letter.items[i]);
				currentHeight += itemH;
			}

			// Always add the final chunk - supplier info is already included in the height calculation
			chunks.push(currentChunk);

			setPaginatedItems(chunks);
		};

		// Run measurement
		measurePagination();
	}, [letter]);

	// PDF Download Handler
	const handleDownload = async () => {
		setIsLoading(true);

		const pdf = new jsPDF({
			orientation: "portrait",
			unit: "pt",
			format: "a4",
			compress: true,
		});
		
		for (let i = 0; i < pageRefs.current.length; i++) {
			const element = pageRefs.current[i];
			if (!element) continue;

			// Add pdf-export class to fix alignment issues
			element.classList.add("pdf-export");

			try {
				const canvas = await html2canvas(element, {
					scale: 1.5,
					useCORS: true,
					logging: false,
					backgroundColor: "#ffffff",
				});
				const imgData = canvas.toDataURL("image/jpeg", 0.75);

				const pageWidth = pdf.internal.pageSize.getWidth();
				const pageHeight = pdf.internal.pageSize.getHeight();

				if (i !== 0) pdf.addPage();
				const imgProps = (pdf as any).getImageProperties
					? (pdf as any).getImageProperties(imgData)
					: { width: canvas.width, height: canvas.height };
				const imgWidth = imgProps.width;
				const imgHeight = imgProps.height;
				const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
				const renderWidth = imgWidth * ratio;
				const renderHeight = imgHeight * ratio;
				const x = (pageWidth - renderWidth) / 2;
				const y = (pageHeight - renderHeight) / 2;
				pdf.addImage(imgData, "JPEG", x, y, renderWidth, renderHeight);
			} finally {
				// Remove the class after capturing
				element.classList.remove("pdf-export");
			}
		}

		pdf.save(`letter-${id}-${Date.now()}.pdf`);
		setIsLoading(false);
	};

	// Print Handler
	const handlePrint = async () => {
    setIsLoading(true);

    try {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
            compress: true,
        });

        for (let i = 0; i < pageRefs.current.length; i++) {
            const element = pageRefs.current[i];
            if (!element) continue;

            element.classList.add("pdf-export");
            try {
                const canvas = await html2canvas(element, {
                    scale: 1.5,              // Match download scale to avoid distortion
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    windowWidth: element.scrollWidth,   // Fix: capture at natural width
                    windowHeight: element.scrollHeight,
                });
                const imgData = canvas.toDataURL("image/jpeg", 0.92);

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                if (i !== 0) pdf.addPage();
                const imgProps = (pdf as any).getImageProperties?.(imgData) 
                    ?? { width: canvas.width, height: canvas.height };

                const ratio = Math.min(
                    pageWidth / imgProps.width, 
                    pageHeight / imgProps.height
                );
                pdf.addImage(
                    imgData, "JPEG",
                    (pageWidth - imgProps.width * ratio) / 2,
                    (pageHeight - imgProps.height * ratio) / 2,
                    imgProps.width * ratio,
                    imgProps.height * ratio
                );
            } finally {
                element.classList.remove("pdf-export");
            }
        }

        // Open PDF directly instead of embedding in iframe
        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");

        if (printWindow) {
            printWindow.addEventListener("load", () => {
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    setTimeout(() => URL.revokeObjectURL(url), 15000);
                }, 500);
            });
        } else {
            // Fallback if popup blocked
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 15000);
        }
    } finally {
        setIsLoading(false);
    }
};

	// Helper components to avoid code duplication
	const HeaderSection = () => (
		<header>
			<div className="logo-section">
				<img src={nepal_electricity_authority_logo} alt="" />
			</div>

			<div className="title-section">
				<h1>नेपाल विद्युत प्राधिकरण</h1>
				<h2>(नेपाल सरकारको स्वामित्व)</h2>
				<h3>वितरण तथा ग्राहक सेवा निर्देशनालय</h3>
				<h3>खरिद व्यवस्थापन महाशाखा</h3>

				<div className="jinsi-line">
					<span>जिन्सी व्यवस्थापन शाखा</span>
				</div>
			</div>

			<div className="contact-section">
				फोन नं. +977 57-520007
				<br />
				इमेल: centralstore@nea.org.np
				<br />
				nea.centralstore@gmail.com
				<br />
				हेटौँडा उपमहानगरपालिका
				<br />
				वडा नं. ५, मकवानपुर
			</div>
		</header>
	);

	const RefSection = () => (
		<section className="ref-section">
			<div className="ref-left">
				<div>
					प.सं.:{" "}
					<span className="dynamic">
						{letter?.letter_count} च.नं.: {letter?.chalani_no}
					</span>
				</div>
				<div>
					श्री {letter?.office_name}, {letter?.receiver_address}
				</div>
			</div>
			<div className="ref-right">
				मिति: <span className="dynamic">{letter?.date}</span>
				<br />
				मे. मौ. नं.: {letter?.voucher_no}
				<br />
				गेटपास नं: {letter?.gatepass_no}
			</div>
		</section>
	);

	const SubjectSection = () => (
		<div className="subject">विषय: {letter?.subject}</div>
	);

	const ContentSection = () => (
		<div className="content">
			उपरोक्त सम्बन्धमा तहाँको प.सं. {letter?.request_letter_count} च.नं.{" "}
			{letter?.request_chalani_number} मिति {letter?.request_date} को माग
			पत्रानुसार तपसिलमा उल्लेखित विद्युतीय जिन्सी सामानहरु निम्न उल्लेखित कर्मचारी/व्यक्ति
			हस्ते पठाइएको छ। उक्त सामानहरुको ट्रान्सफर नोट खर्चपुर्जा र मुल्य पछि पठाइने व्यहोरा
			समेत अनुरोध छ ।
		</div>
	);

	const TableHeader = () => (
		<thead>
			<tr>
				<th className="serial" style={{ textAlign: "center", verticalAlign: "middle" }}>सि.नं.</th>
				<th className="item-name" style={{ textAlign: "center", verticalAlign: "middle" }}>सामानको नाम</th>
				<th className="company" style={{ textAlign: "center", verticalAlign: "middle" }}>कम्पनी</th>
				<th className="serial-no" style={{ textAlign: "center", verticalAlign: "middle" }}>सिरियल नं.</th>
				<th className="unit" style={{ textAlign: "center", verticalAlign: "middle" }}>इकाई</th>
				<th className="quantity" style={{ textAlign: "center", verticalAlign: "middle" }}>परिमाण</th>
				<th className="remarks" style={{ textAlign: "center", verticalAlign: "middle" }}>कैफियत</th>
			</tr>
		</thead>
	);

	const SupplierInfo = () => (
		<section className="supplier-info">
			<strong>सामान बुझ्नेको</strong>
			<table>
				<tbody>
					<tr>
						<td>पुरा नाम, थर: <span style={{fontFamily:"sans-serif"}}>{letter?.receiver.name}</span></td>
						<td>पद: {letter?.receiver.post}</td>
					</tr>
					<tr>
						<td>
							संकेत नं./परिचय पत्र नं.:{" "}
							{engToNep(`${letter?.receiver.id_card_number}`)}
						</td>
						<td>परिचयपत्रको किसिम: {idType}</td>
					</tr>
					<tr>
						<td>कार्यालयको नाम: {letter?.receiver.office_name}</td>
						<td>कार्यालयको ठेगाना: {letter?.receiver.office_address}</td>
					</tr>
					<tr>
						<td>गाडी नं.: {letter?.receiver.vehicle_number}</td>
						<td>मोबाईल नं: {engToNep(`${letter?.receiver.phone_number}`)}</td>
					</tr>
				</tbody>
			</table>
		</section>
	);

	const SignatureSection = () => (
		<footer className="signature-section" style={{ marginTop: "70px" }}>
			<div className="signature-box">
				<div className="signature-line"></div>
				सामान बुझिलिनेको सही
			</div>
			<div className="signature-box">
				<div className="signature-line"></div>
				तयार गर्ने
			</div>
			<div className="signature-box">
				<div className="signature-line"></div>
				चेक गर्ने
			</div>
			<div className="signature-box">
				<div className="signature-line"></div>
				शाखा प्रमुख
			</div>
		</footer>
	);

	return (
		<>
			{isLoading && (
				<div className="loading-overlay h-screen w-full fixed top-0 left-0 flex items-center justify-center bg-black opacity-50 z-50">
					<div className="border-4 animate-spin rounded-full h-24 w-24 border-t-white"></div>
				</div>
			)}

			<div className="flex relative flex-col gap-5">
				{/* Download and Print Buttons */}
				<div className="absolute flex items-center justify-between gap-2">
					<button
						type="button"
						onClick={handleDownload}
						className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5"
					>
						Download
					</button>
					<button
						type="button"
						onClick={handlePrint}
						className="text-white outline-none bg-green-700 hover:bg-green-800 font-medium active:bg-green-900 rounded-lg text-sm px-3 py-1.5"
					>
						Print
					</button>
				</div>

				{/* HIDDEN MEASUREMENT CONTAINER */}
				{letter && (
					<div
						className="page pdf-export"
						ref={hiddenContainerRef}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							zIndex: -1000,
							visibility: "hidden",
							height: "297mm", // Enforce A4 height for measurement
							overflow: "hidden",
						}}
					>
						{/* Page 1 Header Content */}
						<div ref={firstPageTopRef} style={{ display: "flow-root" }}>
							<HeaderSection />
							<RefSection />
							<SubjectSection />
							<ContentSection />
						</div>

						{/* Subsequent Page Header Content (Identical to First Page now) */}
						<div ref={subsequentPageTopRef} style={{ display: "flow-root" }}>
							<HeaderSection />
							<RefSection />
							<SubjectSection />
							<ContentSection />
						</div>

						{/* Table Title (Measured Separately) */}
						<div ref={tableTitleRef} className="table-title">
							तपसिल:
						</div>

						{/* Full Table Structure for Row Measurement */}
						{letter.items.length > 0 && (
							<table className="table">
								<thead ref={tableHeaderRef}>
									<tr>
										<th className="serial" style={{ textAlign: "center", verticalAlign: "middle" }}>सि.नं.</th>
										<th className="item-name" style={{ textAlign: "center", verticalAlign: "middle" }}>सामानको नाम</th>
										<th className="company" style={{ textAlign: "center", verticalAlign: "middle" }}>कम्पनी</th>
										<th className="serial-no" style={{ textAlign: "center", verticalAlign: "middle" }}>सिरियल नं.</th>
										<th className="unit" style={{ textAlign: "center", verticalAlign: "middle" }}>इकाई</th>
										<th className="quantity" style={{ textAlign: "center", verticalAlign: "middle" }}>परिमाण</th>
										<th className="remarks" style={{ textAlign: "center", verticalAlign: "middle" }}>कैफियत</th>
									</tr>
								</thead>
								<tbody>
									{letter.items.map((item, index) => (
										<tr
											key={item.id}
											ref={(el) => {
												itemRefs.current[index] = el;
											}}
										>
											<td className="serial" style={{ textAlign: "center", verticalAlign: "middle" }}>{engToNep(`${index + 1}`)}</td>
											<td className="item-name" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.name}</td>
											<td className="company" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.company}</td>
											<td className="serial-no" style={{ textAlign: "center", verticalAlign: "middle" }}>
												{item.serial_number}
											</td>
											<td className="unit" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.unit_of_measurement}</td>
											<td className="quantity" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.quantity}</td>
											<td className="remarks" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.remarks}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}

						<div ref={lastPageContentRef} style={{ display: "flow-root" }}>
							<SupplierInfo />
							<SignatureSection />
						</div>

						<footer className="page-number" ref={footerRef}>
							पाना १ मध्ये १
						</footer>
					</div>
				)}

				{/* VISIBLE PAGES */}
				{paginatedItems.map((chunk, pageIndex) => (
					<div
						key={pageIndex}
						className="page"
						ref={(el) => {
							if (el) pageRefs.current[pageIndex] = el;
						}}
					>
						<HeaderSection />
						<div className="separator" />

						{/* Render Ref/Subject/Content on ALL pages */}
						<RefSection />
						<SubjectSection />
						<ContentSection />

						{/* Condition to hide table header if no items in this chunk */}
						{chunk.length > 0 && (
							<>
								<div className="table-title">तपसिल:</div>

								{/* ITEMS TABLE */}
								<table className="table">
									<TableHeader />
									<tbody>
										{chunk.map((item, chunkItemIndex) => {
											// Calculate global index
											// We need to know the count of items in previous pages
											let previousCount = 0;
											for (let i = 0; i < pageIndex; i++) {
												previousCount += paginatedItems[i].length;
											}
											const globalIndex = previousCount + chunkItemIndex;

											return (
												<tr key={item.id || chunkItemIndex}>
													<td className="serial" style={{ textAlign: "center", verticalAlign: "middle" }}>{engToNep(`${globalIndex + 1}`)}</td>
													<td className="item-name" style={{ textAlign: "left", verticalAlign: "middle", fontFamily:'sans-serif' }}>{item.name}</td>
													<td className="company" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.company}</td>
													<td
														className="serial-no"
														style={{
															fontFamily: "serif",
															textAlign: "justify",
															verticalAlign: "middle",
															textWrap: "wrap",
															lineBreak: 'anywhere',
														}}
													>
														{nepToEng(item.serial_number)}
													</td>
													<td className="unit" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.unit_of_measurement}</td>
													<td className="quantity" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.quantity}</td>
													<td className="remarks" style={{ textAlign: "center", verticalAlign: "middle" }}>{item.remarks}</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</>
						)}

						{/* SHOW ON ALL PAGES */}
						<SupplierInfo />
						<SignatureSection />

						<footer className="page-number">
							पाना {engToNep(`${pageIndex + 1}`)} मध्ये{" "}
							{engToNep(`${paginatedItems.length}`)}
						</footer>
					</div>
				))}
			</div>
		</>
	);
};

export default ShowLetter;
