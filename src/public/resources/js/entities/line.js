class Line extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
        context.closePath();
        context.stroke();
    }

    contains(x, y) {
        /*
        var crossproduct = (y - this.y) * (this.endX - this.x) - (x - this.x) * (this.endY - this.y);
        if (Math.abs(crossproduct) !== 0) {
            console.log("CROSS");
            return false;
        }
        */

        var dotproduct = (x - this.x) * (this.endX - this.x) + (y - this.y) * (this.endY - this.y);
        if (dotproduct < 0) {
            console.log("DOT");
            return false;
        }

        var squaredlengthba = (this.endX - this.x) * (this.endX - this.x) + (this.endY - this.y) * (this.endY - this.y);
        if (dotproduct > squaredlengthba) {
            console.log("SQUARE");
            return false;
        }

        return true;
    }
}