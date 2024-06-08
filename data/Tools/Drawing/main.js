window.onload = function() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let currentColor = 'black';
    let currentSize = 5;
    let tool = 'pen';
    let startX, startY;
    let undoStack = [];
    let redoStack = [];

    function saveState() {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        redoStack = []; // Clear redo stack on new action
    }

    function undo() {
        if (undoStack.length > 0) {
            redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            const imageData = undoStack.pop();
            ctx.putImageData(imageData, 0, 0);
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            const imageData = redoStack.pop();
            ctx.putImageData(imageData, 0, 0);
        }
    }

    function updateCursor() {
        if (tool === 'pen') {
            canvas.classList.add('pen-cursor');
            canvas.classList.remove('bucket-cursor');
        } else if (tool === 'bucket') {
            canvas.classList.add('bucket-cursor');
            canvas.classList.remove('pen-cursor');
        } else {
            canvas.classList.remove('pen-cursor');
            canvas.classList.remove('bucket-cursor');
        }
    }

    document.querySelectorAll('.color').forEach(color => {
        color.addEventListener('click', function() {
            currentColor = this.getAttribute('data-color');
            updateSelectedColor(this);
        });
    });

    document.querySelectorAll('.tint').forEach(tint => {
        tint.addEventListener('click', function() {
            currentColor = this.style.backgroundColor;
            const parentColor = this.parentNode.querySelector('.color');
            parentColor.setAttribute('data-color', currentColor);
            updateSelectedColor(parentColor);
        });
    });

    function updateSelectedColor(selectedColorDiv) {
        document.querySelectorAll('.color, .tint').forEach(div => {
            div.classList.remove('selected');
        });
        selectedColorDiv.classList.add('selected');
    }

    document.getElementById('penSize').addEventListener('input', function() {
        currentSize = this.value;
        document.getElementById('penSizeValue').innerText = this.value;
    });

    document.getElementById('clearButton').addEventListener('click', function() {
        saveState();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById('bucketButton').addEventListener('click', function() {
        tool = 'bucket';
        updateCursor();
    });

    document.getElementById('penButton').addEventListener('click', function() {
        tool = 'pen';
        updateCursor();
    });

    document.getElementById('eraserButton').addEventListener('click', function() {
        tool = 'eraser';
        updateCursor();
    });

    document.getElementById('rectButton').addEventListener('click', function() {
        tool = 'rect';
        updateCursor();
    });

    document.getElementById('circleButton').addEventListener('click', function() {
        tool = 'circle';
        updateCursor();
    });

    document.getElementById('lineButton').addEventListener('click', function() {
        tool = 'line';
        updateCursor();
    });

    document.getElementById('arrowButton').addEventListener('click', function() {
        tool = 'arrow';
        updateCursor();
    });

    document.getElementById('saveButton').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    document.getElementById('loadButton').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const img = new Image();
            const reader = new FileReader();
            reader.onload = function(evt) {
                img.src = evt.target.result;
                img.onload = function() {
                    saveState();
                    fitCanvasToImage(img);
                };
            };
            reader.readAsDataURL(file);
        }
    });

    function fitCanvasToImage(img) {
        const aspectRatio = img.width / img.height;
        let newWidth, newHeight;

        if (aspectRatio > 1) {
            newWidth = canvas.width;
            newHeight = newWidth / aspectRatio;
        } else {
            newHeight = canvas.height;
            newWidth = newHeight * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
    }

    document.getElementById('undoButton').addEventListener('click', function() {
        undo();
    });

    document.getElementById('redoButton').addEventListener('click', function() {
        redo();
    });

    canvas.addEventListener('mousedown', function(e) {
        saveState();
        if (tool === 'pen' || tool === 'eraser') {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
            ctx.strokeStyle = tool === 'eraser' ? 'white' : currentColor;
            ctx.lineWidth = currentSize;
        } else if (tool === 'bucket') {
            const x = e.offsetX;
            const y = e.offsetY;
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const startColor = getColorAtPixel(imageData, x, y);
            const targetColor = hexToRgb(currentColor);
            if (!colorsMatch(startColor, targetColor)) {
                floodFill(imageData, x, y, startColor, targetColor);
                ctx.putImageData(imageData, 0, 0);
            }
        } else if (tool === 'rect' || tool === 'circle' || tool === 'line' || tool === 'arrow') {
            drawing = true;
            startX = e.offsetX;
            startY = e.offsetY;
        }
    });

    canvas.addEventListener('mousemove', function(e) {
        if (drawing && (tool === 'rect' || tool === 'circle' || tool === 'line' || tool === 'arrow')) {
            ctx.putImageData(undoStack[undoStack.length - 1], 0, 0); // Restore the previous state
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = currentSize;
            if (tool === 'rect') {
                ctx.strokeRect(startX, startY, width, height);
            } else if (tool === 'circle') {
                ctx.beginPath();
                ctx.ellipse(startX, startY, Math.abs(width), Math.abs(height), 0, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (tool === 'line') {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
            } else if (tool === 'arrow') {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
                drawArrowhead(ctx, startX, startY, e.offsetX, e.offsetY);
            }
        } else if (drawing && (tool === 'pen' || tool === 'eraser')) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', function() {
        drawing = false;
        ctx.closePath();
    });

    canvas.addEventListener('mouseout', function() {
        drawing = false;
    });

    function getColorAtPixel(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return [
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ];
    }

    function colorsMatch(a, b, tolerance = 50) {
        return Math.abs(a[0] - b[0]) <= tolerance &&
               Math.abs(a[1] - b[1]) <= tolerance &&
               Math.abs(a[2] - b[2]) <= tolerance &&
               Math.abs(a[3] - b[3]) <= tolerance;
    }

    function floodFill(imageData, x, y, startColor, targetColor) {
        const stack = [[x, y]];
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const currentColor = getColorAtPixel(imageData, cx, cy);
            if (colorsMatch(currentColor, startColor)) {
                setColorAtPixel(imageData, cx, cy, targetColor);
                if (cx > 0) stack.push([cx - 1, cy]);
                if (cx < imageData.width - 1) stack.push([cx + 1, cy]);
                if (cy > 0) stack.push([cx, cy - 1]);
                if (cy < imageData.height - 1) stack.push([cx, cy + 1]);
            }
        }
    }

    function setColorAtPixel(imageData, x, y, color) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color[0];
        imageData.data[index + 1] = color[1];
        imageData.data[index + 2] = color[2];
        imageData.data[index + 3] = 255;  // Fully opaque
    }

    function hexToRgb(hex) {
        if (hex.startsWith('rgb')) {
            const rgbValues = hex.match(/\d+/g);
            return [parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2]), 255];
        } else {
            const bigint = parseInt(hex.slice(1), 16);
            return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255, 255];
        }
    }

    function drawArrowhead(ctx, fromX, fromY, toX, toY) {
        const headlen = 10; // length of head in pixels
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
};
