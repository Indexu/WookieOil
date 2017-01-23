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
    // Material select
    $("#fontType").material_select();

    // Initialize minicolors colorpicker
    $("#colorPicker").minicolors();

    // Tooltips
    $(".tooltipped").tooltip({
        delay: 50
    });
});

// Update object based on selected tool
$("input[name='tool']").on("change", function () {
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

// Textarea enter key
$("#textArea").on("keyup", function (e) {
    e.preventDefault();
    var code = (e.keyCode ? e.keyCode : e.which);
    // Enter keycode is 13
    if (code === 13) {
        $(this).hide();

        var font = settings.fontSize + "px " + settings.font;

        var text = new Text(settings.mouseX, settings.mouseY + (settings.fontSize / 2), settings.nextColor, $(this).val(), font, settings.fontSize, settings.viewContext);

        $(this).val("");

        text.draw(settings.viewContext);

        settings.shapes.push(text);
    }
});

// Color change
$("#colorPicker").on("change", function () {
    settings.nextColor = $(this).val();
});