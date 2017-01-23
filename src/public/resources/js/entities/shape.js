class Shape {
    constructor(x, y, color, strokeSize = undefined) {
        this.x = x;
        this.y = y;
        this.endX = x;
        this.endY = y;
        this.color = color;
        this.strokeSize = strokeSize;
    }
}