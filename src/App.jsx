import React, { useState, useRef, useCallback } from 'react';
import ImageEditor from './components/ImageEditor';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTool, setCurrentTool] = useState('select');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const imageEditorRef = useRef(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));
  const handleCopy = () => imageEditorRef.current?.copyToClipboard();
  const handleDownload = () => imageEditorRef.current?.downloadImage();
  const handleUndo = () => imageEditorRef.current?.undo();
  const handleRedo = () => imageEditorRef.current?.redo();

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset? All changes will be lost.'
      )
    ) {
      if (imageEditorRef.current) {
        imageEditorRef.current.resetImage();
        setZoomLevel(1);
      }
    }
  };

  const handleImageLoad = useCallback((scale) => {
    setZoomLevel(scale);
  }, []);

  const handleObjectSelect = useCallback((obj) => {
    if (obj) {
      if (obj.type === 'text' && obj.fontSize) {
        setFontSize(obj.fontSize);
      }
      if (obj.strokeWidth) {
        setStrokeWidth(obj.strokeWidth);
      }
    }
  }, []);

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
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />
      <ImageEditor
        ref={imageEditorRef}
        zoomLevel={zoomLevel}
        currentTool={currentTool}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        fontSize={fontSize}
        onImageLoad={handleImageLoad}
        onObjectSelect={handleObjectSelect}
      />
    </div>
  );
}

export default App;
