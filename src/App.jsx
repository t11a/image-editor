import React, { useState, useRef } from 'react';
import ImageEditor from './components/ImageEditor';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageEditorRef = useRef(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));

  const handleCopy = () => {
    if (imageEditorRef.current) {
      imageEditorRef.current.copyToClipboard();
    }
  };

  const handleDownload = () => {
    if (imageEditorRef.current) {
      imageEditorRef.current.downloadImage();
    }
  };

  const handleReset = () => {
    if (imageEditorRef.current) {
      imageEditorRef.current.resetImage();
      setZoomLevel(1);
    }
  };

  return (
    <div className="app-container">
      <Toolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onReset={handleReset}
        zoomLevel={zoomLevel}
      />
      <ImageEditor ref={imageEditorRef} zoomLevel={zoomLevel} />
    </div>
  );
}

export default App;
