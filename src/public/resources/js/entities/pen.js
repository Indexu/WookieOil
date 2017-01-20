class Pen extends Shape {
    constructor(x, y, color) {
        super(x, y, color);

        this.points = [{
            x: x,
            y: y
        }];

        this.rightmostX = x;
        this.leftmostX = x;
        this.uppermostY = y;
        this.lowermostY = y;
    }

    setEnd(x, y) {
        this.points.push({
            x: x,
            y: y
        });

        // Check if the new point is expanding the boundary box
        if (x < this.leftmostX) {
            this.leftmostX = x;
        }

        if (this.rightmostX < x) {
            this.rightmostX = x;
        }

        if (y < this.uppermostY) {
            this.uppermostY = y;
        }

        if (this.lowermostY < y) {
            this.lowermostY = y;
        }
    }

    move(deltaX, deltaY) {
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].x += deltaX;
            this.points[i].y += deltaY;
        }

        this.rightmostX += deltaX;
        this.leftmostX += deltaX;
        this.uppermostY += deltaY;
        this.lowermostY += deltaY;
    }

    draw(context) {
        // Smooth curve thanks to Homan @ StackOverflow (http://stackoverflow.com/users/793454/homan)
        // http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas/

        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);

        // Loop if more than 2 points
        if (2 < this.points.length) {
            var i = 1;

            for (; i < this.points.length - 2; i++) {
                var endX = (this.points[i].x + this.points[i + 1].x) / 2;
                var endY = (this.points[i].y + this.points[i + 1].y) / 2;

                context.quadraticCurveTo(this.points[i].x, this.points[i].y, endX, endY);
            }

            // For the last 2 points
            context.quadraticCurveTo(
                this.points[i].x,
                this.points[i].y,
                this.points[i + 1].x,
                this.points[i + 1].y
            );
        }
        // Simply bind together if 2 or less points 
        else {
            context.quadraticCurveTo(
                this.points[0].x,
                this.points[0].y,
                this.points[1].x,
                this.points[1].y
            );
        }

        context.stroke();
    }

    intersects(rect) {
        // Check the boundary box to see if there is a chance of intersection
        var boundaryBox = {
            x1: this.leftmostX,
            y1: this.uppermostY,
            x2: this.rightmostX,
            y2: this.lowermostY
        }

        return rectsIntersect(rect, boundaryBox);
    }
}