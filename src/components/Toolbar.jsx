import React from 'react';
import {
  RotateCcw,
  Undo,
  Redo,
  Hand,
  Square,
  Circle,
  ArrowRight,
  Pen,
  Type,
  Minus,
  Plus,
  Copy,
  Download,
  Crop,
  Check,
  X,
} from 'lucide-react';

const Toolbar = ({
  onZoomIn,
  onZoomOut,
  onCopy,
  onDownload,
  onReset,
  onUndo,
  onRedo,
  zoomLevel,
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onWidthChange,
  fontSize,
  onFontSizeChange,
  onCrop,
  onCropCancel,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <img
          src="/favicon.png"
          alt="SnapEdit Logo"
          style={{ height: '48px', marginRight: '10px' }}
        />
        <h1 className="app-title">SnapEdit</h1>
      </div>
      <div className="toolbar-group">
        <button onClick={onReset} title="Reset Image">
          <RotateCcw size={20} />
        </button>
        <button onClick={onUndo} title="Undo">
          <Undo size={20} />
        </button>
        <button onClick={onRedo} title="Redo">
          <Redo size={20} />
        </button>
        <div
          className="separator"
          style={{
            width: '1px',
            height: '24px',
            background: '#444',
            margin: '0 10px',
          }}
        ></div>
        {currentTool === 'crop' ? (
          <>
            <button onClick={onCrop} title="Apply Crop" className="active">
              <Check size={20} />
            </button>
            <button onClick={onCropCancel} title="Cancel Crop">
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <button
              className={currentTool === 'select' ? 'active' : ''}
              onClick={() => onToolChange('select')}
              title="Select Tool"
            >
              <Hand size={20} />
            </button>
            <button
              className={currentTool === 'crop' ? 'active' : ''}
              onClick={() => onToolChange('crop')}
              title="Crop Tool"
            >
              <Crop size={20} />
            </button>
            <button
              className={currentTool === 'rect' ? 'active' : ''}
              onClick={() => onToolChange('rect')}
              title="Rectangle Tool"
            >
              <Square size={20} />
            </button>
            <button
              className={currentTool === 'circle' ? 'active' : ''}
              onClick={() => onToolChange('circle')}
              title="Circle Tool"
            >
              <Circle size={20} />
            </button>
            <button
              className={currentTool === 'arrow' ? 'active' : ''}
              onClick={() => onToolChange('arrow')}
              title="Arrow Tool"
            >
              <ArrowRight size={20} />
            </button>
            <button
              className={currentTool === 'pen' ? 'active' : ''}
              onClick={() => onToolChange('pen')}
              title="Pen Tool"
            >
              <Pen size={20} />
            </button>
            <div
              className="separator"
              style={{
                width: '1px',
                height: '24px',
                background: '#444',
                margin: '0 10px',
              }}
            ></div>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              title="Color Picker"
              style={{
                height: '30px',
                width: '40px',
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
            />
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => onWidthChange(parseInt(e.target.value))}
              title={`Stroke Width: ${strokeWidth}px`}
              style={{ width: '80px', marginRight: '10px' }}
            />
            <button
              className={currentTool === 'text' ? 'active' : ''}
              onClick={() => onToolChange('text')}
              title="Text Tool"
            >
              <Type size={20} />
            </button>
            <input
              type="number"
              min="10"
              max="100"
              value={fontSize || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  onFontSizeChange(Math.max(10, val));
                } else {
                  onFontSizeChange(0);
                }
              }}
              onBlur={() => {
                if (!fontSize || fontSize < 10) {
                  onFontSizeChange(10);
                }
              }}
              title={`Font Size: ${fontSize}px`}
              style={{ width: '60px', marginLeft: '10px' }}
            />
          </>
        )}
      </div>
      <div className="toolbar-group">
        <button onClick={onZoomOut} title="Zoom Out">
          <Minus size={20} />
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={onZoomIn} title="Zoom In">
          <Plus size={20} />
        </button>
        <button onClick={onCopy} title="Copy to Clipboard">
          <Copy size={20} />
        </button>
        <button onClick={onDownload} title="Download Image">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
