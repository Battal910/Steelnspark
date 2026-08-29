const canvas = document.querySelector('#design-canvas');
const context = canvas.getContext('2d');
const toolButtons = document.querySelectorAll('.tool-button');
const colourInput = document.querySelector('#ink-colour');
const strokeInput = document.querySelector('#stroke-width');
const strokeValue = document.querySelector('#stroke-value');
const undoButton = document.querySelector('#undo-button');
const clearButton = document.querySelector('#clear-button');
const gridButton = document.querySelector('#grid-button');
const exportButton = document.querySelector('#export-button');
const quoteButton = document.querySelector('#quote-button');
const emptyMessage = document.querySelector('#canvas-empty');
const objectCount = document.querySelector('#object-count');
const designStatus = document.querySelector('#design-status');

let activeTool = 'pen';
let isDrawing = false;
let startPoint = null;
let previousPoint = null;
let showGrid = true;
let marks = [];
let history = [];

const redraw = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0b0c0a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (showGrid) {
    context.strokeStyle = 'rgba(255, 224, 0, .08)';
    context.lineWidth = 1;
    for (let x = 40; x < canvas.width; x += 40) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
    for (let y = 40; y < canvas.height; y += 40) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); }
  }
  marks.forEach((mark) => drawMark(mark));
  emptyMessage.classList.toggle('is-hidden', marks.length > 0);
  objectCount.textContent = `${marks.length} ${marks.length === 1 ? 'mark' : 'marks'}`;
  designStatus.textContent = `READY / ${String(marks.length + 1).padStart(2, '0')}`;
};

const drawMark = (mark) => {
  context.strokeStyle = mark.colour;
  context.fillStyle = mark.colour;
  context.lineWidth = mark.width;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  if (mark.tool === 'pen' || mark.tool === 'line') {
    context.beginPath();
    context.moveTo(mark.points[0].x, mark.points[0].y);
    mark.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.stroke();
  } else if (mark.tool === 'rect') {
    context.strokeRect(mark.x, mark.y, mark.width, mark.height);
  } else if (mark.tool === 'circle') {
    context.beginPath();
    context.arc(mark.x, mark.y, mark.radius, 0, Math.PI * 2);
    context.stroke();
  } else if (mark.tool === 'text') {
    context.font = `500 ${Math.max(18, mark.width * 5)}px Space Grotesk, sans-serif`;
    context.fillText(mark.text, mark.x, mark.y);
  }
};

const pointerPosition = (event) => {
  const bounds = canvas.getBoundingClientRect();
  return { x: (event.clientX - bounds.left) * (canvas.width / bounds.width), y: (event.clientY - bounds.top) * (canvas.height / bounds.height) };
};

const saveHistory = () => { history.push(JSON.stringify(marks)); if (history.length > 30) history.shift(); };
const finishMark = (mark) => { marks.push(mark); redraw(); };

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  isDrawing = true;
  startPoint = pointerPosition(event);
  previousPoint = startPoint;
  if (activeTool === 'pen') { saveHistory(); marks.push({ tool: 'pen', colour: colourInput.value, width: Number(strokeInput.value), points: [startPoint] }); }
});

canvas.addEventListener('pointermove', (event) => {
  if (!isDrawing) return;
  const point = pointerPosition(event);
  if (activeTool === 'pen') { marks[marks.length - 1].points.push(point); redraw(); }
  previousPoint = point;
});

canvas.addEventListener('pointerup', (event) => {
  if (!isDrawing) return;
  const endPoint = pointerPosition(event);
  isDrawing = false;
  if (activeTool !== 'pen') {
    saveHistory();
    if (activeTool === 'line') finishMark({ tool: 'line', colour: colourInput.value, width: Number(strokeInput.value), points: [startPoint, endPoint] });
    if (activeTool === 'rect') finishMark({ tool: 'rect', colour: colourInput.value, width: Number(strokeInput.value), x: startPoint.x, y: startPoint.y, width: endPoint.x - startPoint.x, height: endPoint.y - startPoint.y });
    if (activeTool === 'circle') finishMark({ tool: 'circle', colour: colourInput.value, width: Number(strokeInput.value), x: startPoint.x, y: startPoint.y, radius: Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y) });
    if (activeTool === 'text') { const text = window.prompt('What should this sketch say?'); if (text) finishMark({ tool: 'text', colour: colourInput.value, width: Number(strokeInput.value), x: startPoint.x, y: startPoint.y, text }); }
  }
  redraw();
});

toolButtons.forEach((button) => button.addEventListener('click', () => { activeTool = button.dataset.tool; toolButtons.forEach((item) => item.classList.toggle('active', item === button)); }));
strokeInput.addEventListener('input', () => { strokeValue.value = strokeInput.value; strokeValue.textContent = strokeInput.value; });
undoButton.addEventListener('click', () => { if (!history.length) return; marks = JSON.parse(history.pop()); redraw(); });
clearButton.addEventListener('click', () => { if (!marks.length) return; saveHistory(); marks = []; redraw(); });
gridButton.addEventListener('click', () => { showGrid = !showGrid; gridButton.textContent = showGrid ? 'Grid on' : 'Grid off'; gridButton.setAttribute('aria-pressed', String(showGrid)); redraw(); });
exportButton.addEventListener('click', () => { const link = document.createElement('a'); link.download = 'steel-and-spark-sketch.png'; link.href = canvas.toDataURL('image/png'); link.click(); });
quoteButton.addEventListener('click', () => { quoteButton.href = `mailto:hello@steelnspark.co.uk?subject=My%20Steel%20%26%20Spark%20sketch&body=I%20have%20created%20a%20custom%20sketch%20with%20${marks.length}%20marks.%20I%20will%20attach%20the%20downloaded%20sketch%20to%20this%20email.`; });

redraw();
