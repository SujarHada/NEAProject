import html2pdf from "html2pdf.js";

export interface LetterData {
  refNo: string;
  date: string;
  toAddress: string;
  subject: string;
  bodyText: string;
  senderName: string;
  senderDesignation: string;
}
  interface Html2PdfOptions {
    margin?: number | [number, number] | [number, number, number, number];
    filename?: string;
    image?: {
      type?: "jpeg" | "png" | "webp";
      quality?: number;
    };
    enableLinks?: boolean;
    html2canvas?: object;
    jsPDF?: {
      unit?: string;
      format?: string | [number, number];
      orientation?: "portrait" | "landscape";
    };
  }

export const generateLetterPDF = (data: LetterData) => {
  const defaultTemplate = `
  <html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 15mm;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .page {
        margin: 0;
        box-shadow: none;
        border: none;
      }
    }

    html {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Noto Sans Devanagari', Arial, sans-serif;
      background: #e0e0e0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 10mm 15mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border: 1px solid black;
      font-size: 11pt;
      line-height: 1.5;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .logo-section {
      flex: 0 0 85px;
    }

    .logo-section img {
      width: 100%;
      height: auto;
      border-radius: 50%;
      border: 2px solid #333;
    }

    .title-section {
      flex: 1;
      text-align: center;
      padding: 0 15px;
    }

    .title-section h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 4px;
      line-height: 1.2;
    }

    .title-section h2 {
      font-size: 10pt;
      margin-bottom: 4px;
      font-weight: normal;
    }

    .title-section h3 {
      font-size: 13pt;
      font-weight: bold;
      margin: 3px 0;
      line-height: 1.3;
    }

    .contact-section {
      font-size: 10pt;
      line-height: 1.4;
      text-align: left;
    }

    .ref-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 12pt;
    }

    .ref-left {
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ref-right {
      text-align: left;
      line-height: 1.5;
    }

    .subject {
      text-align: center;
      font-weight: bold;
      margin: 5px 0;
      text-decoration: underline;
      font-size: 12pt;
    }

    .content {
      text-align: justify;
      margin-bottom: 15px;
      font-size: 12pt;
      line-height: 1.6;
    }

    /* ===== Table Section ===== */
    .table-title {
      font-weight: bold;
      text-align: center;
      margin: 12px 0 8px 0;
      text-decoration: underline;
      font-size: 12pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    th,
    td {
      border: 1px solid #000;
      padding: 6px 4px;
      text-align: center;
      vertical-align: top;
      font-size: 10pt;
      line-height: 1.3;
    }

    td:nth-child(2) {
      text-align: left;
    }

    th {
      font-weight: bold;
      background-color: #f5f5f5;
    }

    .serial {
      width: 35px;
    }

    .item-name {
      width: 180px;
    }

    .company {
      width: 85px;
    }

    .serial-no {
      width: 100px;
    }

    .quantity {
      width: 50px;
    }

    .unit {
      width: 50px;
    }

    .remarks {
      width: 85px;
    }

    /* ===== Supplier Info ===== */
    .supplier-info {
      margin-top: 15px;
      font-size: 12pt;
    }
    .supplier-info table {
        border-collapse: separate;
    }

    .supplier-info td {
      border: none;
      text-align: left;
      padding: 4px 8px;
      border-bottom: 1px solid #000;
      font-size: 12pt;
    }

    .supplier-info td:first-child {
      width: 50%;
    }

    /* ===== Signature Section ===== */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      font-size: 11pt;
    }

    .signature-box {
      text-align: center;
      width: 23%;
    }

    .signature-line {
      border-top: 1px solid #000;
      margin-bottom: 5px;
      width: 100%;
    }
  </style>
</head>

<body>
  <div class="page">
    <header>
      <div class="logo-section">
        <img src="nepal_electricity_authority_logo.jpeg" alt="NEA logo" />
      </div>

      <div class="title-section">
        <h1>नेपाल विद्युत् प्राधिकरण</h1>
        <h2>(नेपाल सरकारको स्वामित्व)</h2>
        <h3>वितरण तथा ग्राहक सेवा निर्देशनालय</h3>
        <h3>केन्द्रीय भण्डार, हेटौँडा</h3>
      </div>

      <div class="contact-section">
        फोन नं. ०५७ ५२००००<br />
        इमेल: centralstore@nea.org.np<br />
        nea.centralstore@gmail.com<br />
        हेटौँडा उपमहानगरपालिका<br />
        वडा नं. ५, मकवानपुर, मकवानपुर
      </div>
    </header>

    <section class="ref-section">
      <div class="ref-left">
        <div>पत्र सं.: <span class="dynamic">२०८०/८१ च.नं.: ३</span></div>
        <div>
          श्री बागमती प्रादेशिक कार्यालय,<br />
          &nbsp;&nbsp;&nbsp;&nbsp;काठमाण्डौं
        </div>
      </div>
      <div class="ref-right">
        मिति: <span class="dynamic">२०८१/२/१०</span><br />
        मे. मौ. नं.: १९३६<br />
        गेटपास नं:
      </div>
    </section>

    <div class="subject">विषय: जिन्सी सामानहरु पठाइएको बारे</div>

    <div class="content">
      उपरोक्त सम्बन्धमा तहाँको पत्र सं. २०८०/८१ च.नं. २२ मिति २०८१/२/२ को माग पत्रानुसार
      तपसिलमा उल्लेखित विद्युतिय जिन्सी सामानहरु निम्न उल्लेखित कम्पनारी / व्यक्तिहरुबाट पठाइएको छ ।
      उक्त सामानहरुको ट्रान्सपोर्ट नोट संयुर्जी र मूल्य पछि पठाइने व्यहोरा समेत अनुरोध छ ।
    </div>

    <div class="table-title">तपसिलः</div>

    <table>
      <thead>
        <tr>
          <th class="serial">सि.<br>नं.</th>
          <th class="item-name">सामानको नाम</th>
          <th class="company">कम्पनी</th>
          <th class="serial-no">सिरियल नं.</th>
          <th class="quantity">इकाई</th>
          <th class="unit">इकाईको<br>परिमाण</th>
          <th class="remarks">कैफियत</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>१</td>
          <td>11/0.4 100kVA Transformer</td>
          <td>NEEK</td>
          <td>१२१२१२,<br>१२१२१२,<br>१२१२१२</td>
          <td></td>
          <td>५</td>
          <td></td>
        </tr>
        <tr>
          <td>२</td>
          <td>11/0.4 100kVA Transformer</td>
          <td>NEEK</td>
          <td>१२१२१२,<br>१२१२१२,<br>१२१२१२,<br>१२१२१२,<br>१२१२१२,<br>१२१२१२</td>
          <td>roll</td>
          <td>१०</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <section class="supplier-info">
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

    <footer class="signature-section">
      <div class="signature-box">
        सही: .....................
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        तयार गर्ने
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        चेक गर्ने
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        स्वर्य स्वीकृत गर्ने
      </div>
    </footer>
  </div>
</body>

</html>

  `;

  const html = (defaultTemplate)
    .replace("{{refNo}}", data.refNo)
    .replace("{{date}}", data.date)
    .replace("{{toAddress}}", data.toAddress.replace(/\n/g, "<br>"))
    .replace("{{subject}}", data.subject)
    .replace("{{bodyText}}", data.bodyText.replace(/\n/g, "<br>"))
    .replace("{{senderName}}", data.senderName)
    .replace("{{senderDesignation}}", data.senderDesignation);

  const options:Html2PdfOptions = {
    margin: 0,
    filename: `${data.refNo || "letter"}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(options).from(html).toPdf().save();
};
