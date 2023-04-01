# Development Environment

Dev-Environment for «Generative Gestaltung». Includes the basic scripts, a HTML-skeleton and a bunch of helper functions like Canvas Switching and p5-GUI.

We are coding on the Javascript Library p5.js. It is recommended to use an IDE/ Editor, that supports Code Coloring and Prettifying for Javascript. Code Completion and a built in Webserver with Live Reload is useful, too. There are a couple of editors supporting that requirements. My personal pick is [Visual Studio Code](https://code.visualstudio.com/).

Please create a folder for every assignment and copy the starter code into that folder. Sometimes you need additional files for a sketch, e.g. images. If so, put these files into a subfolder named `stuff` inside the folder of the sketch.

The structure of your sketch collection might look like this:

```
/sketches
  /p1
    index.html
    sketch.js
  /p1.1
    /stuff
      bill-gates.jpg
      steve-jobs.jpg
    index.html
    sketch.js
```

If you have different versions of a sketch: keep them and give them a version number.

```
/sketches
  /p1
    index.html
    sketch.js
    sketch-v1.0.js
    sketch-v1.1.js
    sketch-v2.0.js
```

The final sketch should always be named `sketch.js`. That's it ;)


## Running your code

You have to run your code on a web server. You can use a IDE embeded server like [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or [Atom Live Server](https://atom.io/packages/atom-live-server). 

Another way is to use the [Light Server](https://npm.io/package/light-server) provided by this repo. This requires [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com). Go through the following steps to install and run the server.

Jump via command line into the folder of the startercode repo, run  `npm run dev`. Follow the instructions. The script output should contain a line like that:

```
light-server is listening at http://0.0.0.0:4000
serving static dir: .
```

Open the povided URL in your prefered browser. I prefer [Mozilla Firefox](https://www.mozilla.org/de/firefox/new/) for developmenmt.
That's it 🤪


## SVG Support

There is an experimental SVG support included. It requires [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com). Jump via command line into the folder of the startercode repo, run  `npm install`. Follow the instructions. 

You have to change the `canvasParams.mode` from `canvas` to `SVG`:

```
const canvasParams = {
  holder: document.getElementById('canvas'),
  state: false,
  mouseX: false,
  mouseY: false,
  mouseLock: false,
  background: 0,
  gui: true,
  mode: 'SVG', // canvas or svg … SVG mode is experimental 
};
```

There is an experimental SVG support included. It requires [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com). Jump via command line into the folder of the startercode repo, run  `npm install`. Follow the instructions. 
