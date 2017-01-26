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
    $(".modal").modal({
        complete: function () {
            deselectAllSaves();
        }
    });

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