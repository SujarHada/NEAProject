import { useEffect, useRef, useState } from 'react';
import './ShowLetterStyle.css';
import nepal_electricity_authority_logo from 'app/assets/nepal_electricity_authority_logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { type Letter } from 'app/interfaces/interfaces';
import { useParams } from 'react-router';
import api from 'app/utils/api';
import { engToNep } from 'app/utils/englishtonepaliNumber';

const ShowLetter = () => {
    const { id } = useParams();
    const [letter, setLetter] = useState<Letter>();
    const [isLoading, setIsLoading] = useState(false);
    const pageRefs = useRef<HTMLDivElement[]>([]);

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

    // Splits items into chunks of 12 per page for safer pagination
    const chunkItems = (items: Letter['items'], size: number) => {
        const chunks = [];
        for (let i = 0; i < items.length; i += size) {
            chunks.push(items.slice(i, i + size));
        }
        return chunks;
    };

    const pages = letter ? chunkItems(letter.items, 15) : [];

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
            const canvas = await html2canvas(element, { scale: 2 });
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
                        onClick={handleDownload}
                        className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5"
                    >
                        Download
                    </button>
                </div>

                {/* Multi Pages */}
                {pages.map((chunk, pageIndex) => (
                    <div
                        key={pageIndex}
                        className="page"
                        ref={(el) => {
                            if (el) pageRefs.current[pageIndex] = el;
                        }}
                    >
                        {/* HEADER */}
                        <header>
                            <div className="logo-section">
                                <img src={nepal_electricity_authority_logo} alt="" />
                            </div>

                            <div className="title-section">
                                <h1>नेपाल विद्युत् प्राधिकरण</h1>
                                <h2>(नेपाल सरकारको स्वामित्व)</h2>
                                <h3>वितरण तथा ग्राहक सेवा निर्देशनालय</h3>
                                <h3>केन्द्रीय भण्डार, हेटौँडा</h3>
                            </div>

                            <div className="contact-section">
                                फोन नं. ०५७ ५२००००<br />
                                इमेल: centralstore@nea.org.np<br />
                                nea.centralstore@gmail.com<br />
                                हेटौँडा उपमहानगरपालिका<br />
                                वडा नं. ५, मकवानपुर, मकवानपुर
                            </div>
                        </header>

                        {/* REF Section */}
                        <section className="ref-section">
                            <div className="ref-left">
                                <div>
                                    पत्र सं.: <span className="dynamic">{letter?.letter_count} च.नं.: {letter?.chalani_no}</span>
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

                        <div className="subject">विषय: {letter?.subject}</div>

                        <div className="content">
                            उपरोक्त सम्बन्धमा तहाँको प.सं. {letter?.letter_count} च.नं. {letter?.chalani_no} मिति {letter?.request_date} को माग पत्रानुसार तपसिलमा उल्लेखित
                            विद्युतीय जिन्सी सामानहरु निम्न उल्लेखित कर्मचारी / व्यक्तिहरुद्वारा पठाइएको छ । उक्त सामानहरुको ट्रान्सफर नोट खर्चपुर्जा र मुल्य पछि पठाइने व्यहोरा समेत अनुरोध छ ।
                        </div>

                        <div className="table-title">तपसिल:</div>

                        {/* ITEMS TABLE */}
                        <table className="table">
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
                            <tbody>
                                {chunk.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{engToNep(`${index + 1 + pageIndex * 15}`)}</td>
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

                        {/* SHOW ONLY ON LAST PAGE */}
                        {pageIndex === pages.length - 1 && (
                            <>
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
                                                <td>परिचयपत्रको किसिम: {letter?.receiver.id_card_type}</td>
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

                                <footer className="signature-section" style={{ marginTop: '30px' }}>
                                    <div className="signature-box">
                                        <div className='signature-line'></div>
                                        सही
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
                                        स्वर्य स्वीकृत गर्ने
                                    </div>
                                </footer>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default ShowLetter;