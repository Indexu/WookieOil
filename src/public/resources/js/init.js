var settings = {
    viewCanvas: $("#viewCanvas"),
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editCanvas: $("#editCanvas"),
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

    // Initialize minicolors colorpicker
    $("#colorPicker").minicolors();

    // Resize the canvases
    resize();

    // Populate saves
    populateSaves();
});

// Resize the canvas width dynamically
$(window).on("resize", function () {
    resize();
});

// Update object based on selected tool
$(".tool").on("click", function (e) {
    e.preventDefault();
    settings.nextObj = $(this).attr("data-value");

    // Change color of button
    $(".tool:not(.light-blue accent-1)").addClass("light-blue accent-1");
    $(this).removeClass("light-blue accent-1");
});

// Download button
$("#downloadButton").on("click", function () {
    // Set the correct href
    this.href = settings.viewCanvas[0].toDataURL();

    // Construct today's timedate string
    var date = new Date();
    var currentDate = date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();

    // Download the image
    this.download = "WookieOil_" + currentDate + ".png";
});

// Undo button
$("#undo").on("click", function () {
    undo(settings.viewCanvas[0], settings.viewContext);
});

// Redo button
$("#redo").on("click", function () {
    redo(settings.viewCanvas[0], settings.viewContext);
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
    settings.font = $(this).val();
    settings.textarea.css("font-family", settings.font);
});

// Save name input
$("#saveName").on("input", function () {
    // Disable button if nothing is typed
    if ($(this).val() === "") {
        $("#saveButton").addClass("disabled");
    }
    // Enable button if something is typed
    else {
        $("#saveButton").removeClass("disabled");
    }
});

// Click on a save
$(document).on("click", ".save", function () {
    $(".save").removeClass("active");
    $(this).addClass("active");

    $("#loadButton").removeClass("disabled");
});

// Hide textbox when clicked outside
// Reference prc322 @ StackOverflow (http://stackoverflow.com/users/659025/prc322)
// http://stackoverflow.com/questions/1403615/use-jquery-to-hide-a-div-when-the-user-clicks-outside-of-it
$(document).mouseup(function (e) {
    if (!settings.textarea.is(e.target) &&
        settings.textarea.has(e.target).length === 0) {
        hideTextarea();
    }
});

// Textarea enter key
$("#textArea").on("keyup", function (e) {
    e.preventDefault();
    var code = (e.keyCode ? e.keyCode : e.which);
    // Enter keycode is 13
    if (code === 13) {

        var val = $(this).val();

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
    else if (code === 27) {
        hideTextarea();
    }
});

// Click on save button
$("#saveButton").on("click", function () {
    // Get save name
    var saveName = $("#saveName").val();

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
            if (data.status === 201) {
                // Clear input box
                $("#saveName").val("");
                // Display toast
                Materialize.toast("Saved!", 1500);
                // Populate saves
                populateSaves();
            } else {
                console.log(data);
            }
        }
    });
});

// Click on load button
$("#loadButton").on("click", function () {
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
        redraw(settings.viewCanvas[0], settings.viewContext, settings.shapes);
    }
});