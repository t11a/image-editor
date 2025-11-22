import React from 'react';

const Toolbar = ({
  onZoomIn,
  onZoomOut,
  onCopy,
  onDownload,
  onReset,
  zoomLevel,
  currentTool,
  onToolChange,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <h1 className="app-title">Imaginator</h1>
      </div>
      <div className="toolbar-group">
        <button
          className={currentTool === 'select' ? 'active' : ''}
          onClick={() => onToolChange('select')}
          title="Select"
        >
          Select
        </button>
        <button
          className={currentTool === 'rect' ? 'active' : ''}
          onClick={() => onToolChange('rect')}
          title="Rectangle"
        >
          Rect
        </button>
        <button
          className={currentTool === 'arrow' ? 'active' : ''}
          onClick={() => onToolChange('arrow')}
          title="Arrow"
        >
          Arrow
        </button>
        <button
          className={currentTool === 'text' ? 'active' : ''}
          onClick={() => onToolChange('text')}
          title="Text"
        >
          Text
        </button>
      </div>
      <div className="toolbar-group">
        <button onClick={onZoomOut} title="Zoom Out">
          -
        </button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={onZoomIn} title="Zoom In">
          +
        </button>
      </div>
      <div className="toolbar-group">
        <button onClick={onReset} title="Reset Image">
          Reset
        </button>
        <button onClick={onCopy} title="Copy to Clipboard">
          Copy
        </button>
        <button onClick={onDownload} title="Download">
          Download
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
