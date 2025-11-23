import { getResizeHandles } from './shapeUtils';

export const drawShape = (
  ctx,
  obj,
  index,
  editingIndex,
  selectedObjectIndex
) => {
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
      ctx.strokeRect(obj.x - 5, obj.y - 5, obj.width + 10, obj.height + 10);
    } else if (obj.type === 'text') {
      const fontSize = obj.fontSize || 20;
      const width = obj.text.length * (fontSize * 0.6);
      const height = fontSize;
      ctx.strokeRect(obj.x - 5, obj.y - height - 5, width + 10, height + 10);
    } else if (obj.type === 'arrow') {
      // Arrow selection is just handles usually, but let's keep dashed line if needed?
      // Actually arrow selection box is tricky. Let's rely on handles.
    } else if (obj.type === 'pen') {
      // Bounding box for pen? Too expensive to calc every frame?
      // Just highlight start/end for now or skip
    }
    ctx.restore();

    // Draw resize handles
    const handles = getResizeHandles(obj);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    Object.values(handles).forEach((handle) => {
      ctx.beginPath();
      ctx.rect(handle.x, handle.y, handle.w, handle.h);
      ctx.fill();
      ctx.stroke();
    });
  }
};
