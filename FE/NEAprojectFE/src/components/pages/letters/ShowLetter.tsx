import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
import './ShowLetterStyle.css';
import nepal_electricity_authority_logo from 'app/assets/nepal_electricity_authority_logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { type Letter } from 'app/interfaces/interfaces';
import { useParams } from 'react-router';
import api from 'app/utils/api';
import { engToNep } from 'app/utils/englishtonepaliNumber';
import { id_types } from 'app/enum/id_types';

const ShowLetter = () => {
    const { id } = useParams();
    const [letter, setLetter] = useState<Letter>();
    const [isLoading, setIsLoading] = useState(false);
    const pageRefs = useRef<HTMLDivElement[]>([]);

    // Dynamic Pagination Refs and State
    const [paginatedItems, setPaginatedItems] = useState<Letter['items'][]>([]);
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
        return id_types.find((id_type) => id_type.value === letter?.receiver.id_card_type)?.name;
    }, [letter]);

    // Fetch Letter
    useEffect(() => {
        const fetchLetter = async () => {
            try {
                const response = await api.get<{ data: Letter }>(`/api/letters/${id}/`);
                setLetter(response.data.data);
            } catch (error) {
                console.error('Error fetching letter:', error);
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
            const subsequentPageTopHeight = subsequentPageTopRef.current?.offsetHeight || 0;
            const tableTitleHeight = tableTitleRef.current?.offsetHeight || 0;
            const tableHeaderHeight = tableHeaderRef.current?.offsetHeight || 0;
            const footerHeight = footerRef.current?.offsetHeight || 0; // Page number footer
            const lastPageExtraHeight = lastPageContentRef.current?.offsetHeight || 0; // Supplier + Signatures

            // Calculate Fixed Header Heights
            // Page 1: Full Header + Title + Table Header + Footer
            const firstPageFixedHeight = firstPageTopHeight + tableTitleHeight + tableHeaderHeight + footerHeight;

            // Page 2+: Minimal Header + Title + Table Header + Footer
            const subsequentPageFixedHeight = subsequentPageTopHeight + tableTitleHeight + tableHeaderHeight + footerHeight;

            // Measure rows
            const rowHeights = letter.items.map((_, i) => itemRefs.current[i]?.offsetHeight || 0);

            const chunks: Letter['items'][] = [];
            let currentChunk: Letter['items'] = [];

            // Start with First Page Height
            let currentHeight = firstPageFixedHeight;
            let isFirstPage = true;

            for (let i = 0; i < letter.items.length; i++) {
                const itemH = rowHeights[i];

                // Determine which fixed height to use for the NEXT page if we break here
                // If we are currently on Page 1, next page will be Page 2 (Subsequent)
                // If we are on Page 2, next page is also Page 2+ (Subsequent)
                // The currentHeight tracks the accumulated height on the CURRENT page.

                // Check overflow
                if (currentChunk.length > 0 && currentHeight + itemH > availableHeight) {
                    chunks.push(currentChunk);
                    currentChunk = [];

                    // New Page settings
                    isFirstPage = false;
                    currentHeight = subsequentPageFixedHeight;
                }

                currentChunk.push(letter.items[i]);
                currentHeight += itemH;
            }

            // Check last page extras
            // Note: currentHeight already includes fixedHeader (for current page) + sum(itemHeights)
            // We need to add lastPageExtraHeight
            if (currentHeight + lastPageExtraHeight > availableHeight) {
                // If it doesn't fit, we need a new page for the signatures
                chunks.push(currentChunk);
                chunks.push([]); // Empty chunk to trigger a page with just signatures
            } else {
                chunks.push(currentChunk);
            }

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
            unit: "cm",
            format: "a4",
            compress: true,
        });

        for (let i = 0; i < pageRefs.current.length; i++) {
            const element = pageRefs.current[i];
            if (!element) continue;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                removeContainer: true
            });
            const image = canvas.toDataURL("image/png");

            const imgProps = pdf.getImageProperties(image);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (i !== 0) pdf.addPage();
            pdf.addImage(image, "PNG", 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(`letter-${id}-${Date.now()}.pdf`);
        setIsLoading(false);
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
                फोन नं. +977 57-520007<br />
                इमेल: centralstore@nea.org.np<br />
                nea.centralstore@gmail.com<br />
                हेटौँडा उपमहानगरपालिका<br />
                वडा नं. ५, मकवानपुर
            </div>
        </header>
    );

    const RefSection = () => (
        <section className="ref-section">
            <div className="ref-left">
                <div>
                    प.सं.: <span className="dynamic">{letter?.letter_count} च.नं.: {letter?.chalani_no}</span>
                </div>
                <div>
                    श्री {letter?.office_name},<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{letter?.receiver_address}
                </div>
            </div>
            <div className="ref-right">
                मिति: <span className="dynamic">{letter?.date}</span><br />
                मे. मौ. नं.: {letter?.voucher_no}<br />
                गेटपास नं: {letter?.gatepass_no}
            </div>
        </section>
    );

    const SubjectSection = () => (
        <div className="subject">विषय: {letter?.subject}</div>
    );

    const ContentSection = () => (
        <div className="content">
            उपरोक्त सम्बन्धमा तहाँको प.सं. {letter?.letter_count} च.नं. {letter?.chalani_no} मिति {letter?.request_date} को माग पत्रानुसार तपसिलमा उल्लेखित
            विद्युतीय जिन्सी सामानहरु निम्न उल्लेखित कर्मचारी/व्यक्ति हस्ते पठाइएको छ। उक्त सामानहरुको ट्रान्सफर नोट खर्चपुर्जा र मुल्य पछि पठाइने व्यहोरा समेत अनुरोध छ ।
        </div>
    );

    const TableHeader = () => (
        <thead>
            <tr>
                <th>सि.नं.</th>
                <th>सामानको नाम</th>
                <th>कम्पनी</th>
                <th>सिरियल नं.</th>
                <th>इकाई</th>
                <th>इकाईको परिमाण</th>
                <th>कैफियत</th>
            </tr>
        </thead>
    );

    const SupplierInfo = () => (
        <section className="supplier-info" style={{ marginTop: '20px' }}>
            <strong>सामान बुझ्नेको</strong>
            <table>
                <tbody>
                    <tr>
                        <td>पुरा नाम, थर: {letter?.receiver.name}</td>
                        <td>पद: {letter?.receiver.post}</td>
                    </tr>
                    <tr>
                        <td>संकेत नं./परिचय पत्र नं.: {engToNep(`${letter?.receiver.id_card_number}`)}</td>
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
        <footer className="signature-section" style={{ marginTop: '70px' }}>
            <div className="signature-box">
                <div className='signature-line'></div>
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
                {/* Download Button */}
                <div className="absolute flex items-center justify-between">
                    <button
                        type='button'
                        onClick={handleDownload}
                        className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5"
                    >
                        Download
                    </button>
                </div>

                {/* HIDDEN MEASUREMENT CONTAINER */}
                {letter && (
                    <div
                        className="page"
                        ref={hiddenContainerRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: -1000,
                            visibility: 'hidden',
                            height: '297mm', // Enforce A4 height for measurement
                            overflow: 'hidden'
                        }}
                    >
                        {/* Page 1 Header Content */}
                        <div ref={firstPageTopRef} style={{ display: 'flow-root' }}>
                            <HeaderSection />
                            <RefSection />
                            <SubjectSection />
                            <ContentSection />
                        </div>

                        {/* Subsequent Page Header Content (Minimal) */}
                        <div ref={subsequentPageTopRef} style={{ display: 'flow-root' }}>
                            <HeaderSection />
                        </div>

                        {/* Table Title (Measured Separately) */}
                        <div ref={tableTitleRef} className="table-title">तपसिल:</div>

                        {/* Full Table Structure for Row Measurement */}
                        {letter.items.length > 0 && (
                            <table className="table">
                                <thead ref={tableHeaderRef}>
                                    <tr>
                                        <th>सि.नं.</th>
                                        <th>सामानको नाम</th>
                                        <th>कम्पनी</th>
                                        <th>सिरियल नं.</th>
                                        <th>इकाई</th>
                                        <th>इकाईको परिमाण</th>
                                        <th>कैफियत</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {letter.items.map((item, index) => (
                                        <tr key={item.id} ref={(el) => { itemRefs.current[index] = el }}>
                                            <td>{engToNep(`${index + 1}`)}</td>
                                            <td>{item.name}</td>
                                            <td>{item.company}</td>
                                            <td style={{
                                                wordWrap: "break-word",
                                                whiteSpace: "normal",
                                                maxWidth: "120px",
                                                wordBreak: "break-word"
                                            }}>
                                                {item.serial_number}
                                            </td>
                                            <td>{item.unit_of_measurement}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.remarks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div ref={lastPageContentRef} style={{ display: 'flow-root' }}>
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

                        {/* Render Ref/Subject/Content ONLY on first page. Note: These must remain visible even if the table is empty. */}
                        {pageIndex === 0 && (
                            <>
                                <RefSection />
                                <SubjectSection />
                                <ContentSection />
                            </>
                        )}

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
                                                    <td>{engToNep(`${globalIndex + 1}`)}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.company}</td>
                                                    <td style={{
                                                        wordWrap: "break-word",
                                                        whiteSpace: "normal",
                                                        maxWidth: "120px",
                                                        wordBreak: "break-word"
                                                    }}>
                                                        {item.serial_number}
                                                    </td>
                                                    <td>{item.unit_of_measurement}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.remarks}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* SHOW ONLY ON LAST PAGE */}
                        {pageIndex === paginatedItems.length - 1 && (
                            <>
                                <SupplierInfo />
                                <SignatureSection />
                            </>
                        )}
                        <footer className="page-number">
                            पाना {engToNep(`${paginatedItems.length}`)} मध्ये {engToNep(`${pageIndex + 1}`)}
                        </footer>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ShowLetter;