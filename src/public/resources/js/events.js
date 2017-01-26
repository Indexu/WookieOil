// Edit - mousedown
settings.editCanvas.on("mousedown", function (e) {
    e.preventDefault();

    // Prevent a second mouse down from resetting current drawing in progress
    if (settings.currentObj !== undefined) {
        return;
    }

    // Update mouse
    updateMousePosition(e);

    var shape = undefined;

    // Select tool
    if (settings.nextObj === "select" && !settings.moving) {
        // Find if a shape was clicked on
        for (var i = settings.shapes.length - 1; 0 <= i && !settings.moving; i--) {
            settings.shapes[i].draw(settings.editContext);

            var clicked = false;

            // Current shape is text
            if (settings.shapes[i].constructor.name === "Text") {
                var dummyRect = {
                    x1: settings.mouseX,
                    y1: settings.mouseY,
                    x2: settings.mouseX,
                    y2: settings.mouseY
                }

                if (settings.shapes[i].intersects(dummyRect)) {
                    clicked = true;
                }
            }
            // Else
            else if (settings.editContext.isPointInPath(settings.mouseX, settings.mouseY) ||
                (settings.editContext.isPointInStroke(settings.mouseX, settings.mouseY))) {
                clicked = true;
            }

            // Add the shape to the select shapes array and start moving it
            if (clicked) {
                settings.selectedShapeIndexes.push(i);
                settings.moving = true;

                // Set the cursor
                settings.editCanvas[0].style.cursor = "move";
            }

            clearCanvas(settings.editCanvas[0], settings.editContext);
        }

        // No shape was selected => Select rectangle
        if (!settings.moving) {
            shape = new Rectangle(settings.mouseX, settings.mouseY, "black", 1);
        }
    }
    // Some shape tool
    else if (!settings.moving) {
        // Rectangle
        if (settings.nextObj === "rectangle") {
            shape = new Rectangle(settings.mouseX, settings.mouseY, settings.nextColor, settings.strokeSize);
        }
        // Circle
        else if (settings.nextObj === "circle") {
            shape = new Circle(settings.mouseX, settings.mouseY, settings.nextColor, settings.strokeSize);
        }
        // Line
        else if (settings.nextObj === "line") {
            shape = new Line(settings.mouseX, settings.mouseY, settings.nextColor, settings.strokeSize);
        }
        // Pen
        else if (settings.nextObj === "pen") {
            shape = new Pen(settings.mouseX, settings.mouseY, settings.nextColor, settings.strokeSize);
        }
        // Text
        else if (settings.nextObj === "text") {
            showTextarea(e, settings.textarea);
        }
    }

    // Assign the current object
    settings.currentObj = shape;
});

// Edit - mousemove
settings.editCanvas.on("mousemove", function (e) {
    e.preventDefault();

    // Moving objects
    if (settings.moving) {
        // Old mouse coordinates
        var oldX = settings.mouseX;
        var oldY = settings.mouseY;

        // Update mouse
        updateMousePosition(e);

        // Difference of coordinates
        var deltaX = settings.mouseX - oldX;
        var deltaY = settings.mouseY - oldY;

        // Update shape placement
        var index;
        for (var i = 0; i < settings.selectedShapeIndexes.length; i++) {
            index = settings.selectedShapeIndexes[i];
            settings.shapes[index].move(deltaX, deltaY);
        }

        redraw(settings.viewCanvas[0], settings.viewContext, settings.shapes);
    }

    if (settings.nextObj !== "select") {
        // Set the cursor
        settings.editCanvas[0].style.cursor = "crosshair";
    }

    // Check if there is an object to be drawn
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
    // Reset cursor
    settings.editCanvas[0].style.cursor = "crosshair";

    if (settings.moving) {
        settings.selectedShapeIndexes = [];
        settings.moving = false;
    }

    // Check if there is an object
    else if (settings.currentObj !== undefined) {
        // Clear edit canvas
        clearCanvas(settings.editCanvas[0], settings.editContext);

        // Redraw everything if it is select tool
        if (settings.nextObj === "select") {
            // Find out which shapes the select tool intersects with
            for (var i = settings.shapes.length - 1; 0 <= i; i--) {
                if (settings.shapes[i].intersects(settings.currentObj)) {
                    settings.selectedShapeIndexes.push(i);
                    settings.moving = true;
                }
            }

            // Selected object(s)
            if (settings.moving) {
                // Set the cursor
                settings.editCanvas[0].style.cursor = "move";
            }
        }
        // Draw the object to the view canvas 
        else {
            if ((settings.currentObj.x !== settings.mouseX || settings.currentObj.y !== settings.mouseY) ||
                settings.nextObj === "pen") {
                // Push to shapes
                settings.shapes.push(settings.currentObj);

                // Enable undo
                enableUndo(true);

                // Draw to view context
                settings.currentObj.draw(settings.viewContext);
            }
        }

        // Remove the current object
        settings.currentObj = undefined;

        // Empty and disable redo
        settings.redo = [];
        enableRedo(false);
    }
});