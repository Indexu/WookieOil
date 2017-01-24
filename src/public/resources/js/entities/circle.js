class Circle extends Shape {
    constructor(x, y, color, strokeSize) {
        super(x, y, color, "circle", strokeSize);
    }

    setEnd(x, y) {
        this.endX = x;
        this.endY = y;

        this.radiusX = (this.endX - this.x) * 0.5;
        this.radiusY = (this.endY - this.y) * 0.5;

        this.centerX = this.x + this.radiusX;
        this.centerY = this.y + this.radiusY;

        // The following is used for intersection calculation
        this.x1 = this.x;
        this.x2 = x;
        if (x < this.x) {
            this.x1 -= Math.abs(x - this.x);
            this.x2 += Math.abs(x - this.x);
        }

        this.y1 = this.y;
        this.y2 = y;
        if (y < this.y) {
            this.y1 -= Math.abs(y - this.y);
            this.y2 += Math.abs(y - this.y);
        }
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;

        this.endX += deltaX;
        this.endY += deltaY;

        this.centerX += deltaX;
        this.centerY += deltaY;

        this.x1 += deltaX;
        this.y1 += deltaY;

        this.x2 += deltaX;
        this.y2 += deltaY;
    }

    draw(context) {

        // Reference: Richard @ StackOverflow (http://stackoverflow.com/users/4506995/richard)
        // http://stackoverflow.com/questions/21594756/drawing-circle-ellipse-on-html5-canvas-using-mouse-events

        // Save
        context.save();
        context.beginPath();

        // Dynamic scaling
        var scaleX = 1 * ((this.endX - this.x) / 2);
        var scaleY = 1 * ((this.endY - this.y) / 2);
        context.scale(scaleX, scaleY);

        // Create ellipse
        var centerx = (this.x / scaleX) + 1;
        var centery = (this.y / scaleY) + 1;
        context.arc(centerx, centery, 1, 0, 2 * Math.PI);

        // Restore and draw
        context.restore();
        context.lineWidth = this.strokeSize;
        context.strokeStyle = this.color;
        context.stroke();
    }

    intersects(rect) {

        // Information source: http://gamedev.stackexchange.com/questions/109393/how-do-i-check-for-collision-between-an-ellipse-and-a-rectangle
        // Vertex within a ellipse formula: http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse

        // Make sure that the rect intersects with the bounding box of the ellipse
        // in order to have a chance of intersecting with the ellipse itself
        if (!rectsIntersect(rect, this)) {
            return false;
        }

        if (rectCover(rect, this)) {
            return true;
        }

        // Check if rect intersects with the x and y axis of the ellipse
        // If so, the rect intersects with the ellipse
        // X-axis
        var axisX = {
            x1: this.centerX,
            y1: this.centerY - this.radiusY,
            x2: this.centerX,
            y2: this.centerY + this.radiusY
        };
        // Y-axis
        var axisY = {
            x1: this.centerX - this.radiusX,
            y1: this.centerY,
            x2: this.centerX + this.radiusX,
            y2: this.centerY
        };

        // Rect upper line
        var upperLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y1
        };
        if (linesIntersect(axisX, upperLine) || linesIntersect(axisY, upperLine)) {
            return true;
        }

        // Rect bottom line
        var bottomLine = {
            x1: rect.x1,
            y1: rect.y2,
            x2: rect.x2,
            y2: rect.y2
        };
        if (linesIntersect(axisX, bottomLine) || linesIntersect(axisY, bottomLine)) {
            return true;
        }

        // Rect left line
        var leftLine = {
            x1: rect.x1,
            y1: rect.y1,
            x2: rect.x1,
            y2: rect.y2
        };
        if (linesIntersect(axisX, leftLine) || linesIntersect(axisY, leftLine)) {
            return true;
        }

        // Rect right line
        var rightLine = {
            x1: rect.x2,
            y1: rect.y1,
            x2: rect.x2,
            y2: rect.y2
        };
        if (linesIntersect(axisX, rightLine) || linesIntersect(axisY, rightLine)) {
            return true;
        }

        // Find the corner of the rect that is closest to the center of the ellipse
        // and check if it resides within the ellipse

        var corners = {
            upperLeft: {
                x: rect.x1,
                y: rect.y1
            },
            upperRight: {
                x: rect.x2,
                y: rect.y1
            },
            lowerLeft: {
                x: rect.x1,
                y: rect.y2
            },
            lowerRight: {
                x: rect.x2,
                y: rect.y2
            }
        };

        var closestCorner = undefined;
        var closestDist = Number.POSITIVE_INFINITY;

        for (var key in corners) {
            if (corners.hasOwnProperty(key)) {
                var currentCorner = corners[key];
                // Get euclidean distance
                var dist = Math.sqrt(Math.pow(currentCorner.x - this.centerX, 2) + Math.pow(currentCorner.y - this.centerY, 2));

                // Check if lower than current lowest
                if (dist < closestDist) {
                    closestDist = dist;
                    closestCorner = currentCorner;
                }
            }
        }

        // Left hand side
        var lhs = (Math.pow(closestCorner.x - this.centerX, 2)) / Math.pow(this.radiusX, 2);
        // Right hand side
        var rhs = (Math.pow(closestCorner.y - this.centerY, 2)) / Math.pow(this.radiusY, 2);

        return ((lhs + rhs) <= 1);
    }
}