// Edit - mousedown
settings.editCanvas.on("mousedown", function (e) {

    // Update mouse
    updateMousePosition(e);

    // Set the cursor to something flashy
    settings.editCanvas[0].style.cursor = "crosshair";

    var shape = undefined;

    // Rectangle
    if (settings.nextObj === "rectangle") {
        shape = new Rectangle(settings.mouseX, settings.mouseY, settings.nextColor);
    }
    // Line
    else if (settings.nextObj === "line") {
        shape = new Line(settings.mouseX, settings.mouseY, settings.nextColor);
    }

    // Assign the current object
    settings.currentObj = shape;
});

// Edit - mousemove
settings.editCanvas.on("mousemove", function (e) {
    // Check if there is an object
    if (settings.currentObj !== undefined) {
        // Update mouse
        updateMousePosition(e);

        // Clear edit canvas
        clearCanvas(settings.editCanvas[0], settings.editContext);

        // Set the new end position
        settings.currentObj.setEnd(settings.mouseX, settings.mouseY);

        // Draw the object to the edit canvas
        settings.currentObj.draw(settings.editContext);
    }
});

// Edit - mouseup
settings.editCanvas.on("mouseup", function (e) {
    // Check if there is an object
    if (settings.currentObj !== undefined) {
        // Clear edit canvas
        clearCanvas(settings.editCanvas[0], settings.editContext);

        // Reset cursor
        settings.editCanvas[0].style.cursor = "default";

        // Draw the object to the view canvas
        settings.currentObj.draw(settings.viewContext);

        // Push to shapes
        settings.shapes.push(settings.currentObj);

        // Remove the current object
        settings.currentObj = undefined;

        // Empty redo
        settings.redo = [];
    }
});