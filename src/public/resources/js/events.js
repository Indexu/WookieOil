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