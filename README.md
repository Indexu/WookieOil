# WookieOil

A simple to use HTML5 drawing application.

## Features

* Tools
    * Rectangle
    * Circle
    * Line
    * Pen
    * Text
    * Select
* Undo and redo drawn shapes
* Adjust font, font weight, line/stroke width and color
* Save and load your drawings
    * Stored locally on the server, lost upon server shutdown
* Selecting multiple elements of different shapes
* Precise detection of circle/ellipse selection
* Download your drawing locally to transparent .png format
* Beautiful and responsive UI

## Getting Started

In order to run WookieOil on your own machine, you will need [node.js](https://nodejs.org/en/download/) in order to use npm to install the dependencies and run the server.

### Prerequisites

After installing node.js, make sure node is in your PATH and run the following command in your CLI in order to install the dependencies required.

```
$ npm install
```

### Running the server

To start up the server by running server.js, located in the src/ directory, with node.
From the root directory of the project run the following command in your CLI.

```
$ node src/server.js
```

Now the server is up and running on port 3000 by default.

### Development

We use Gulp as our build system. It should have been installed when you ran the install with npm.
Simply run the following command in the root directory of the project to start up gulp.

```
$ gulp
```

## Built With

* [Materialize](http://materializecss.com/) - Web framework
* [Gulp](http://gulpjs.com/) - Build system
* [ExpressJS](http://expressjs.com/) - Server
* [NPM](https://www.npmjs.com/) - Dependency Management

## Authors

* [Christian A. Jacobsen](https://github.com/ChristianJacobsen/)
* [Hilmar Tryggvason](https://github.com/Indexu/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Special thanks to Materialize for making what is probably, in our opinion, the best CSS/JS framework to date.
* Special thanks to [Henning Úlfarsson](https://github.com/ulfarsson/) for teaching us calculus.
