class Shape {
    constructor(x, y, color, identifier, strokeSize = undefined) {
        this.x = x;
        this.y = y;
        this.endX = x;
        this.endY = y;
        this.color = color;
        this.identifier = identifier;
        this.strokeSize = strokeSize;
    }

    // Override every value in this object with the values of obj
    // Reference: Oliver Moran @ StackOverflow (http://stackoverflow.com/users/681800/oliver-moran)
    // http://stackoverflow.com/questions/5873624/parse-json-string-into-a-particular-object-prototype-in-javascript
    override(obj) {
        for (var prop in obj) {
            this[prop] = obj[prop];
        }
    }
}