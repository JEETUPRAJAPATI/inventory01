import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import COMPANY_LOGO from '../assets/logo.jpg';

export const pdfFinishedProduct = (Details) => {
    console.log('Invoice Data:', Details);

    try {
        const doc = new jsPDF();
        const marginLeft = 20;
        let currentY = 20;
        const pageWidth = doc.internal.pageSize.getWidth();

        // === Header Section ===
        const logoSize = 30;
        const marginTop = 15;
        currentY = marginTop;
        doc.addImage(COMPANY_LOGO, "PNG", marginLeft, currentY, logoSize, logoSize);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Thailiwale', pageWidth - 90, currentY + 5);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('201/1/4, SR Compound, Dewas Naka,', pageWidth - 90, currentY + 15);
        doc.text('Lasudia Mori, Indore, Madhya Pradesh 452016', pageWidth - 90, currentY + 22);

        doc.text('Email: info@thailiwale.com', pageWidth - 90, currentY + 32);
        doc.text('Phone: +91 7999857050', pageWidth - 90, currentY + 40);
        doc.line(marginLeft, currentY + 45, pageWidth - marginLeft, currentY + 45); // Line Break

        // === Customer & Order Details ===
        currentY += 50;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Information', marginLeft, currentY);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        currentY += 8;
        doc.text(`Customer Name: ${Details?.orderDetails?.customerName || 'N/A'}`, marginLeft, currentY);
        doc.text(`Order Date: ${Details?.orderDetails?.createdAt
            ? new Date(Details.orderDetails.createdAt).toLocaleString("en-GB", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
            })
            : "N/A"
            }`, pageWidth - 80, currentY);

        // === Order Details Table ===
        currentY += 15;
        const quantity = Number(Details?.orderDetails?.quantity) || 0;
        const subtotal = Number(Details?.orderDetails?.orderPrice) || 0;
        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        doc.autoTable({
            startY: currentY,
            head: [['Job Name', 'Quantity', 'Order Price']],
            body: [[
                Details?.orderDetails?.jobName || 'N/A',
                quantity || 'N/A',
                `${subtotal.toFixed(2)}`
            ]],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, halign: 'left' }
        });

        let finalY = doc.lastAutoTable.finalY + 10;

        // === Bag Details Table ===
        doc.autoTable({
            startY: finalY,
            head: [['Type', 'Size', 'Color', 'Print Color', 'GSM']],
            body: [[
                Details?.orderDetails?.bagDetails?.type || 'N/A',
                Details?.orderDetails?.bagDetails?.size || 'N/A',
                Details?.orderDetails?.bagDetails?.color || 'N/A',
                Details?.orderDetails?.bagDetails?.printColor || 'N/A',
                Details?.orderDetails?.bagDetails?.gsm || 'N/A'
            ]],
            theme: 'grid'
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // === Production Details Table ===
        doc.autoTable({
            startY: finalY,
            head: [['Roll Size', 'Cylinder Size', 'Quantity (Kgs)', 'Progress']],
            body: [[
                Details?.productionManagerDetails?.production_details?.roll_size || 'N/A',
                Details?.productionManagerDetails?.production_details?.cylinder_size || 'N/A',
                Details?.productionManagerDetails?.production_details?.quantity_kgs || 'N/A',
                Details?.productionManagerDetails?.production_details?.progress || 'N/A'
            ]],
            theme: 'grid'
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // === Packaging Details Table ===
        const packageData = Details?.packageDetails?.package_details?.map(pkg => ([
            `${pkg.length}x${pkg.width}x${pkg.height} cm`,
            `${pkg.weight} kg`
        ])) || [['N/A', 'N/A']];

        doc.autoTable({
            startY: finalY,
            head: [['Package Size', 'Weight']],
            body: packageData,
            theme: 'grid'
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // === Delivery Details Table ===
        doc.autoTable({
            startY: finalY,
            head: [['Driver', 'Contact', 'Vehicle No', 'Delivery Date']],
            body: [[
                Details?.deliveryDetails?.driverName || 'N/A',
                Details?.deliveryDetails?.driverContact || 'N/A',
                Details?.deliveryDetails?.vehicleNo || 'N/A',
                Details?.deliveryDetails?.deliveryDate ? new Date(Details?.deliveryDetails?.deliveryDate).toLocaleDateString() : 'N/A'
            ]],
            theme: 'grid'
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // === Subcategory Details Table ===
        const subcategoryData = Details?.productionDetails?.subcategoryIds?.map(sub => ([
            sub.fabricColor || 'N/A',
            sub.rollSize || 'N/A',
            sub.gsm || 'N/A',
            sub.fabricQuality || 'N/A',
            sub.quantity || 'N/A'
        ])) || [['N/A', 'N/A', 'N/A', 'N/A', 'N/A']];

        doc.autoTable({
            startY: finalY,
            head: [['Fabric Color', 'Roll Size', 'GSM', 'Fabric Quality', 'Quantity']],
            body: subcategoryData,
            theme: 'grid'
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // === Unit Numbers Table ===
        doc.autoTable({
            startY: finalY,
            head: [['Flexo', 'W-Cut', 'D-Cut', 'Offset']],
            body: [[
                Details?.unitNumbers?.flexo || 'N/A',
                Details?.unitNumbers?.wcut || 'N/A',
                Details?.unitNumbers?.dcut || 'N/A',
                Details?.unitNumbers?.opsert || 'N/A'
            ]],
            theme: 'grid'
        });

        finalY = doc.lastAutoTable.finalY + 10;

        // === Invoice Total Table (with Highlighted Style) ===

        // Invoice Table
        doc.autoTable({
            startY: finalY,
            head: [['Subtotal', 'GST (18%)', 'Total (R)']],
            body: [[
                `${subtotal.toFixed(2)}`,
                `${gst.toFixed(2)}`,
                `${total.toFixed(2)}`
            ]],
            theme: 'grid',
            headStyles: { fillColor: [255, 87, 51], textColor: 255, fontSize: 10, fontStyle: 'bold' }
        });


        // === Footer Section ===
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('For inquiries, contact: support@company.com', pageWidth / 2, 285, { align: 'center' });

        // Save PDF
        doc.save(`Invoice_${Details?.order_id || 'N/A'}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};