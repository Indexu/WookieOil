// Settings variable
var settings = {
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editContext: $("#editCanvas")[0].getContext("2d"),
    textarea: $("#textArea"),
    savesList: $("#saves"),
    fontSize: 36,
    font: "roboto",
    strokeSize: 8,
    nextObj: "pen",
    nextColor: "black",
    currentObj: undefined,
    selectedShapeIndexes: [],
    moving: false,
    shapes: [],
    redo: [],
    mouseX: 0,
    mouseY: 0
};

// Initialize stuff
$(document).ready(function () {
    // Materialize Select
    $("#fontType").material_select();

    // Materialize Modals
    $(".modal").modal();

    // Materialize Tooltips
    $(".tooltipped").tooltip({
        delay: 50
    });

    // Minicolors Colorpicker
    $("#colorPicker").minicolors();

    // Resize the canvases
    resize();

    // Populate saves
    populateSaves();
});
class Shape {
    constructor(x, y, color, identifier, strokeSize = undefined) {
        this.x = x;
        this.y = y;
        this.endX = x;
        this.endY = y;
        this.color = color;
        this.identifier = identifier;
        this.strokeSize = strokeSize;
    }

    // Override every value in this object with the values of obj
    // Reference: Oliver Moran @ StackOverflow (http://stackoverflow.com/users/681800/oliver-moran)
    // http://stackoverflow.com/questions/5873624/parse-json-string-into-a-particular-object-prototype-in-javascript
    override(obj) {
        for (var prop in obj) {
            this[prop] = obj[prop];
        }
    }
}
// Update mouse coordinates in settings
function updateMousePosition(e) {

    var rect = settings.viewContext.canvas.getBoundingClientRect();

    settings.mouseX = e.clientX - rect.left;
    settings.mouseY = e.clientY - rect.top;
}

// Resize the canvases
function resize() {
    var containerWidth = $(".canvasContainer").width();

    settings.viewContext.canvas.width = containerWidth;
    settings.editContext.canvas.width = containerWidth;

    redraw(settings.viewContext, settings.shapes);
}

