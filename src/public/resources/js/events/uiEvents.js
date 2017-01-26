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
    deselectAllSaves();
    $(this).addClass("active");

    $("#loadButton").removeClass("disabled");
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
        // Empty redo
        settings.redo = [];
        // Disable redo
        enableRedo(false);

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