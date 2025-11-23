import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';

const ImageEditor = forwardRef(
  (
    {
      zoomLevel,
      currentTool,
      onImageLoad,
      currentColor,
      strokeWidth,
      fontSize,
      onObjectSelect,
    },
    ref
  ) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [objects, setObjects] = useState([]); // { type, x, y, width, height, color, width, text, points, ... }
    const [drawingStart, setDrawingStart] = useState(null);
    const [currentDragPos, setCurrentDragPos] = useState(null);
    const [currentPath, setCurrentPath] = useState([]); // For pen tool
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const isAddingText = useRef(false);

    const [selectedObjectIndex, setSelectedObjectIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState(null);

    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

    const [editingIndex, setEditingIndex] = useState(null);
    const [loadedImage, setLoadedImage] = useState(null);

    // History for Undo/Redo
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const saveHistory = useCallback(() => {
      setHistory((prev) => [...prev, objects]);
      setRedoStack([]);
    }, [objects]);

    const undo = useCallback(() => {
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      setRedoStack((prev) => [...prev, objects]);
      setObjects(previous);
      setHistory((prev) => prev.slice(0, -1));
      setSelectedObjectIndex(null);
      setEditingIndex(null);
    }, [history, objects]);

    const redo = useCallback(() => {
      if (redoStack.length === 0) return;
      const next = redoStack[redoStack.length - 1];
      setHistory((prev) => [...prev, objects]);
      setObjects(next);
      setRedoStack((prev) => prev.slice(0, -1));
      setSelectedObjectIndex(null);
      setEditingIndex(null);
    }, [redoStack, objects]);

    const isPointInObject = (x, y, obj) => {
      if (obj.type === 'rect') {
        return (
          x >= obj.x &&
          x <= obj.x + obj.width &&
          y >= obj.y &&
          y <= obj.y + obj.height
        );
      } else if (obj.type === 'circle') {
        const radius = Math.sqrt(
          Math.pow(obj.width / 2, 2) + Math.pow(obj.height / 2, 2)
        );
        const centerX = obj.x + obj.width / 2;
        const centerY = obj.y + obj.height / 2;
        return (
          Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) <=
          radius
        );
      } else if (obj.type === 'text') {
        const fontSize = obj.fontSize || 20;
        const width = obj.text.length * (fontSize * 0.6); // Approx width
        const height = fontSize;
        return (
          x >= obj.x && x <= obj.x + width && y >= obj.y - height && y <= obj.y
        );
      } else if (obj.type === 'arrow') {
        const A = x - obj.sx;
        const B = y - obj.sy;
        const C = obj.ex - obj.sx;
        const D = obj.ey - obj.sy;
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;
        let xx, yy;
        if (param < 0) {
          xx = obj.sx;
          yy = obj.sy;
        } else if (param > 1) {
          xx = obj.ex;
          yy = obj.ey;
        } else {
          xx = obj.sx + param * C;
          yy = obj.sy + param * D;
        }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy) < 10;
      } else if (obj.type === 'pen') {
        // Simple hit test: close to any point
        return obj.points.some(
          (p) => Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2)) < 10
        );
      }
      return false;
    };

    const renderCanvas = useCallback(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (loadedImage) {
        ctx.drawImage(loadedImage, 0, 0);
      }

      const drawShape = (obj, index) => {
        // Skip rendering text if it's being edited
        if (index === editingIndex && obj.type === 'text') return;

        ctx.beginPath();
        ctx.strokeStyle = obj.color || 'red';
        ctx.lineWidth = obj.strokeWidth || 3;
        ctx.fillStyle = obj.color || 'red';
        ctx.font = `${obj.fontSize || 20}px Arial`;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (obj.type === 'rect') {
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.type === 'circle') {
          ctx.beginPath();
          const radiusX = Math.abs(obj.width / 2);
          const radiusY = Math.abs(obj.height / 2);
          const centerX = obj.x + obj.width / 2;
          const centerY = obj.y + obj.height / 2;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (obj.type === 'arrow') {
          const headlen = 10 + (obj.strokeWidth || 3);
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
        } else if (obj.type === 'pen') {
          if (obj.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(obj.points[0].x, obj.points[0].y);
            for (let i = 1; i < obj.points.length; i++) {
              ctx.lineTo(obj.points[i].x, obj.points[i].y);
            }
            ctx.stroke();
          }
        }

        if (index === selectedObjectIndex) {
          ctx.save();
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);

          if (obj.type === 'rect' || obj.type === 'circle') {
            ctx.strokeRect(
              obj.x - 5,
              obj.y - 5,
              obj.width + 10,
              obj.height + 10
            );
          } else if (obj.type === 'text') {
            const fontSize = obj.fontSize || 20;
            const width = obj.text.length * (fontSize * 0.6);
            const height = fontSize;
            ctx.strokeRect(
              obj.x - 5,
              obj.y - height - 5,
              width + 10,
              height + 10
            );
          } else if (obj.type === 'arrow') {
            ctx.fillStyle = 'blue';
            ctx.fillRect(obj.sx - 5, obj.sy - 5, 10, 10);
            ctx.fillRect(obj.ex - 5, obj.ey - 5, 10, 10);
          } else if (obj.type === 'pen') {
            // Bounding box for pen? Too expensive to calc every frame?
            // Just highlight start/end for now or skip
          }
          ctx.restore();
        }
      };

      objects.forEach((obj, index) => drawShape(obj, index));

      // Draw Preview
      if (drawingStart) {
        const previewObj = {
          color: currentColor,
          strokeWidth: strokeWidth,
          fontSize: fontSize,
        };

        if (currentTool === 'rect' && currentDragPos) {
          drawShape({
            ...previewObj,
            type: 'rect',
            x: drawingStart.x,
            y: drawingStart.y,
            width: currentDragPos.x - drawingStart.x,
            height: currentDragPos.y - drawingStart.y,
          });
        } else if (currentTool === 'circle' && currentDragPos) {
          drawShape({
            ...previewObj,
            type: 'circle',
            x: drawingStart.x,
            y: drawingStart.y,
            width: currentDragPos.x - drawingStart.x,
            height: currentDragPos.y - drawingStart.y,
          });
        } else if (currentTool === 'arrow' && currentDragPos) {
          drawShape({
            ...previewObj,
            type: 'arrow',
            sx: drawingStart.x,
            sy: drawingStart.y,
            ex: currentDragPos.x,
            ey: currentDragPos.y,
          });
        } else if (currentTool === 'pen' && currentPath.length > 0) {
          drawShape({
            ...previewObj,
            type: 'pen',
            points: currentPath,
          });
        }
      }
    }, [
      objects,
      drawingStart,
      currentDragPos,
      currentTool,
      selectedObjectIndex,
      loadedImage,
      currentColor,
      currentPath,
      editingIndex,
      strokeWidth,
      fontSize,
    ]);

    useEffect(() => {
      renderCanvas();
    }, [renderCanvas]);

    // Update font size of selected text object when fontSize prop changes
    useEffect(() => {
      if (
        selectedObjectIndex !== null &&
        objects[selectedObjectIndex] &&
        objects[selectedObjectIndex].type === 'text'
      ) {
        if (objects[selectedObjectIndex].fontSize !== fontSize) {
          const updatedObjects = [...objects];
          updatedObjects[selectedObjectIndex] = {
            ...updatedObjects[selectedObjectIndex],
            fontSize: fontSize,
          };
          setObjects(updatedObjects);
        }
      }
    }, [fontSize, selectedObjectIndex, objects]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (editingIndex !== null) return; // Don't handle delete/undo while editing text

        if (
          (e.key === 'Delete' || e.key === 'Backspace') &&
          selectedObjectIndex !== null
        ) {
          saveHistory();
          setObjects((prev) =>
            prev.filter((_, i) => i !== selectedObjectIndex)
          );
          setSelectedObjectIndex(null);
        }
        // Undo/Redo shortcuts
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          e.preventDefault();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedObjectIndex, objects, saveHistory, undo, redo, editingIndex]);

    useImperativeHandle(ref, () => ({
      copyToClipboard: async () => {
        if (!canvasRef.current) return;
        const prevSelection = selectedObjectIndex;
        const prevEditing = editingIndex;
        setSelectedObjectIndex(null);
        setEditingIndex(null);
        setTimeout(async () => {
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
          } finally {
            setSelectedObjectIndex(prevSelection);
            setEditingIndex(prevEditing);
          }
        }, 0);
      },
      downloadImage: () => {
        if (!canvasRef.current) return;
        const prevSelection = selectedObjectIndex;
        const prevEditing = editingIndex;
        setSelectedObjectIndex(null);
        setEditingIndex(null);
        setTimeout(() => {
          const link = document.createElement('a');
          link.download = 'edited-image.png';
          link.href = canvasRef.current.toDataURL();
          link.click();
          setSelectedObjectIndex(prevSelection);
          setEditingIndex(prevEditing);
        }, 0);
      },
      resetImage: () => {
        setImageSrc(null);
        setObjects([]);
        setHistory([]);
        setRedoStack([]);
        setImgDimensions({ width: 0, height: 0 });
        setSelectedObjectIndex(null);
        setEditingIndex(null);
      },
      undo,
      redo,
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
      if (!imageSrc) return;
      const { x, y } = getCanvasCoordinates(e);

      if (currentTool === 'select') {
        let clickedIndex = null;
        for (let i = objects.length - 1; i >= 0; i--) {
          if (isPointInObject(x, y, objects[i])) {
            clickedIndex = i;
            break;
          }
        }
        setSelectedObjectIndex(clickedIndex);
        if (clickedIndex !== null) {
          const obj = objects[clickedIndex];
          if (onObjectSelect) {
            onObjectSelect(obj);
          }
          if (
            obj.type === 'rect' ||
            obj.type === 'text' ||
            obj.type === 'circle'
          ) {
            setDragOffset({ x: x - obj.x, y: y - obj.y });
          } else if (obj.type === 'arrow') {
            setDragOffset({ dx: x - obj.sx, dy: y - obj.sy });
          } else if (obj.type === 'pen') {
            // Move pen path? Complex. Just skip for now or implement simple offset
            const offsetX = x - obj.points[0].x;
            const offsetY = y - obj.points[0].y;
            setDragOffset({ x: offsetX, y: offsetY, type: 'pen' });
          }
        }
        return;
      }

      if (currentTool === 'text') {
        e.preventDefault();
        isAddingText.current = true;
        saveHistory();

        let currentObjects = [...objects];
        // Cleanup empty text if we were editing
        if (
          editingIndex !== null &&
          currentObjects[editingIndex] &&
          currentObjects[editingIndex].text.trim() === ''
        ) {
          currentObjects.splice(editingIndex, 1);
        }

        const newTextObj = {
          type: 'text',
          x,
          y,
          text: '',
          color: currentColor,
          strokeWidth: strokeWidth,
          fontSize: fontSize,
        };
        const newObjects = [...currentObjects, newTextObj];
        setObjects(newObjects);
        setEditingIndex(newObjects.length - 1);
        setSelectedObjectIndex(newObjects.length - 1);

        setTimeout(() => {
          isAddingText.current = false;
        }, 100);
      } else if (currentTool === 'pen') {
        setDrawingStart({ x, y });
        setCurrentPath([{ x, y }]);
      } else {
        setDrawingStart({ x, y });
      }
    };

    const handleDoubleClick = (e) => {
      if (!imageSrc) return;
      const { x, y } = getCanvasCoordinates(e);

      // Check if double clicked on text
      for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].type === 'text' && isPointInObject(x, y, objects[i])) {
          setEditingIndex(i);
          setSelectedObjectIndex(i);
          break;
        }
      }
    };

    const handleMouseMove = (e) => {
      const { x, y } = getCanvasCoordinates(e);

      if (
        currentTool === 'select' &&
        selectedObjectIndex !== null &&
        dragOffset
      ) {
        // We need to save history before starting drag... but drag is continuous.
        // Ideally save history on MouseDown if we are about to drag?
        // Or save on MouseUp if position changed?
        // For simplicity, let's just update state. Real undo for drag needs "drag start" snapshot.

        const updatedObjects = [...objects];
        const obj = { ...updatedObjects[selectedObjectIndex] };

        if (
          obj.type === 'rect' ||
          obj.type === 'text' ||
          obj.type === 'circle'
        ) {
          obj.x = x - dragOffset.x;
          obj.y = y - dragOffset.y;
        } else if (obj.type === 'arrow') {
          const width = obj.ex - obj.sx;
          const height = obj.ey - obj.sy;
          obj.sx = x - dragOffset.dx;
          obj.sy = y - dragOffset.dy;
          obj.ex = obj.sx + width;
          obj.ey = obj.sy + height;
        } else if (obj.type === 'pen' && dragOffset.type === 'pen') {
          // Move all points
          const dx = x - dragOffset.x - obj.points[0].x;
          const dy = y - dragOffset.y - obj.points[0].y;
          obj.points = obj.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        }
        updatedObjects[selectedObjectIndex] = obj;
        setObjects(updatedObjects);
        return;
      }

      if (!drawingStart) return;

      if (currentTool === 'pen') {
        setCurrentPath((prev) => [...prev, { x, y }]);
      }
      setCurrentDragPos({ x, y });
    };

    const handleMouseUp = (e) => {
      if (currentTool === 'select') {
        if (dragOffset) {
          // If we dragged, we should probably save history?
          // But we didn't save before drag.
          // Let's skip complex drag-undo for now to keep it simple, or implement "drag start" tracking.
        }
        setDragOffset(null);
        return;
      }

      if (!drawingStart) return;
      const { x, y } = getCanvasCoordinates(e);

      saveHistory(); // Save state before adding new object

      const commonProps = {
        color: currentColor,
        strokeWidth: strokeWidth,
        fontSize: fontSize,
      };

      if (currentTool === 'rect') {
        setObjects([
          ...objects,
          {
            type: 'rect',
            x: drawingStart.x,
            y: drawingStart.y,
            width: x - drawingStart.x,
            height: y - drawingStart.y,
            ...commonProps,
          },
        ]);
      } else if (currentTool === 'circle') {
        setObjects([
          ...objects,
          {
            type: 'circle',
            x: drawingStart.x,
            y: drawingStart.y,
            width: x - drawingStart.x,
            height: y - drawingStart.y,
            ...commonProps,
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
            ...commonProps,
          },
        ]);
      } else if (currentTool === 'pen') {
        setObjects([
          ...objects,
          {
            type: 'pen',
            points: currentPath,
            ...commonProps,
          },
        ]);
        setCurrentPath([]);
      }
      setDrawingStart(null);
      setCurrentDragPos(null);
    };

    const handleTextChange = (e, index) => {
      const newObjects = [...objects];
      newObjects[index].text = e.target.value;
      setObjects(newObjects);
    };

    const handleTextBlur = () => {
      if (isAddingText.current) return;
      setEditingIndex(null);
      // If text is empty, remove it
      if (
        editingIndex !== null &&
        objects[editingIndex] &&
        objects[editingIndex].text.trim() === ''
      ) {
        setObjects((prev) => prev.filter((_, i) => i !== editingIndex));
        setSelectedObjectIndex(null);
      }
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
          setObjects([]);
          setHistory([]);
          setRedoStack([]);
          setEditingIndex(null);
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
              setHistory([]);
              setRedoStack([]);
              setEditingIndex(null);
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
      if (imageSrc) {
        const img = new Image();
        img.onload = () => {
          setLoadedImage(img);
          setImgDimensions({ width: img.width, height: img.height });

          // Calculate scale to fit
          if (containerRef.current && onImageLoad) {
            const container = containerRef.current;
            const scaleX = (container.clientWidth - 40) / img.width;
            const scaleY = (container.clientHeight - 40) / img.height;
            const scale = Math.min(scaleX, scaleY, 1);
            onImageLoad(Math.floor(scale * 10) / 10 || 0.1);
          }
        };
        img.src = imageSrc;
      } else {
        setLoadedImage(null);
      }
    }, [imageSrc, onImageLoad]);

    // Effect for resizing canvas (only when dimensions change)
    useEffect(() => {
      if (
        canvasRef.current &&
        imgDimensions.width > 0 &&
        imgDimensions.height > 0
      ) {
        canvasRef.current.width = imgDimensions.width;
        canvasRef.current.height = imgDimensions.height;
      }
    }, [imgDimensions]);

    // Effect for rendering (when renderCanvas changes, e.g. tool change, or loadedImage changes)
    useEffect(() => {
      renderCanvas();
    }, [renderCanvas, loadedImage]);

    return (
      <div
        ref={containerRef}
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
            <div
              style={{
                position: 'relative',
                width: 'fit-content',
                height: 'fit-content',
              }}
            >
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
                onDoubleClick={handleDoubleClick}
              />
              {editingIndex !== null && objects[editingIndex] && (
                <textarea
                  value={objects[editingIndex].text}
                  onChange={(e) => handleTextChange(e, editingIndex)}
                  onBlur={handleTextBlur}
                  autoFocus
                  placeholder="Type text..."
                  style={{
                    position: 'absolute',
                    left: objects[editingIndex].x * zoomLevel,
                    top:
                      (objects[editingIndex].y -
                        (objects[editingIndex].fontSize || 20)) *
                      zoomLevel,
                    fontSize: `${(objects[editingIndex].fontSize || 20) * zoomLevel}px`,
                    color: objects[editingIndex].color,
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px dashed blue',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    whiteSpace: 'pre',
                    minWidth: '100px',
                    minHeight: '1.2em',
                    width: `${Math.max(100, (objects[editingIndex].text.length + 1) * ((objects[editingIndex].fontSize || 20) * 0.6) * zoomLevel)}px`,
                    height: `${Math.max(30, (objects[editingIndex].fontSize || 20) * 1.5 * zoomLevel)}px`,
                    zIndex: 1000,
                    padding: '2px',
                    margin: 0,
                    fontFamily: 'Arial',
                    lineHeight: 1,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ImageEditor.displayName = 'ImageEditor';

export default ImageEditor;
