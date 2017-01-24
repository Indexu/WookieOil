class Rectangle extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, "rectangle", strokeSize);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        this.width = x - this.x;
        this.height = y - this.y;

        // The following is used for intersection calculation
        this.x1 = this.x;
        this.x2 = x;
        if (x < this.x) {
            this.x1 -= Math.abs(this.width);
            this.x2 += Math.abs(this.width);
        }

        this.y1 = this.y;
        this.y2 = y;
        if (y < this.y) {
            this.y1 -= Math.abs(this.height);
            this.y2 += Math.abs(this.height);
        }
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.x1 += deltaX;
        this.y1 += deltaY;

        this.x2 += deltaX;
        this.y2 += deltaY;
    }

    draw(context) {
        context.beginPath();
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }

    intersects(rect) {
        return rectsIntersect(rect, this);
    }
}