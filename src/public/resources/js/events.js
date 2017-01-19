// Edit - mousedown
settings.editCanvas.on("mousedown", function (e) {
    e.preventDefault();

    // Update mouse
    updateMousePosition(e);

    var shape = undefined;

    // Select tool
    if (settings.nextObj === "select") {
        var currShape;
        // Find the shape
        for (var i = settings.shapes.length - 1; 0 <= i && shape === undefined; i--) {

            currShape = settings.shapes[i];

            currShape.draw(settings.editContext);

            //if (currShape.contains(settings.mouseX, settings.mouseY)) {
            if (settings.editContext.isPointInPath(settings.mouseX, settings.mouseY)) {
                shape = currShape;
                settings.selectIndex = i;
                settings.shapes[i] = undefined;
            }

            clearCanvas(settings.editCanvas[0], settings.editContext);
        }

        // Place the shape selected on the edit canvas
        if (shape !== undefined) {
            redraw(settings.viewCanvas[0], settings.viewContext, settings.shapes);
            shape.draw(settings.editContext);

            // Set the cursor
            settings.editCanvas[0].style.cursor = "move";
        }
    }
    // Some shape tool
    else {
        // Set the cursor
        settings.editCanvas[0].style.cursor = "crosshair";

        // Rectangle
        if (settings.nextObj === "rectangle") {
            shape = new Rectangle(settings.mouseX, settings.mouseY, settings.nextColor);
        }
        // Circle
        else if (settings.nextObj === "circle") {
            shape = new Circle(settings.mouseX, settings.mouseY, settings.nextColor);
        }
        // Line
        else if (settings.nextObj === "line") {
            shape = new Line(settings.mouseX, settings.mouseY, settings.nextColor);
        }
    }

    // Assign the current object
    settings.currentObj = shape;
});

// Edit - mousemove
settings.editCanvas.on("mousemove", function (e) {
    e.preventDefault();

    // Check if there is an object
    if (settings.currentObj !== undefined) {

        // Select tool
        if (settings.nextObj === "select") {
            // Old mouse coordinates
            var oldX = settings.mouseX;
            var oldY = settings.mouseY

            // Update mouse
            updateMousePosition(e);

            // Difference of coordinates
            var deltaX = settings.mouseX - oldX;
            var deltaY = settings.mouseY - oldY;

            // Update shape placement
            settings.currentObj.x += deltaX;
            settings.currentObj.y += deltaY;

            // Clear edit canvas
            clearCanvas(settings.editCanvas[0], settings.editContext);

            // Draw the object to the edit canvas
            settings.currentObj.draw(settings.editContext);
        }
        // Some shape tool
        else {
            // Update mouse
            updateMousePosition(e);

            // Clear edit canvas
            clearCanvas(settings.editCanvas[0], settings.editContext);

            // Set the new end position
            settings.currentObj.setEnd(settings.mouseX, settings.mouseY);

            // Draw the object to the edit canvas
            settings.currentObj.draw(settings.editContext);
        }
    }
});

// Edit - mouseup
settings.editCanvas.on("mouseup", function (e) {
    // Reset cursor
    settings.editCanvas[0].style.cursor = "default";

    // Check if there is an object
    if (settings.currentObj !== undefined) {
        // Clear edit canvas
        clearCanvas(settings.editCanvas[0], settings.editContext);

        // Redraw everything if it is select tool
        if (settings.nextObj === "select") {
            // Place the current object back into shapes
            settings.shapes[settings.selectIndex] = settings.currentObj;
            redraw(settings.viewCanvas[0], settings.viewContext, settings.shapes);

            settings.selectIndex = undefined;
        }
        // Draw the object to the view canvas 
        else {

            // Push to shapes
            settings.shapes.push(settings.currentObj);

            settings.currentObj.draw(settings.viewContext);
        }

        // Remove the current object
        settings.currentObj = undefined;

        // Empty redo
        settings.redo = [];
    }
});