// Clear a canvas
function clearCanvas(context) {
    var canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Clear and draw the shapes array
function redraw(context, shapes) {
    // Clear
    clearCanvas(context);

    // Draw everything in shapes
    for (var i = 0; i < shapes.length; i++) {
        if (shapes[i] !== undefined) {
            shapes[i].draw(context);
        }
    }
}

// Undo
function undo(context) {
    // Make sure that there is something to undo
    if (settings.shapes.length !== 0) {
        // Enable redo button
        enableRedo(true);

        // Pop from shapes
        var shape = settings.shapes.pop();

        // Push to redo
        settings.redo.push(shape);

        // Re-draw image
        redraw(context, settings.shapes);

        // Disable button if nothing to undo
        if (settings.shapes.length === 0) {
            enableUndo(false);
        }
    }
}

// Enable / disable undo button
function enableUndo(enable) {
    if (enable) {
        $("#undo").removeClass("disabled");
    } else {
        $("#undo").addClass("disabled");
    }
}

// Redo
function redo(context) {
    // Make sure that there is something to redo
    if (settings.redo.length !== 0) {
        // Enable undo button
        enableUndo(true);

        // Pop from redo
        var shape = settings.redo.pop();

        // Push to undo
        settings.shapes.push(shape);

        // Re-draw image
        redraw(context, settings.shapes);

        // Disable button if nothing to undo
        if (settings.redo.length === 0) {
            enableRedo(false);
        }
    }
}

// Enable / disable redo button
function enableRedo(enable) {
    if (enable) {
        $("#redo").removeClass("disabled");
    } else {
        $("#redo").addClass("disabled");
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

// Rectangle intersection check
function rectsIntersect(rect1, rect2) {
    return (rect1.x1 < rect2.x2 && rect2.x1 < rect1.x2 && rect1.y1 < rect2.y2 && rect2.y1 < rect1.y2);
}

// Rectangle cover check
// Check if rect1 covers all of rect2
function rectCover(rect1, rect2) {
    // Check if the start point and end point of rect2 are within rect1
    // Using an if statement for readability
    if ((rect1.x1 <= rect2.x1 && rect2.x1 <= rect1.x2) && (rect1.y1 <= rect2.y1 && rect2.y1 <= rect1.y2) &&
        (rect1.x1 <= rect2.x2 && rect2.x2 <= rect1.x2) && (rect1.y1 <= rect2.y2 && rect2.y2 <= rect1.y2)) {
        return true;
    }

    return false;
}

// Place the textarea at mouse click on canvas
function showTextarea(e, textarea) {
    var x = e.clientX;
    var y = e.clientY;

    textarea.show();

    textarea.css({
        top: (y - 13.5) + "px",
        left: (x - 2.55) + "px"
    });

    textarea.focus();
}

// Hide and reset textarea
function hideTextarea() {
    settings.textarea.hide();
    settings.textarea.val("");
}

// Populate saves list
function populateSaves() {
    $.ajax({
        type: "GET",
        url: "/api/drawings",
        dataType: "json",
        success: function (data) {
            if (data.length !== 0) {
                // Clear list
                settings.savesList.html("");
                console.log(data);
                // Loop over saves and append
                for (var i = data.length - 1; 0 <= i; i--) {
                    var save = data[i];

                    // Extract the date and time from the created string
                    var time = save.created.split(".")[0].split("T");
                    var date = time[0];
                    time = time[1];

                    var item = "<a href=\"#!\" class=\"collection-item save\" data-id=" + save.id + "><span>" + save.title + "</span><span class=\"right\">" + date + " " + time + "</span></a>";
                    settings.savesList.append(item);
                }
            }

        },
        failure: function (errMsg) {
            console.log(errMsg);
        }
    });
}
class Circle extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, "circle", strokeSize);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        this.radiusX = (this.endX - this.x) * 0.5;
        this.radiusY = (this.endY - this.y) * 0.5;

        this.centerX = this.x + this.radiusX;
        this.centerY = this.y + this.radiusY;

        // The following is used for intersection calculation
        this.x1 = this.x;
        this.x2 = x;
        if (x < this.x) {
            this.x1 -= Math.abs(x - this.x);
            this.x2 += Math.abs(x - this.x);
        }

        this.y1 = this.y;
        this.y2 = y;
        if (y < this.y) {
            this.y1 -= Math.abs(y - this.y);
            this.y2 += Math.abs(y - this.y);
        }
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX += deltaX;
        this.endY += deltaY;

        this.centerX += deltaX;
        this.centerY += deltaY;

        this.x1 += deltaX;
        this.y1 += deltaY;

        this.x2 += deltaX;
        this.y2 += deltaY;
    }

    draw(context) {

        // Reference: Richard @ StackOverflow (http://stackoverflow.com/users/4506995/richard)
        // http://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events

        // Save
        context.save();
        context.beginPath();

        // Dynamic scaling
        var scaleX = 1 * ((this.endX - this.x) / 2);
        var scaleY = 1 * ((this.endY - this.y) / 2);
        context.scale(scaleX, scaleY);

        // Create ellipse
        var centerx = (this.x / scaleX) + 1;
        var centery = (this.y / scaleY) + 1;
        context.arc(centerx, centery, 1, 0, 2 * Math.PI);

        // Restore and draw
        context.restore();
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;
        context.stroke();
    }

    intersects(rect) {

        // Information source: http://gamedev.stackexchange.com/questions/109393/how-do-i-check-for-collision-between-an-ellipse-and-a-rectangle
        // Vertex within a ellipse formula: http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse

        // Make sure that the rect intersects with the bounding box of the ellipse
        // in order to have a chance of intersecting with the ellipse itself
        if (!rectsIntersect(rect, this)) {
            return false;
        }

        if (rectCover(rect, this)) {
            return true;
        }

        // Check if rect intersects with the x and y axis of the ellipse
        // If so, the rect intersects with the ellipse
        // X-axis
        var axisX = {
            x1: this.centerX,
            y1: this.centerY - this.radiusY,
            x2: this.centerX,
            y2: this.centerY + this.radiusY
        };
        // Y-axis
        var axisY = {
            x1: this.centerX - this.radiusX,
            y1: this.centerY,
            x2: this.centerX + this.radiusX,
            y2: this.centerY
        };

        // Rect upper line
        var upperLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y1
        };
        if (linesIntersect(axisX, upperLine) || linesIntersect(axisY, upperLine)) {
            return true;
        }

        // Rect bottom line
        var bottomLine = {
            x1: rect.x1,
            y1: rect.y2,
            x2: rect.x2,
            y2: rect.y2
        };
        if (linesIntersect(axisX, bottomLine) || linesIntersect(axisY, bottomLine)) {
            return true;
        }

        // Rect left line
        var leftLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x1,
            y2: rect.y2
        };
        if (linesIntersect(axisX, leftLine) || linesIntersect(axisY, leftLine)) {
            return true;
        }

        // Rect right line
        var rightLine = {
            x1: rect.x2,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y2
        };
        if (linesIntersect(axisX, rightLine) || linesIntersect(axisY, rightLine)) {
            return true;
        }

        // Find the corner of the rect that is closest to the center of the ellipse
        // and check if it resides within the ellipse

        var corners = {
            upperLeft: {
                x: rect.x1,
                y: rect.y1
            },
            upperRight: {
                x: rect.x2,
                y: rect.y1
            },
            lowerLeft: {
                x: rect.x1,
                y: rect.y2
            },
            lowerRight: {
                x: rect.x2,
                y: rect.y2
            }
        };

        var closestCorner = undefined;
        var closestDist = Number.POSITIVE_INFINITY;

        for (var key in corners) {
            if (corners.hasOwnProperty(key)) {
                var currentCorner = corners[key];
                // Get euclidean distance
                var dist = Math.sqrt(Math.pow(currentCorner.x - this.centerX, 2) + Math.pow(currentCorner.y - this.centerY, 2));

                // Check if lower than current lowest
                if (dist < closestDist) {
                    closestDist = dist;
                    closestCorner = currentCorner;
                }
            }
        }

        // Left hand side
        var lhs = (Math.pow(closestCorner.x - this.centerX, 2)) / Math.pow(this.radiusX, 2);
        // Right hand side
        var rhs = (Math.pow(closestCorner.y - this.centerY, 2)) / Math.pow(this.radiusY, 2);

        return ((lhs + rhs) <= 1);
    }
}
class Line extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, "line", strokeSize);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX += deltaX;
        this.endY += deltaY;
    }

    draw(context) {
        context.beginPath();
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;
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
class Pen extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, "pen", strokeSize);

        this.points = [{
            x: x,
            y: y
        }];

        this.rightmostX = x;
        this.leftmostX = x;
        this.uppermostY = y;
        this.lowermostY = y;
    }

    setEnd(x, y) {
        this.points.push({
            x: x,
            y: y
        });

        // Check if the new point is expanding the boundary box
        if (x < this.leftmostX) {
            this.leftmostX = x;
        }

        if (this.rightmostX < x) {
            this.rightmostX = x;
        }

        if (y < this.uppermostY) {
            this.uppermostY = y;
        }

        if (this.lowermostY < y) {
            this.lowermostY = y;
        }
    }

    move(deltaX, deltaY) {
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].x += deltaX;
            this.points[i].y += deltaY;
        }

        this.rightmostX += deltaX;
        this.leftmostX += deltaX;
        this.uppermostY += deltaY;
        this.lowermostY += deltaY;
    }

    draw(context) {
        // Smooth curve thanks to Homan @ StackOverflow (http://stackoverflow.com/users/793454/homan)
        // http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas/

        context.beginPath();

        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;

        // Only a single point
        if (this.points.length === 1) {
            context.rect(this.points[0].x, this.points[0].y, 1, 1);
        }
        // More than one point
        else {
            context.moveTo(this.points[0].x, this.points[0].y);

            // Loop if more than 2 points
            if (2 < this.points.length) {
                var i = 1;

                for (; i < this.points.length - 2; i++) {
                    var endX = (this.points[i].x + this.points[i + 1].x) / 2;
                    var endY = (this.points[i].y + this.points[i + 1].y) / 2;

                    context.quadraticCurveTo(this.points[i].x, this.points[i].y, endX, endY);
                }

                // For the last 2 points
                context.quadraticCurveTo(
                    this.points[i].x,
                    this.points[i].y,
                    this.points[i + 1].x,
                    this.points[i + 1].y
                );
            }
            // Simply bind together if 2 points 
            else {
                context.quadraticCurveTo(
                    this.points[0].x,
                    this.points[0].y,
                    this.points[1].x,
                    this.points[1].y
                );
            }
        }

        context.stroke();
    }

    intersects(rect) {
        // Check the boundary box to see if there is a chance of intersection
        var boundaryBox = {
            x1: this.leftmostX,
            y1: this.uppermostY,
            x2: this.rightmostX,
            y2: this.lowermostY
        }

        return rectsIntersect(rect, boundaryBox);
    }
}
class Rectangle extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, "rectangle", strokeSize);
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
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }

    intersects(rect) {
        return rectsIntersect(rect, this);
    }
}
class Text extends Shape {
    constructor(x, y, color, text, font, px, context) {
        super(x, y, color, "text");

        context.font = font;

        this.text = text;
        this.font = font;
        this.height = px;
        this.width = context.measureText(text).width;

        this.x1 = x;
        this.y1 = y - this.height;

        this.x2 = x + this.width;
        this.y2 = y;
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
        context.font = this.font;
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y);
    }

    intersects(rect) {
        return rectsIntersect(rect, this);
    }
}
// ======================
// ======= Events =======
// ======================
// Edit - mousedown
$("#editCanvas").on("mousedown", function (e) {
    e.preventDefault();
    mouseDown(e);
});

