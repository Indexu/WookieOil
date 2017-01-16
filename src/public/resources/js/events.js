// Edit - mousedown
settings.editCanvas.on("mousedown", function (e) {

    // Update mouse
    updateMousePosition(e);

    // Set the cursor to something flashy
    settings.editCanvas[0].style.cursor = "crosshair";

    // Create the shape
    var shape = new Rectangle(settings.mouseX, settings.mouseY, settings.nextColor);

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

    // Clear edit canvas
    clearCanvas(settings.editCanvas[0], settings.editContext);

    // Reset cursor
    settings.editCanvas[0].style.cursor = "default";

    // Draw the object to the view canvas
    settings.currentObj.draw(settings.viewContext);

    // Remove the current object
    settings.currentObj = undefined;
});