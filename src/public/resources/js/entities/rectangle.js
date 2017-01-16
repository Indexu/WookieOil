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