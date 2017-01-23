class Line extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, strokeSize);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX += deltaX;
        this.endY += deltaY;
    }

    draw(context) {
        context.beginPath();
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;
        context.moveTo(this.x, this.y);
        context.lineTo(this.endX, this.endY);
        context.closePath();
        context.stroke();
    }

    intersects(rect) {
        // If the line is completely within the rectangle
        if ((rect.x1 <= this.x && this.x <= rect.x2 && rect.y1 <= this.y && this.y <= rect.y2) &&
            ((rect.x1 <= this.endX && this.endX <= rect.x2 && rect.y1 <= this.endY && this.endY <= rect.y2))) {
            return true;
        }

        // This line
        var line = {
            x1: this.x,
            y1: this.y,
            x2: this.endX,
            y2: this.endY
        };

        // Rect upper line
        var upperLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y1
        };
        if (linesIntersect(line, upperLine)) {
            return true;
        }

        // Rect bottom line
        var bottomLine = {
            x1: rect.x1,
            y1: rect.y2,
            x2: rect.x2,
            y2: rect.y2
        };
        if (linesIntersect(line, bottomLine)) {
            return true;
        }

        // Rect left line
        var leftLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x1,
            y2: rect.y2
        };
        if (linesIntersect(line, leftLine)) {
            return true;
        }

        // Rect right line
        var rightLine = {
            x1: rect.x2,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y2
        };
        return linesIntersect(line, rightLine);
    }
}