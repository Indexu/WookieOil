var settings = {
    viewCanvas: $("#viewCanvas"),
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editCanvas: $("#editCanvas"),
    editContext: $("#editCanvas")[0].getContext("2d"),
    nextObj: "rectangle",
    nextColor: "black",
    currentObj: undefined,
    selectIndex: undefined,
    shapes: [],
    redo: [],
    mouseX: 0,
    mouseY: 0
};

// Update object based on selected tool
$("input[name='tool']").change(function () {
    settings.nextObj = $(this).val();
});

// Undo button
$("#undo").on("click", function () {
    undo(settings.viewCanvas[0], settings.viewContext);
});

// Redo button
$("#redo").on("click", function () {
    redo(settings.viewCanvas[0], settings.viewContext);
});
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
        if (shapes[i] !== undefined) {
            shapes[i].draw(context);
        }
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
class Circle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);

        this.step = 0.1;
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        this.radiusX = (this.endX - this.x) * 0.5;
        this.radiusY = (this.endY - this.y) * 0.5;

        this.centerX = this.x + this.radiusX;
        this.centerY = this.y + this.radiusY;
    }

    draw(context) {

        // Reference: K3N @ StackOverflow (http://stackoverflow.com/users/1693593/k3n)
        // http://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events

        context.beginPath();
        context.moveTo(this.endX, this.centerY);

        // Draw a lot of lines in a circle
        for (var i = this.step; i < Math.PI * 2; i += this.step) {
            context.lineTo(this.centerX + (this.radiusX * Math.cos(i)),
                this.centerY + (this.radiusY * Math.sin(i)));
        }

        context.stroke();
    }
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
        context.closePath();
        context.stroke();
    }

    contains(x, y) {
        /*
        var crossproduct = (y - this.y) * (this.endX - this.x) - (x - this.x) * (this.endY - this.y);
        if (Math.abs(crossproduct) !== 0) {
            console.log("CROSS");
            return false;
        }
        */

        var dotproduct = (x - this.x) * (this.endX - this.x) + (y - this.y) * (this.endY - this.y);
        if (dotproduct < 0) {
            console.log("DOT");
            return false;
        }

        var squaredlengthba = (this.endX - this.x) * (this.endX - this.x) + (this.endY - this.y) * (this.endY - this.y);
        if (dotproduct > squaredlengthba) {
            console.log("SQUARE");
            return false;
        }

        return true;
    }
}
class Rectangle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.width = x - this.x;
        this.height = y - this.y;
    }

    draw(context) {
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }

    contains(x, y) {
        return (this.x <= x) && (x <= this.x + this.width) &&
            (this.y <= y) && (y <= this.y + this.height);
    }
}