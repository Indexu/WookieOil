var settings = {
    viewCanvas: $("#viewCanvas"),
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editCanvas: $("#editCanvas"),
    editContext: $("#editCanvas")[0].getContext("2d"),
    textarea: $("#textArea"),
    fontSize: 36,
    font: "roboto",
    strokeSize: 10,
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
});

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
    console.log("oil");
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
$("#saves > a").on("click", function () {
    $("#saves > a").removeClass("active");
    $(this).addClass("active");

    $("#loadButton").removeClass("disabled");
});

// Textarea enter key
$("#textArea").on("keyup", function (e) {
    e.preventDefault();
    var code = (e.keyCode ? e.keyCode : e.which);
    // Enter keycode is 13
    if (code === 13) {
        // Hide text area
        $(this).hide();

        // Make up the font
        var font = settings.fontSize + "px " + settings.font;

        // Create the text
        var text = new Text(settings.mouseX, settings.mouseY + (settings.fontSize / 2), settings.nextColor, $(this).val(), font, settings.fontSize, settings.viewContext);

        // Reset textarea
        $(this).val("");

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
});

// Click on save button
$("#saveButton").on("click", function () {
    var saveName = $("#saveName").val();

    var postData = JSON.stringify({
        title: saveName,
        content: settings.shapes
    });

    $.ajax({
        type: "POST",
        url: "/api/drawings",
        data: postData,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            console.log(data);
        },
        failure: function (errMsg) {
            console.log(errMsg);
        }
    });
});

// Click on load button
$("#loadButton").on("click", function () {
    // Empty shapes
    settings.shapes = [];

    // Parse JSON string
    var shapes = JSON.parse(); // TODO: Give JSON string

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
});