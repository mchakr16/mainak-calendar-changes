// import React from "react";
// import html2canvas from "html2canvas";
// import {jsPDF} from "jspdf";

// /**
// * Call this when user clicks "Export PDF"
// */
// export const ExportScheduleButton = () => {

//     async () => {
//         try {
//             // 1) Select original schedule container
//             const source = document.querySelector(".rbs-container"); // <- change selector if needed
//             if (!source) {
//                 alert("Schedule container not found (selector .rbs-container).");
//                 return;
//             }

//             // 2) Clone it to render full height off-screen
//             const clone: any = source.cloneNode(true);

//             // Create a container off-screen
//             const offScreen = document.createElement("div");
//             offScreen.style.position = "fixed";
//             offScreen.style.left = "-99999px";
//             offScreen.style.top = "0";
//             // set background (some components rely on it)
//             offScreen.style.background = window.getComputedStyle(source).background || "#fff";
//             // ensure it can expand to full height
//             offScreen.style.overflow = "visible";
//             offScreen.appendChild(clone);
//             document.body.appendChild(offScreen);

//             // 3) Remove any scrolling/overflow constraints in the clone so everything expands
//             const allElements = clone.querySelectorAll("*");
//             allElements.forEach(el => {
//                 el.style.maxHeight = "none";
//                 el.style.overflow = "visible";
//                 // remove inline clipping or transforms that hide content
//                 // (be careful if some elements must remain clipped; test on your UI)
//             });

//             // Give browser a moment to layout; await next frame
//             await new Promise(resolve => requestAnimationFrame(resolve));

//             // 4) Use html2canvas to render the clone
//             // Use a higher scale for better resolution (2 or 3)
//             const scale = 2; // increase if you need very high quality at expense of memory
//             const width = clone.scrollWidth;
//             const height = clone.scrollHeight;

//             const canvas = await html2canvas(clone, {
//                 useCORS: true,
//                 scale,
//                 // ensure full size canvas
//                 width: width,
//                 height: height,
//                 windowWidth: Math.max(document.documentElement.clientWidth, width),
//                 windowHeight: Math.max(document.documentElement.clientHeight, height),
//                 allowTaint: false,
//             });

//             // 5) Convert canvas to PDF (A4 portrait or landscape depending on schedule)
//             const imgData = canvas.toDataURL("image/png");

//             // Create jsPDF in landscape if width > height, otherwise portrait
//             const isLandscape = canvas.width > canvas.height;
//             const pdf = new jsPDF({
//                 orientation: isLandscape ? "l" : "p",
//                 unit: "pt",
//                 format: "a4",
//             });

//             const pdfPageWidth = pdf.internal.pageSize.getWidth();
//             const pdfPageHeight = pdf.internal.pageSize.getHeight();

//             // scale image to PDF page width
//             const imgProps = { width: canvas.width, height: canvas.height };
//             const ratio = imgProps.width / pdfPageWidth;
//             const scaledHeight = imgProps.height / ratio; // height in PDF pts

//             // If the scaled image fits on one page, add directly
//             if (scaledHeight <= pdfPageHeight) {
//                 pdf.addImage(imgData, "PNG", 0, 0, pdfPageWidth, scaledHeight);
//             } else {
//                 // Otherwise slice the canvas into pages
//                 let remainingHeight = canvas.height;
//                 let sliceY = 0;
//                 const pageCanvas = document.createElement("canvas");
//                 const pageCtx = pageCanvas.getContext("2d");

//                 // compute page height in source canvas pixels that correspond to pdfPageHeight
//                 const pxPerPt = canvas.width / pdfPageWidth; // canvas pixels per PDF point horizontally
//                 const pageCanvasHeightPx = Math.floor(pdfPageHeight * pxPerPt); // how many source pixels per page

//                 while (remainingHeight > 0) {
//                     const h = Math.min(pageCanvasHeightPx, remainingHeight);
//                     pageCanvas.width = canvas.width;
//                     pageCanvas.height = h;

//                     // draw slice
//                     pageCtx?.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
//                     pageCtx?.drawImage(canvas, 0, sliceY, canvas.width, h, 0, 0, canvas.width, h);

//                     const pageData = pageCanvas.toDataURL("image/png");
//                     // scaled height for this slice on PDF (should equal pdfPageHeight except maybe last)
//                     const scaledSliceH = (h / canvas.width) * pdfPageWidth;

//                     pdf.addImage(pageData, "PNG", 0, 0, pdfPageWidth, scaledSliceH);

//                     remainingHeight -= h;
//                     sliceY += h;
//                     if (remainingHeight > 0) pdf.addPage();
//                 }
//             }

//             // 6) Save
//             pdf.save("schedule.pdf");

//             // Clean up
//             document.body.removeChild(offScreen);
//         } catch (err: any) {
//             console.error("Export failed", err);
//             alert("Failed to export PDF: " + (err.message || err));
//         }
//     }

//     //     return (
//     //         <button onClick= { exportSchedulePdf } >
//     //         Export PDF(full UI)
//     //             </button>
//     //   );
// }

