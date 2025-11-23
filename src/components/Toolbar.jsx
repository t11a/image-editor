import React from 'react';

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
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <h1 className="app-title">Imaginator</h1>
      </div>
      <div className="toolbar-group">
        <button onClick={onReset} title="Reset Image">
          Reset
        </button>
        <button onClick={onUndo} title="Undo">
          Undo
        </button>
        <button onClick={onRedo} title="Redo">
          Redo
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
        <button
          className={currentTool === 'select' ? 'active' : ''}
          onClick={() => onToolChange('select')}
          title="Select Tool"
        >
          Select
        </button>
        <button
          className={currentTool === 'rect' ? 'active' : ''}
          onClick={() => onToolChange('rect')}
          title="Rectangle Tool"
        >
          Rect
        </button>
        <button
          className={currentTool === 'circle' ? 'active' : ''}
          onClick={() => onToolChange('circle')}
          title="Circle Tool"
        >
          Circle
        </button>
        <button
          className={currentTool === 'arrow' ? 'active' : ''}
          onClick={() => onToolChange('arrow')}
          title="Arrow Tool"
        >
          Arrow
        </button>
        <button
          className={currentTool === 'pen' ? 'active' : ''}
          onClick={() => onToolChange('pen')}
          title="Pen Tool"
        >
          Pen
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
          Text
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
              onFontSizeChange(0); // Or handle empty state differently if needed, but 0/empty allows typing
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
      </div>
      <div className="toolbar-group">
        <button onClick={onZoomOut} title="Zoom Out">
          -
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={onZoomIn} title="Zoom In">
          +
        </button>
        <button onClick={onCopy} title="Copy to Clipboard">
          Copy
        </button>
        <button onClick={onDownload} title="Download Image">
          Download
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
