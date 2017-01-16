// Update mouse coordinates in settings
function updateMousePosition(e) {
    if (e.offsetX) {
        settings.mouseX = e.offsetX;
        settings.mouseY = e.offsetY;
    } else if (e.layerX) {
        settings.mouseX = e.layerX;
        settings.mouseY = e.layerY;
    }
}

// Clear a canvas
function clearCanvas(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Undo
function undo(canvas, context) {
    // Make sure that there is something to undo
    if (settings.undo.length !== 0) {
        // Pop from undo
        var img = settings.undo.pop();

        // Push to redo
        settings.redo.push(img);

        // Display if something to display
        if (settings.undo.length !== 0) {
            var display = settings.undo[settings.undo.length - 1];
            context.putImageData(display, 0, 0);
        }
        // Nothing to display
        else {
            clearCanvas(canvas, context);
        }

    }
}

// Redo
function redo(canvas, context) {
    // Make sure that there is something to redo
    if (settings.redo.length !== 0) {
        // Pop from redo
        var img = settings.redo.pop();

        // Push to undo
        settings.undo.push(img);

        context.putImageData(img, 0, 0);
    }
}