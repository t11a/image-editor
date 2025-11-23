export const getResizeHandles = (obj) => {
  if (!obj) return {};
  const handleSize = 8;
  if (obj.type === 'rect' || obj.type === 'circle') {
    return {
      tl: {
        x: obj.x - handleSize / 2,
        y: obj.y - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      tr: {
        x: obj.x + obj.width - handleSize / 2,
        y: obj.y - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      bl: {
        x: obj.x - handleSize / 2,
        y: obj.y + obj.height - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      br: {
        x: obj.x + obj.width - handleSize / 2,
        y: obj.y + obj.height - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
    };
  } else if (obj.type === 'text') {
    const fontSize = obj.fontSize || 20;
    const width = obj.text.length * (fontSize * 0.6);
    const height = fontSize;
    // Text handles: similar to rect but based on calculated bounds
    // Bounds: x, y-height (top-left), width, height
    const x = obj.x;
    const y = obj.y - height;
    return {
      tl: {
        x: x - handleSize / 2,
        y: y - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      tr: {
        x: x + width - handleSize / 2,
        y: y - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      bl: {
        x: x - handleSize / 2,
        y: y + height - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      br: {
        x: x + width - handleSize / 2,
        y: y + height - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
    };
  } else if (obj.type === 'arrow') {
    return {
      start: {
        x: obj.sx - handleSize / 2,
        y: obj.sy - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
      end: {
        x: obj.ex - handleSize / 2,
        y: obj.ey - handleSize / 2,
        w: handleSize,
        h: handleSize,
      },
    };
  }
  return {};
};

export const isPointInHandle = (x, y, handle) => {
  return (
    x >= handle.x &&
    x <= handle.x + handle.w &&
    y >= handle.y &&
    y <= handle.y + handle.h
  );
};

export const isPointInObject = (x, y, obj) => {
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
      Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) <= radius
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
