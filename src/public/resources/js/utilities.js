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

// Deselect all saves and disable load button
function deselectAllSaves() {
    $(".save").removeClass("active");
    $("#loadButton").addClass("disabled");
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