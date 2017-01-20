var settings = {
    viewCanvas: $("#viewCanvas"),
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editCanvas: $("#editCanvas"),
    editContext: $("#editCanvas")[0].getContext("2d"),
    nextObj: "rectangle",
    nextColor: "black",
    currentObj: undefined,
    //selectIndex: undefined,
    selectedShapeIndexes: [],
    moving: false,
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
    if (settings.nextObj === "select" && !settings.moving) {
        // Find if a shape was clicked on
        for (var i = settings.shapes.length - 1; 0 <= i && !settings.moving; i--) {
            settings.shapes[i].draw(settings.editContext);

            if (settings.editContext.isPointInPath(settings.mouseX, settings.mouseY) ||
                (settings.editContext.isPointInStroke(settings.mouseX, settings.mouseY))) {
                settings.selectedShapeIndexes.push(i);
                settings.moving = true;

                // Set the cursor
                settings.editCanvas[0].style.cursor = "move";
            }

            clearCanvas(settings.editCanvas[0], settings.editContext);
        }

        // No shape was selected => Select rectangle
        if (!settings.moving) {
            shape = new Rectangle(settings.mouseX, settings.mouseY, settings.nextColor);
        }
    }
    // Some shape tool
    else if (!settings.moving) {
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

    // Moving objects
    if (settings.moving) {
        // Old mouse coordinates
        var oldX = settings.mouseX;
        var oldY = settings.mouseY

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
        //}
    }
});

// Edit - mouseup
settings.editCanvas.on("mouseup", function (e) {
    // Reset cursor
    settings.editCanvas[0].style.cursor = "default";

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

// Line segment intersection check
// Reference: Joncom @ GitHub (https://gist.github.com/Joncom)
// https://gist.github.com/Joncom/e8e8d18ebe7fe55c3894
function linesIntersect(line1, line2) {
    var line1DeltaX, line1DeltaY, line2DeltaX, line2DeltaY;
    line1DeltaX = line1.x2 - line1.x1;
    line1DeltaY = line1.y2 - line1.y1;
    line2DeltaX = line2.x2 - line2.x1;
    line2DeltaY = line2.y2 - line2.y1;

    var s, t;
    s = (-line1DeltaY * (line1.x1 - line2.x1) + line1DeltaX * (line1.y1 - line2.y1)) / (-line2DeltaX * line1DeltaY + line1DeltaX * line2DeltaY);
    t = (line2DeltaX * (line1.y1 - line2.y1) - line2DeltaY * (line1.x1 - line2.x1)) / (-line2DeltaX * line1DeltaY + line1DeltaX * line2DeltaY);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
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

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX = deltaX;
        this.endY = deltaY;

        this.centerX = deltaX;
        this.centerY = deltaY;
    }

    draw(context) {

        // Reference: Richard @ StackOverflow (http://stackoverflow.com/users/4506995/richard)
        // http://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events

        //Save
        context.save();
        context.beginPath();

        //Dynamic scaling
        var scalex = 1 * ((this.endX - this.x) / 2);
        var scaley = 1 * ((this.endY - this.y) / 2);
        context.scale(scalex, scaley);

        //Create ellipse
        var centerx = (this.x / scalex) + 1;
        var centery = (this.y / scaley) + 1;
        context.arc(centerx, centery, 1, 0, 2 * Math.PI);

        //Restore and draw
        context.restore();
        context.stroke();
    }

    intersects(rect) {
        var distX = Math.abs(this.centerX - (rect.x1 - rect.width / 2));
        var distY = Math.abs(this.centerY - (rect.y1 - rect.height / 2));

        if (distX > (rect.width / 2 + circle.r)) {
            return false;
        }
        if (distY > (rect.height / 2 + circle.r)) {
            return false;
        }
    }
}
class Line extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        /*
        this.x1 = this.x;
        this.x2 = x;
        if (x < this.x) {
            this.x1 -= Math.abs(this.width);
            this.x2 += Math.abs(this.width);
        }

        this.y1 = this.y;
        this.y2 = y;
        */
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX += deltaX;
        this.endY += deltaY;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
        context.closePath();
        context.stroke();
    }

    intersects(rect) {
        // If the line is completely within the rectangle
        if ((rect.x1 <= this.x && this.x <= rect.x2 && rect.y1 <= this.y && this.y <= rect.y2) &&
            ((rect.x1 <= this.endX && this.endX <= rect.x2 && rect.y1 <= this.endY && this.endY <= rect.y2))) {
            return true;
        }

        // This line
        var line = {
            x1: this.x,
            y1: this.y,
            x2: this.endX,
            y2: this.endY
        };

        // Rect upper line
        var upperLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y1
        };
        if (linesIntersect(line, upperLine)) {
            return true;
        }

        // Rect bottom line
        var bottomLine = {
            x1: rect.x1,
            y1: rect.y2,
            x2: rect.x2,
            y2: rect.y2
        };
        if (linesIntersect(line, bottomLine)) {
            return true;
        }

        // Rect left line
        var leftLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x1,
            y2: rect.y2
        };
        if (linesIntersect(line, leftLine)) {
            return true;
        }

        // Rect right line
        var rightLine = {
            x1: rect.x2,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y2
        };
        return linesIntersect(line, rightLine);
    }
}
class Rectangle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        this.width = x - this.x;
        this.height = y - this.y;

        // The following is used for intersection calculation
        this.x1 = this.x;
        this.x2 = x;
        if (x < this.x) {
            this.x1 -= Math.abs(this.width);
            this.x2 += Math.abs(this.width);
        }

        this.y1 = this.y;
        this.y2 = y;
        if (y < this.y) {
            this.y1 -= Math.abs(this.height);
            this.y2 += Math.abs(this.height);
        }
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.x1 += deltaX;
        this.y1 += deltaY;

        this.x2 += deltaX;
        this.y2 += deltaY;
    }

    draw(context) {
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }

    intersects(rect) {
        if (rect.x1 < this.x2 && rect.x2 > this.x1 && rect.y1 < this.y2 && rect.y2 > this.y1) {
            return true;
        }

        return false;
    }
}