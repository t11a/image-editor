import React from 'react';

const TextEditor = ({ object, zoomLevel, onChange, onBlur }) => {
  if (!object) return null;

  return (
    <textarea
      value={object.text}
      onChange={onChange}
      onBlur={onBlur}
      autoFocus
      placeholder="Type text..."
      style={{
        position: 'absolute',
        left: object.x * zoomLevel,
        top: (object.y - (object.fontSize || 20)) * zoomLevel,
        fontSize: `${(object.fontSize || 20) * zoomLevel}px`,
        color: object.color,
        background: 'rgba(255, 255, 255, 0.8)',
        border: '1px dashed blue',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        whiteSpace: 'pre',
        minWidth: '100px',
        minHeight: '1.2em',
        width: `${Math.max(100, (object.text.length + 1) * ((object.fontSize || 20) * 0.6) * zoomLevel)}px`,
        height: `${Math.max(30, (object.fontSize || 20) * 1.5 * zoomLevel)}px`,
        zIndex: 1000,
        padding: '2px',
        margin: 0,
        fontFamily: 'Arial',
        lineHeight: 1,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      }}
    />
  );
};

export default TextEditor;
