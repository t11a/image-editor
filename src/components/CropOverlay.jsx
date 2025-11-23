import React from 'react';

const CropOverlay = ({
  cropRect,
  zoomLevel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  if (!cropRect) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: cropRect.x * zoomLevel,
        top: cropRect.y * zoomLevel,
        width: cropRect.width * zoomLevel,
        height: cropRect.height * zoomLevel,
        border: '2px dashed white',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'auto',
        cursor: 'move',
      }}
      onMouseDown={(e) => {
        onMouseDown(e);
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Handles */}
      {['tl', 'tr', 'bl', 'br'].map((handle) => (
        <div
          key={handle}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: 'white',
            border: '1px solid black',
            top: handle.includes('t') ? '-5px' : 'calc(100% - 5px)',
            left: handle.includes('l') ? '-5px' : 'calc(100% - 5px)',
            cursor:
              handle === 'tl' || handle === 'br'
                ? 'nwse-resize'
                : 'nesw-resize',
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // Don't trigger drag move
            onMouseDown(e, handle);
          }}
        />
      ))}
    </div>
  );
};

export default CropOverlay;
