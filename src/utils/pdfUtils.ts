import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DocumentData {
  title: string;
  content: string;
  type: string;
  completedDate: string;
  orderedBy: string;
  fileType: string;
  fileUrl?: string;
  patientName?: string;
}

// Convert image to PDF with minimal formatting - preserving original design
export const convertImageToPDF = async (imageUrl: string, documentData: DocumentData): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Determine orientation and size based on image dimensions
        const isLandscape = img.width > img.height;
        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate image dimensions to fit the entire page with minimal margins
        const margin = 10; // Small margin
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        const imgAspectRatio = img.width / img.height;
        let imgWidth = maxWidth;
        let imgHeight = maxWidth / imgAspectRatio;
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = maxHeight * imgAspectRatio;
        }
        
        // Center the image on the page
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        // Add image to PDF with maximum size
        pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
        
        // Only add minimal metadata if there's space
        if (y > 15) {
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100); // Light gray
          pdf.text(documentData.title, 10, 8);
          pdf.text(documentData.completedDate, pageWidth - 40, 8);
        }
        
        // Convert to data URL
        const pdfDataUrl = pdf.output('datauristring');
        resolve(pdfDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

// Create medical report PDF with original design preserved
export const createMedicalReportPDF = (documentData: DocumentData): string => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Minimal header - preserving original document style
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(documentData.title, pageWidth / 2, 20, { align: 'center' });
  
  // Simple document info line
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  const infoLine = `${documentData.patientName || 'Patient'} | ${documentData.completedDate} | ${documentData.orderedBy}`;
  pdf.text(infoLine, pageWidth / 2, 30, { align: 'center' });
  
  let yPosition = 45;
  
  // Report content based on type - preserve original format
  if (documentData.type === 'lab') {
    // Lab Report - simple format preserving original data
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Laboratory Results', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Simple content display
    const contentLines = documentData.content.split('\n');
    contentLines.forEach(line => {
      if (line.trim()) {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      }
    });
    
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Results generated: ${documentData.completedDate}`, 20, yPosition);
    
  } else if (documentData.type === 'imaging') {
    // Imaging Report - preserve original content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Medical Imaging', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Display original content
    const contentLines = documentData.content.split('\n');
    contentLines.forEach(line => {
      if (line.trim()) {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      }
    });
    
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Imaging date: ${documentData.completedDate}`, 20, yPosition);
    
  } else if (documentData.type === 'document') {
    // Other documents - preserve original content
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Document', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Display original content
    const contentLines = documentData.content.split('\n');
    contentLines.forEach(line => {
      if (line.trim()) {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      }
    });
    
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Document date: ${documentData.completedDate}`, 20, yPosition);
  } else {
    // Any other type - just display the content as-is
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const contentLines = documentData.content.split('\n');
    contentLines.forEach(line => {
      if (line.trim()) {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      }
    });
  }
  
  // Minimal footer - just generation time
  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 50, pageHeight - 10, { align: 'right' });
  
  return pdf.output('datauristring');
};

// Download PDF
export const downloadPDF = (pdfDataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = pdfDataUrl;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Convert uploaded file to PDF preserving original format
export const convertUploadedFileToPDF = async (file: File, documentData: DocumentData): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      // Handle uploaded images
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageDataUrl = e.target?.result as string;
          const pdfUrl = await convertImageToPDF(imageDataUrl, documentData);
          resolve(pdfUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDF files, convert to data URL for reliable viewing
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result); // Return data URL directly
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsDataURL(file);
    } else {
      // For other file types, create a simple PDF with file info
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(documentData.title, pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(`File: ${file.name}`, 20, 40);
      pdf.text(`Type: ${file.type || 'Unknown'}`, 20, 50);
      pdf.text(`Size: ${(file.size / 1024).toFixed(2)} KB`, 20, 60);
      pdf.text(`Date: ${documentData.completedDate}`, 20, 70);
      
      pdf.setTextColor(0, 0, 0);
      pdf.text('Content:', 20, 90);
      pdf.text(documentData.content, 20, 100);
      
      resolve(pdf.output('datauristring'));
    }
  });
};

// Convert any document to PDF
export const convertDocumentToPDF = async (documentData: DocumentData): Promise<string> => {
  if (documentData.fileUrl && (documentData.fileUrl.includes('image') || documentData.fileUrl.includes('placeholder'))) {
    // Convert image to PDF with minimal formatting
    return await convertImageToPDF(documentData.fileUrl, documentData);
  } else if (documentData.fileUrl && documentData.fileUrl.startsWith('blob:')) {
    // Handle uploaded files - convert blob to reliable data URL
    try {
      const response = await fetch(documentData.fileUrl);
      const blob = await response.blob();
      
      // Convert blob to data URL for reliable display
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const dataUrl = e.target?.result as string;
            
            if (blob.type.startsWith('image/')) {
              // Convert image to PDF
              resolve(await convertImageToPDF(dataUrl, documentData));
            } else if (blob.type === 'application/pdf') {
              // Return PDF data URL directly
              resolve(dataUrl);
            } else {
              // Create simple PDF for other file types
              const file = new File([blob], documentData.title, { type: blob.type });
              resolve(await convertUploadedFileToPDF(file, documentData));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read uploaded file'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      return createMedicalReportPDF(documentData);
    }
  } else {
    // Create simple medical report PDF preserving original content
    return createMedicalReportPDF(documentData);
  }
}; 