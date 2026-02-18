import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf'; 

export const downloadInvoicePDF = async (elementId: string, orderNumber: string) => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`CRITICAL: Element with id '${elementId}' not found on the page!`);
    alert("Could not find the invoice on the screen.");
    return;
  }

  try {
    console.log("Starting PDF generation with native browser rendering...");

    // 1. Convert HTML to PNG using the browser's native engine (No CSS parsing crashes!)
    const imgData = await toPng(element, { 
      quality: 1.0,
      backgroundColor: '#ffffff',
      pixelRatio: 2 // High DPI for crisp text
    });

    console.log("Image generated successfully. Creating PDF...");

    // 2. Create an A4 size PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // 3. Calculate exact dimensions to fit the A4 page without stretching
    const pdfWidth = pdf.internal.pageSize.getWidth();
    
    // Get the image properties to calculate the correct height ratio
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    console.log(`Adding image to PDF. Dimensions: ${pdfWidth}x${pdfHeight}`);

    // 4. Add the image to the PDF and trigger download
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Gulab_Mehndi_Invoice_${orderNumber}.pdf`);
    
    console.log("PDF downloaded successfully!");

  } catch (error) {
    console.error("PDF Generation FAILED. Detailed Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    alert(`Could not generate PDF: ${errorMessage}\n\nCheck browser console (F12) for details.`);
  }
};