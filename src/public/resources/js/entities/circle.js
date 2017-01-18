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

    draw(context) {

        // Reference: K3N @ StackOverflow (http://stackoverflow.com/users/1693593/k3n)
        // http://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events

        context.beginPath();
        context.moveTo(this.endX, this.centerY);

        // Draw a lot of lines in a circle
        for (var i = this.step; i < Math.PI * 2; i += this.step) {
            context.lineTo(this.centerX + (this.radiusX * Math.cos(i)),
                this.centerY + (this.radiusY * Math.sin(i)));
        }

        context.closePath();
        context.stroke();
    }
}