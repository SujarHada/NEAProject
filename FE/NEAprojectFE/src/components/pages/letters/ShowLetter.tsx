import { useRef } from 'react';
import './ShowLetterStyle.css'
import nepal_electricity_authority_logo from '../../../assets/nepal_electricity_authority_logo.png'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas';
import { type Letter } from '../../../interfaces/interfaces';
const data: Letter = {
    id: 16,
    letter_count: "१०",
    chalani_no: "९८७०२६२७",
    voucher_no: "६३०५४",
    date: "२०८२-०७-१५",
    receiver_office_name: "Deleon-Brewer",
    receiver_address: "0020 Manuel Harbor\nAshleybury, RI 96460",
    subject: "Term exactly political yeah.",
    request_chalani_number: "१२७६३१४०",
    request_letter_count: "९",
    request_date: "२०८२-०६-३०",
    items: [
        {
            id: 37,
            name: "Mention Election",
            company: "Torres-Murphy",
            serial_number: "१३४५५१४७६",
            unit_of_measurement: "प्याक",
            quantity: "५८",
            remarks: "Walk blue red add herself."
        },
        {
            id: 35,
            name: "Before Beat",
            company: "Walker LLC",
            serial_number: "४८३६२७७१",
            unit_of_measurement: "किलो",
            quantity: "३७",
            remarks: ""
        },
        {
            id: 38,
            name: "Hair Fall",
            company: "Edwards Ltd",
            serial_number: "६७६८६२१६१",
            unit_of_measurement: "मिटर",
            quantity: "१८",
            remarks: "Whether seem but image year."
        },
        {
            id: 36,
            name: "Society Person",
            company: "Ryan Inc",
            serial_number: "९२१६२५०८४",
            unit_of_measurement: "प्याक",
            quantity: "४८",
            remarks: "Show house travel describe."
        }
    ],
    gatepass_no: "४४३२५५",
    receiver: {
        name: "Lauren Sanchez",
        post: "Lawyer",
        id_card_number: "8b3167b5-981c-4",
        id_card_type: "passport",
        office_name: "Deleon-Brewer",
        office_address: "PSC 8477, Box 9983\nAPO AE 28467",
        phone_number: "५०२४९५०३२६",
        vehicle_number: "बा 1 पा 5001"
    }

}
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
                        <div>पत्र सं.: <span className="dynamic">{data.letter_count} च.नं.: {data.chalani_no}</span></div>
                        <div>
                            श्री {data.receiver_office_name},<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;{data.receiver_address}
                        </div>
                    </div>
                    <div className="ref-right">
                        मिति: <span className="dynamic">{data.date}</span><br />
                        मे. मौ. नं.: {data.voucher_no}<br />
                        गेटपास नं: {data.gatepass_no}
                    </div>
                </section>

                <div className="subject">विषय: {data.subject}</div>

                <div className="content">
                    उपरोक्त सम्बन्धमा तहाँको प.सं. {data.letter_count} च.नं. {data.chalani_no} मिति {data.request_date} को माग पत्रानुसार तपसिलमा उल्लेखित
                    विद्युतीय जिन्सी सामानहरु निम्न उल्लेखित कर्मचारी / व्यक्तिहरुद्वारा पठाइएको छ । उक्त सामानहरुको ट्रान्सफर नोट
                    खर्चपुर्जा र मुल्य पछि पठाइने व्यहोरा समेत अनुरोध छ ।
                </div>

                <div className="table-title">तपसिल:</div>

                <table className='table'>
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
                        {
                            data.items.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.company}</td>
                                    <td>{item.serial_number}</td>
                                    <td>{item.unit_of_measurement}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.remarks}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>

                <section className="supplier-info">
                    <strong>सामान बुझ्नेको</strong>
                    <table>
                        <tr>
                            <td>पुरा नाम, थर: {data.receiver.name}</td>
                            <td>पद: {data.receiver.post}</td>
                        </tr>
                        <tr>
                            <td>संकेत नं./परिचय पत्र नं.: {data.receiver.id_card_number} </td>
                            <td>परिचयपत्रको किसिम: {data.receiver.id_card_type}</td>
                        </tr>
                        <tr>
                            <td>कार्यालयको नाम: {data.receiver.office_name} </td>
                            <td>कार्यालयको ठेगाना: {data.receiver.office_address}</td>
                        </tr>
                        <tr>
                            <td>गाडी नं.: {data.receiver.vehicle_number} </td>
                            <td>मोबाईल नं: {data.receiver.phone_number} </td>
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