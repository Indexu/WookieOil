var settings = {
    viewCanvas: $("#viewCanvas"),
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editCanvas: $("#editCanvas"),
    editContext: $("#editCanvas")[0].getContext("2d"),
    nextObj: "line",
    nextColor: "black",
    currentObj: undefined,
    mouseX: 0,
    mouseY: 0
};
class Shape {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.endX = x;
        this.endY = y;
        this.color = color;
    }
}
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

        // Remove the current object
        settings.currentObj = undefined;
    }
});
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
class Line extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
        context.stroke();
    }
}
class Rectangle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    draw(context) {
        context.strokeRect(this.x, this.y, this.endX - this.x, this.endY - this.y);
    }
}