// Edit - mousemove
$("#editCanvas").on("mousemove", function (e) {
    e.preventDefault();
    mouseMove(e);
});

// Edit - mouseup
$("#editCanvas").on("mouseup", function (e) {
    mouseUp();
});

// =========================
// ======= Functions =======
// =========================
function mouseDown(e) {
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
                settings.editContext.canvas.style.cursor = "move";
            }

            // Clear the edit canvas
            clearCanvas(settings.editContext);
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
}

function mouseMove(e) {
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

        redraw(settings.viewContext, settings.shapes);
    }

    if (settings.nextObj !== "select") {
        // Set the cursor
        settings.editContext.canvas.style.cursor = "crosshair";
    }

    // Check if there is an object to be drawn
    if (settings.currentObj !== undefined) {
        // Update mouse
        updateMousePosition(e);

        // Clear edit canvas
        clearCanvas(settings.editContext);

        // Set the new end position
        settings.currentObj.setEnd(settings.mouseX, settings.mouseY);

        // Draw the object to the edit canvas
        settings.currentObj.draw(settings.editContext);
    }
}

function mouseUp() {
    // Reset cursor
    settings.editContext.canvas.style.cursor = "crosshair";

    if (settings.moving) {
        settings.selectedShapeIndexes = [];
        settings.moving = false;
    }

    // Check if there is an object
    else if (settings.currentObj !== undefined) {
        // Clear edit canvas
        clearCanvas(settings.editContext);

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
                settings.editContext.canvas.style.cursor = "move";
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
}
// ======================
// ======= Events =======
// ======================
// Resize the canvas width dynamically
$(window).on("resize", function () {
    resize();
});

// Update object based on selected tool
$(".tool").on("click", function (e) {
    e.preventDefault();
    changeTool(this);
});

// Download button
$("#downloadButton").on("click", function () {
    download(this);
});

// Undo button
$("#undo").on("click", function () {
    undo(settings.viewContext);
});

// Redo button
$("#redo").on("click", function () {
    redo(settings.viewContext);
});

// Color change
$("#colorPicker").on("change", function () {
    settings.nextColor = $(this).val();
});

// Stroke size
$("#strokeSize").on("change", function () {
    settings.strokeSize = $(this).val();
});

// Font size
$("#fontSize").on("change", function () {
    settings.fontSize = $(this).val();
});

// Font change
$("#fontType").on("change", function () {
    setFont($(this).val());
});

// Save name input
$("#saveName").on("input", function () {
    checkSaveName($(this).val());
});

// Save name enter key
$("#saveName").on("keyup", function (e) {
    saveEnter(e);
});

// Click on a save
$(document).on("click", ".save", function () {
    selectSave(this);
});

// Hide textbox when clicked outside
$(document).on("mouseup", function (e) {
    checkClickOutsideTextarea(e);
});

// Textarea enter key
$("#textArea").on("keyup", function (e) {
    handleTextarea(e);
});

// Click on save button
$("#saveButton").on("click", function () {
    save();
});

// Click on load button
$("#loadButton").on("click", function () {
    load();
});

// =========================
// ======= Functions =======
// =========================
function changeTool(tool) {
    settings.nextObj = $(tool).attr("data-value");

    // Change color of button
    $(".tool:not(.light-blue accent-1)").addClass("light-blue accent-1");
    $(tool).removeClass("light-blue accent-1");
}

function download(button) {
    // Set the correct href
    button.href = settings.viewContext.canvas.toDataURL();

    // Construct today's timedate string
    var date = new Date();
    var currentDate = date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();

    // Download the image
    button.download = "WookieOil_" + currentDate + ".png";
}

function setFont(font) {
    settings.font = font;
    settings.textarea.css("font-family", settings.font);
}

function checkSaveName(saveName) {
    // Disable button if nothing is typed
    if (saveName === "") {
        $("#saveButton").addClass("disabled");
    }
    // Enable button if something is typed
    else {
        $("#saveButton").removeClass("disabled");
    }
}

function selectSave(save) {
    $(".save").removeClass("active");
    $(save).addClass("active");

    $("#loadButton").removeClass("disabled");
}

function checkClickOutsideTextarea(e) {
    // Reference prc322 @ StackOverflow (http://stackoverflow.com/users/659025/prc322)
    // http://stackoverflow.com/questions/1403615/use-jquery-to-hide-a-div-when-the-user-clicks-outside-of-it
    if (!settings.textarea.is(e.target) &&
        settings.textarea.has(e.target).length === 0) {
        hideTextarea();
    }
}

function handleTextarea(e) {
    // Enter keycode is 13
    if (e.keyCode === 13) {
        // Get text
        var val = settings.textarea.val();

        // Hide textarea
        hideTextarea()

        // Check for empty input
        if (val.trim() === "") {
            return;
        }

        // Make up the font
        var font = settings.fontSize + "px " + settings.font;

        // Create the text
        var text = new Text(settings.mouseX, settings.mouseY + (settings.fontSize / 2), settings.nextColor, val, font, settings.fontSize, settings.viewContext);

        // Draw text
        text.draw(settings.viewContext);

        // Add to shapes
        settings.shapes.push(text);

        // Enable undo
        enableUndo(true);

        // Empty and disable redo
        settings.redo = [];
        enableRedo(false);
    }
    // Escape key 
    else if (e.keyCode === 27) {
        hideTextarea();
    }
}

function saveEnter(e) {
    if (e.keyCode === 13) {
        save();
        $("#saveModal").modal("close");
    }
}

function save() {
    // Get save name
    var saveName = $("#saveName").val();

    if (saveName.trim() === "") {
        return;
    }

    // Construct post data
    var postData = JSON.stringify({
        title: saveName,
        content: settings.shapes
    });

    // Send save to server
    $.ajax({
        type: "POST",
        url: "/api/drawings",
        data: postData,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        complete: function (data) {
            // For reasons unknown, the success, error, failure
            // abort and done functions doesn't trigger
            if (data.status === 201) {
                // Close modal
                $("#saveModal").modal("close");
                // Clear input box
                $("#saveName").val("");
                // Disable button
                $("#saveButton").addClass("disabled");
                // Display toast
                Materialize.toast("Saved!", 1500);
                // Populate saves
                populateSaves();
            } else {
                console.log(data);
            }
        }
    });
}

function load() {
    // Get the ID of the save and deselect the save
    var selectedSave = $(".save.active");
    var saveID = selectedSave.attr("data-id");
    selectedSave.removeClass("active");
    $("#loadButton").addClass("disabled");

    // Get save
    $.ajax({
        type: "GET",
        url: "/api/drawings/" + saveID,
        dataType: "json",
        success: function (data) {
            loadSave(data.content);
        },
        failure: function (errMsg) {
            console.log(errMsg);
        }
    });

    // Load the save, map to classes and redraw
    function loadSave(shapes) {
        // Display toast
        Materialize.toast("Loaded!", 1500);

        // Empty shapes
        settings.shapes = [];

        // Loop over objects
        for (var obj in shapes) {
            var shape = undefined;

            // Identify the current object
            if (shapes[obj].identifier === "rectangle") {
                shape = new Rectangle();
            } else if (shapes[obj].identifier === "circle") {
                shape = new Circle();
            } else if (shapes[obj].identifier === "line") {
                shape = new Line();
            } else if (shapes[obj].identifier === "text") {
                shape = new Text(undefined, undefined, undefined, undefined, undefined, undefined, settings.viewContext);
            } else if (shapes[obj].identifier === "pen") {
                shape = new Pen();
            }

            // Override properties of the shape and add to shapes
            if (shape) {
                shape.override(shapes[obj]);
                settings.shapes.push(shape);
            }
        }

        // Redraw the view canvas
        redraw(settings.viewContext, settings.shapes);
    }
}