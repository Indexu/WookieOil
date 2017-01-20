class Circle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);

        this.step = 0.1;
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        this.radiusX = (this.endX - this.x) * 0.5;
        this.radiusY = (this.endY - this.y) * 0.5;

        this.centerX = this.x + this.radiusX;
        this.centerY = this.y + this.radiusY;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX = deltaX;
        this.endY = deltaY;

        this.centerX = deltaX;
        this.centerY = deltaY;
    }

    draw(context) {

        // Reference: Richard @ StackOverflow (http://stackoverflow.com/users/4506995/richard)
        // http://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events

        //Save
        context.save();
        context.beginPath();

        //Dynamic scaling
        var scalex = 1 * ((this.endX - this.x) / 2);
        var scaley = 1 * ((this.endY - this.y) / 2);
        context.scale(scalex, scaley);

        //Create ellipse
        var centerx = (this.x / scalex) + 1;
        var centery = (this.y / scaley) + 1;
        context.arc(centerx, centery, 1, 0, 2 * Math.PI);

        //Restore and draw
        context.restore();
        context.stroke();
    }

    intersects(rect) {
        var distX = Math.abs(this.centerX - (rect.x1 - rect.width / 2));
        var distY = Math.abs(this.centerY - (rect.y1 - rect.height / 2));

        if (distX > (rect.width / 2 + circle.r)) {
            return false;
        }
        if (distY > (rect.height / 2 + circle.r)) {
            return false;
        }
    }
}