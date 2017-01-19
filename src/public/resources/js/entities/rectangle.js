class Rectangle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
    }

    setEnd(x, y) {
        this.width = x - this.x;
        this.height = y - this.y;
    }

    draw(context) {
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }

    contains(x, y) {
        return (this.x <= x) && (x <= this.x + this.width) &&
            (this.y <= y) && (y <= this.y + this.height);
    }
}