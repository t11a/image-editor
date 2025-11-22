import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';

const ImageEditor = forwardRef(({ zoomLevel, currentTool }, ref) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [objects, setObjects] = useState([]); // { type, x, y, width, height, color, text, points }
  const [drawingStart, setDrawingStart] = useState(null);
  const [currentDragPos, setCurrentDragPos] = useState(null);
  const canvasRef = useRef(null);

  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Image
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      ctx.drawImage(img, 0, 0);
    }

    // Helper to draw a shape
    const drawShape = (obj) => {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'red';
      ctx.font = '20px Arial';

      if (obj.type === 'rect') {
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'arrow') {
        const headlen = 10;
        const angle = Math.atan2(obj.ey - obj.sy, obj.ex - obj.sx);
        ctx.moveTo(obj.sx, obj.sy);
        ctx.lineTo(obj.ex, obj.ey);
        ctx.lineTo(
          obj.ex - headlen * Math.cos(angle - Math.PI / 6),
          obj.ey - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(obj.ex, obj.ey);
        ctx.lineTo(
          obj.ex - headlen * Math.cos(angle + Math.PI / 6),
          obj.ey - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (obj.type === 'text') {
        ctx.fillText(obj.text, obj.x, obj.y);
      }
    };

    // Draw Objects
    objects.forEach(drawShape);

    // Draw Preview
    if (drawingStart && currentDragPos) {
      if (currentTool === 'rect') {
        drawShape({
          type: 'rect',
          x: drawingStart.x,
          y: drawingStart.y,
          width: currentDragPos.x - drawingStart.x,
          height: currentDragPos.y - drawingStart.y,
        });
      } else if (currentTool === 'arrow') {
        drawShape({
          type: 'arrow',
          sx: drawingStart.x,
          sy: drawingStart.y,
          ex: currentDragPos.x,
          ey: currentDragPos.y,
        });
      }
    }
  }, [imageSrc, objects, drawingStart, currentDragPos, currentTool]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useImperativeHandle(ref, () => ({
    copyToClipboard: async () => {
      if (!canvasRef.current) return;
      try {
        const blob = await new Promise((resolve) =>
          canvasRef.current.toBlob(resolve)
        );
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        alert('Image copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy image.');
      }
    },
    downloadImage: () => {
      if (!canvasRef.current) return;
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    },
    resetImage: () => {
      setImageSrc(null);
      setObjects([]);
      setImgDimensions({ width: 0, height: 0 });
    },
    hasImage: () => !!imageSrc,
  }));

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e) => {
    if (!imageSrc || currentTool === 'select') return;
    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        setObjects([...objects, { type: 'text', x, y, text }]);
      }
    } else {
      setDrawingStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!drawingStart) return;
    const { x, y } = getCanvasCoordinates(e);
    setCurrentDragPos({ x, y });
  };

  const handleMouseUp = (e) => {
    if (!drawingStart) return;
    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === 'rect') {
      setObjects([
        ...objects,
        {
          type: 'rect',
          x: drawingStart.x,
          y: drawingStart.y,
          width: x - drawingStart.x,
          height: y - drawingStart.y,
        },
      ]);
    } else if (currentTool === 'arrow') {
      setObjects([
        ...objects,
        {
          type: 'arrow',
          sx: drawingStart.x,
          sy: drawingStart.y,
          ex: x,
          ey: y,
        },
      ]);
    }
    setDrawingStart(null);
    setCurrentDragPos(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setObjects([]); // Clear objects on new image load
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setImageSrc(event.target.result);
            setObjects([]);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        setImgDimensions({ width: img.width, height: img.height });
        // Initial draw is handled by renderCanvas via objects dependency or manual call
        // But we need to ensure dimensions are set before renderCanvas runs effectively
        renderCanvas();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, renderCanvas]);

  return (
    <div
      className={`image-editor-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!imageSrc ? (
        <div className="drop-zone">
          <p>Drag & Drop an image here</p>
        </div>
      ) : (
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            style={{
              width: imgDimensions.width
                ? imgDimensions.width * zoomLevel
                : 'auto',
              height: imgDimensions.height
                ? imgDimensions.height * zoomLevel
                : 'auto',
              cursor: currentTool === 'select' ? 'default' : 'crosshair',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        </div>
      )}
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';

export default ImageEditor;
