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
class Shape {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.endX = x;
        this.endY = y;
        this.color = color;
    }
}
settings.editCanvas.on("mousedown", function (e) {

    updateMousePosition(e);

    settings.editCanvas[0].style.cursor = "crosshair";

    var shape = new Rectangle(settings.mouseX, settings.mouseY, settings.nextColor);
    settings.currentObj = shape;
});

settings.editCanvas.on("mousemove", function (e) {
    if (settings.currentObj !== undefined) {
        updateMousePosition(e);

        settings.editContext.clearRect(0, 0, settings.editCanvas.width, settings.editCanvas.height);

        settings.currentObj.setEnd(settings.mouseX, settings.mouseY);

        settings.currentObj.draw(settings.editContext);
    }
});

settings.editCanvas.on("mouseup", function (e) {

    updateMousePosition(e);

    settings.editCanvas[0].style.cursor = "default";

    settings.currentObj.setEnd(settings.mouseX, settings.mouseY);

    settings.currentObj.draw(settings.viewContext);

    settings.currentObj = undefined;
});
function updateMousePosition(e) {
    if (e.offsetX) {
        settings.mouseX = e.offsetX;
        settings.mouseY = e.offsetY;
    } else if (e.layerX) {
        settings.mouseX = e.layerX;
        settings.mouseY = e.layerY;
    }
}
class Rectangle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    draw(context) {
        context.strokeRect(this.x, this.y, this.endX - this.x, this.endY - this.y);
    }
}