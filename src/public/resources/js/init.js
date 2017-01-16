var settings = {
    viewCanvas: $("#viewCanvas"),
    viewContext: $("#viewCanvas")[0].getContext("2d"),
    editCanvas: $("#editCanvas"),
    editContext: $("#editCanvas")[0].getContext("2d"),
    nextObj: "rectangle",
    nextColor: "black",
    currentObj: undefined,
    mouseX: 0,
    mouseY: 0
};

// Update object based on selected tool
$("input[name='tool']").change(function () {
    settings.nextObj = $(this).val();
});