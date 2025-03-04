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

    // Company Header
    doc.addImage(COMPANY_LOGO, 'PNG', marginLeft, currentY, 40, 20);
    doc.setFontSize(12);
    doc.text('Company Name', pageWidth - 80, currentY + 5);
    doc.text('Address: 123 Business Street, City', pageWidth - 80, currentY + 12);
    doc.text('Email: info@company.com', pageWidth - 80, currentY + 19);
    doc.text('Phone: +1-234-567-890', pageWidth - 80, currentY + 26);
    doc.line(marginLeft, currentY + 35, pageWidth - marginLeft, currentY + 35);

    // Invoice Title
    currentY += 50;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, currentY, { align: 'center' });

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
    currentY += 50;
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

    finalY += 40;
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
