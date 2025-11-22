import React, { useState, useRef } from 'react';
import ImageEditor from './components/ImageEditor';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const imageEditorRef = useRef(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));
  const handleCopy = () => imageEditorRef.current?.copyToClipboard();
  const handleDownload = () => imageEditorRef.current?.downloadImage();
  const handleUndo = () => imageEditorRef.current?.undo();
  const handleRedo = () => imageEditorRef.current?.redo();

  const handleReset = () => {
    if (imageEditorRef.current) {
      imageEditorRef.current.resetImage();
      setZoomLevel(1);
    }
  };

  const handleImageLoad = (scale) => {
    setZoomLevel(scale);
  };

  return (
    <div className="app-container">
      <Toolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onReset={handleReset}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoomLevel={zoomLevel}
        currentTool={currentTool}
        onToolChange={setCurrentTool}
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        strokeWidth={strokeWidth}
        onWidthChange={setStrokeWidth}
      />
      <ImageEditor
        ref={imageEditorRef}
        zoomLevel={zoomLevel}
        currentTool={currentTool}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        onImageLoad={handleImageLoad}
      />
    </div>
  );
}

export default App;
