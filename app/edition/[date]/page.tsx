
import dynamic from 'next/dynamic';
import React from 'react';
import "@/components/pdfviewer"
import Viewer from '@/components/pdfviewer';

// Use dynamic import to ensure this loads ONLY in the browser
// const DynamicSimpleViewer = dynamic(() => import('@/components/pdfviewer'), {
//   ssr: false, // Critical setting
//   loading: () => <p>Loading PDF preview...</p>, 
// });

export default function Edition() {
    const pdfUrl = '../test.pdf'; 

    return (
        <div>
            <h1>PDF Edition Viewer</h1>
            <Viewer url={pdfUrl}/>
        </div>
    );
}
