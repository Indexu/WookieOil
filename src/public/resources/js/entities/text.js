class Text extends Shape {
    constructor(x, y, color, text, font, px, context) {
        super(x, y, color);

        context.font = font;

        this.text = text;
        this.font = font;
        this.height = px;
        this.width = context.measureText(text).width;

        this.x1 = x;
        this.y1 = y - this.height;

        this.x2 = x + this.width;
        this.y2 = y;
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
        context.font = this.font;
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y);
    }

    intersects(rect) {
        return rectsIntersect(rect, this);
    }
}