// "use client";


// import { PDFDocumentProxy } from "pdfjs-dist";
// import { useEffect, useRef, useState } from "react";
// import * as pdfjs from "pdfjs-dist";

// pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`; 

// export default function Viewer({url}: {url: string}) {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const [pdf, setPdf] = useState<PDFDocumentProxy>();
//     const [page, setPage] = useState(1);
//     const [scale, setScale] = useState(1.2);
    
//     // load pdf when url updates.
//     useEffect(() => {
//         pdfjs.getDocument(url).promise.then(setPdf);
//     }, [url]);

//     // render page when pdf loads or zoom or page number changes.
//     useEffect(() => {
//         if(!pdf || !canvasRef.current) return;

//         const render = async() => {
//             const pg = await pdf.getPage(page);
//             const viewport = pg.getViewport({scale});
//             const canvas = canvasRef.current!;
//             const ctx = canvas.getContext("2d")!;

//             canvas.width = viewport.width;
//             canvas.height = viewport.height;

//             await pg.render({canvas: canvas, canvasContext: ctx, viewport}).promise;
//         };

//         render();
//     }, [pdf, page, scale])

//     return (
//         <div>
//             <canvas ref={canvasRef} />
//             <div>
//                 <button onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
//                 <button onClick={() => setPage(p => p + 1)}>Next</button>
//                 <button onClick={() => setScale(s => s + 0.2)}>Zoom +</button>
//                 <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))}>Zoom -</button>
//             </div>
//         </div>
//     )
// }

"use client";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.mjs`;

export default function Viewer({ url }: {url: string}) {
  return (
    <Document file={url} loading="Loading newspaper...">
        <Page
            pageNumber={1}
            scale={1.6}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            devicePixelRatio={window.devicePixelRatio}
            className={'m-auto block w-fit'}
        />
    </Document>
  );
}
