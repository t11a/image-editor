import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';

const ImageEditor = forwardRef(({ zoomLevel }, ref) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

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
    },
    hasImage: () => !!imageSrc,
  }));

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
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

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
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
            }}
          />
        </div>
      )}
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';

export default ImageEditor;
