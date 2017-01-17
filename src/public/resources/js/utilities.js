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

// Clear and draw the shapes array
function redraw(canvas, context, shapes) {
    // Clear
    clearCanvas(canvas, context);

    // Draw everything in shapes
    for (var i = 0; i < shapes.length; i++) {
        shapes[i].draw(context);
    }
}

// Undo
function undo(canvas, context) {
    // Make sure that there is something to undo
    if (settings.shapes.length !== 0) {
        // Pop from shapes
        var shape = settings.shapes.pop();

        // Push to redo
        settings.redo.push(shape);

        // Re-draw image
        redraw(canvas, context, settings.shapes);

    }
}

// Redo
function redo(canvas, context) {
    // Make sure that there is something to redo
    if (settings.redo.length !== 0) {
        // Pop from redo
        var shape = settings.redo.pop();

        // Push to undo
        settings.shapes.push(shape);

        // Re-draw image
        redraw(canvas, context, settings.shapes);
    }
}