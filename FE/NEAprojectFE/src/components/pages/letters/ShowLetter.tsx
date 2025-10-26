import { useRef } from 'react';
import './ShowLetterStyle.css'
import nepal_electricity_authority_logo from '../../../assets/nepal_electricity_authority_logo.png'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas';
const ShowLetter = () => {
    const htmlref = useRef(null)
    const handleDownload = async () => {
        const element = htmlref.current;
        if (!element) {
            return;
        }

        const canvas = await html2canvas(element, {
            scale: 2,
        });
        const data = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: "a4",
        });

        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();

        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("examplepdf.pdf");
    };
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between" >
                <button onClick={handleDownload} className="text-white outline-none bg-blue-700 hover:bg-blue-800 font-medium active:bg-blue-900 rounded-lg text-sm px-3 py-1.5">
                    Download
                </button>
            </div>
            <div className="page" ref={htmlref} >
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

                <section className="ref-section">
                    <div className="ref-left">
                        <div>पत्र सं.: <span className="dynamic">२०८०/८१ च.नं.: ३</span></div>
                        <div>
                            श्री बागमती प्रादेशिक कार्यालय,<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;काठमाण्डौं
                        </div>
                    </div>
                    <div className="ref-right">
                        मिति: <span className="dynamic">२०८१/२/१०</span><br />
                        मे. मौ. नं.: १९३६<br />
                        गेटपास नं:
                    </div>
                </section>

                <div className="subject">विषय: जिन्सी सामानहरु पठाइएको बारे</div>

                <div className="content">
                    उपरोक्त सम्बन्धमा तहाँको पत्र सं. २०८०/८१ च.नं. २२ मिति २०८१/२/२ को माग पत्रानुसार
                    तपसिलमा उल्लेखित विद्युतिय जिन्सी सामानहरु निम्न उल्लेखित कम्पनारी / व्यक्तिहरुबाट पठाइएको छ ।
                    उक्त सामानहरुको ट्रान्सपोर्ट नोट संयुर्जी र मूल्य पछि पठाइने व्यहोरा समेत अनुरोध छ ।
                </div>

                <div className="table-title">तपसिलः</div>

                <table>
                    <thead>
                        <tr>
                            <th className="serial">सि.नं.</th>
                            <th className="item-name">सामानको नाम</th>
                            <th className="company">कम्पनी</th>
                            <th className="serial-no">सिरियल नं.</th>
                            <th className="quantity">इकाई</th>
                            <th className="unit">इकाईको परिमाण</th>
                            <th className="remarks">कैफियत</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>१</td>
                            <td>11/0.4 100kVA Transformer</td>
                            <td>NEEK</td>
                            <td>१२१२१२,<br />१२१२१२,<br />१२१२१२</td>
                            <td></td>
                            <td>५</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>२</td>
                            <td>11/0.4 100kVA Transformer</td>
                            <td>NEEK</td>
                            <td>१२१२१२, <br /> १२१२१२, <br />१२१२१२,<br />१२१२१२,<br />१२१२१२,<br />१२१२१२</td>
                            <td>roll</td>
                            <td>१०</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

                <section className="supplier-info">
                    <strong>सामान बुझ्नेको</strong>
                    <table>
                        <tr>
                            <td>पुरा नाम, थर: सुमन गजुरेल</td>
                            <td>पद: सवारी चालक (तह-३)</td>
                        </tr>
                        <tr>
                            <td>संकेत नं./परिचय पत्र नं.: २३४२३४</td>
                            <td>परिचयपत्रको किसिम: कर्मचारी संकेत नम्बर</td>
                        </tr>
                        <tr>
                            <td>कार्यालयको नाम: बागमती प्रदेश, प्रादेशिक कार्यालय</td>
                            <td>कार्यालयको ठेगाना: काठमाण्डौं</td>
                        </tr>
                        <tr>
                            <td>गाडी नं.: बा१ख ५५१३</td>
                            <td>मोबाईल नं: बा१ख ५५१३</td>
                        </tr>
                    </table>
                </section>

                <footer className="signature-section">
                    <div className="signature-box">
                        सही: .....................
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
            </div>
        </div>

    )
}
export default ShowLetter