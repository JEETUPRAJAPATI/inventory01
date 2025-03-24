import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import COMPANY_LOGO from '../assets/logo.jpg';

export const generateInvoicePDF = (invoiceData) => {
  try {


    // console.log('invoice data is', invoiceData);
    // return false;
    const doc = new jsPDF();
    const marginLeft = 20;
    let currentY = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Define a consistent X position for right-aligned text
    const textX = pageWidth - 140; // Shifted left for better alignment

    // **Company Header**
    const logoSize = 30; // Set smaller size
    const marginTop = 15;
    currentY = marginTop;
    doc.addImage(COMPANY_LOGO, "PNG", marginLeft, currentY, logoSize, logoSize);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Thailiwale", textX, currentY + 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Properly spaced address & contact details
    doc.text("Address: A201/1/4, SR Compound, Dewas Naka,", textX, currentY + 12);
    doc.text("Lasudia Mori, Indore, Madhya Pradesh 452016", textX, currentY + 19);
    doc.text("Email: info@thailiwale.com", textX, currentY + 26);
    doc.text("Phone: +91 7999857050", textX, currentY + 33);

    // Line Separator
    currentY += 40;
    doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
    currentY += 10; // Move down slightly

    // **Invoice Title**
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth / 2, currentY, { align: "center" });


    // Invoice Details (Dynamic)
    currentY += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Left side - Bill To
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Customer Name: ${invoiceData?.orderDetails?.customerName || 'N/A'}`,
      `Address: ${invoiceData?.orderDetails?.address || 'N/A'}`,
      `Phone: ${invoiceData?.orderDetails?.mobileNumber || 'N/A'}`,
      `Email: ${invoiceData?.orderDetails?.email || 'N/A'}`
    ], marginLeft, currentY + 10);

    // Right side - Invoice Info
    doc.text([
      `Invoice No: ${invoiceData?.invoice_id || 'N/A'}`,
      `Order No: ${invoiceData?.order_id || 'N/A'}`,
      `Date: ${new Date(invoiceData?.createdAt).toLocaleDateString()}`,
      `Status: ${invoiceData?.status || 'N/A'}`
    ], pageWidth - 80, currentY + 10);

    // Order Details Table
    currentY += 30;
    const tableColumns = ['Job Name', 'Quantity', 'Order Price'];
    const tableData = [
      [
        invoiceData?.orderDetails?.jobName || 'N/A',
        invoiceData?.orderDetails?.quantity || 'N/A',
        `${invoiceData?.orderDetails?.orderPrice || 'N/A'}`,
      ]
    ];

    doc.autoTable({
      startY: currentY,
      head: [tableColumns],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 9, halign: 'center' }
    });

    // Production Details
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Production Details:', marginLeft, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text([
      `Roll Size: ${invoiceData?.productionManagerDetails?.production_details?.roll_size || 'N/A'}`,
      `Cylinder Size: ${invoiceData?.productionManagerDetails?.production_details?.cylinder_size || 'N/A'}`,
      `Quantity (Kgs): ${invoiceData?.productionManagerDetails?.production_details?.quantity_kgs || 'N/A'}`
    ], marginLeft, finalY + 10);

    // Add Totals
    const subtotal = Number(invoiceData?.orderDetails?.orderPrice) || 0;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    finalY += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', pageWidth - 80, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${subtotal.toFixed(2)}`, pageWidth - 40, finalY);

    doc.setFont('helvetica', 'bold');
    doc.text('GST (18%):', pageWidth - 80, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${gst.toFixed(2)}`, pageWidth - 40, finalY + 10);

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', pageWidth - 80, finalY + 20);
    doc.text(`${total.toFixed(2)}`, pageWidth - 40, finalY + 20);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for your business!', pageWidth / 2, 260, { align: 'center' });
    doc.text('Terms & Conditions Apply', pageWidth / 2, 265, { align: 'center' });

    // Save the PDF
    doc.save(`Invoice_${invoiceData?.invoice_id || 'N/A'}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
