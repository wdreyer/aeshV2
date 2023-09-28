// exportToPDF.js

const exportToPDF = async () => {
  const html2pdf = (await import('html2pdf.js')).default;

  if (typeof window !== 'undefined') {
    const pdfElement = document.getElementById('div-a-imprimer');
    if (!pdfElement) {
      console.error('Élément PDF introuvable');
      return;
    }

    const opt = {
      margin: 1,
      filename: 'aesh_data.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const pdfBlob = await html2pdf().from(pdfElement).set(opt).outputPdf('blob');

    const blobUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = 'aesh_data.pdf';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
  }
};

export default exportToPDF;
