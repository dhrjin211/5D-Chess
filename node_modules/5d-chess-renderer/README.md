# 5D Chess Renderer

PIXI.js based renderer to create 5d chess boards based off of 5d-chess-js.

[![Pipeline Status](https://gitlab.com/alexbay218/5d-chess-renderer/badges/master/pipeline.svg)](https://gitlab.com/%{project_path}/-/commits/master)
[![NPM version](https://img.shields.io/npm/v/5d-chess-renderer.svg)](https://www.npmjs.com/package/5d-chess-renderer)

What does 5D Chess Renderer do?
 - Render boards and pieces using 5d-chess-js data
 - Render previous moves and actions as arrows
 - Provide configuration / palette options
 - Handle mouse / touch events for zooming, panning, move selection, and arrow drawing

What does 5D Chess Renderer not do?
 - Does not handle keyboard events
 - Does not handle sound
 - Does not handle additional GUI elements (submitting, undo, forfeit, chess clock, etc.)

## Demo

Live demo available [here](https://alexbay218.gitlab.io/5d-chess-renderer/www/demo.html)

## Installation

### Node.js

Simply install with this command `npm i 5d-chess-renderer`

### In Browser

Include this tag in the HTML before invoking the library:
``` html
<script src="https://unpkg.com/5d-chess-renderer/dist/5d-chess-renderer.js"></script>
```

## API

### Constructor

**ChessRenderer([element, config, palette, PIXI])**

Creates a new instance of the `ChessRenderer` class.

  - element - *[Optional]* HTMLElement to attach the main canvas element to (will resize to element size). Use `null` to skip this process.
  - config - *[Optional]* Object to indicate what configuration values to use during rendering (see Config section for more details).
  - palette - *[Optional]* Object to indicate what color values to use during rendering (see Palette section for more details).
  - PIXI - *[Optional]* PIXI.js instance to use instead of the default `pixi.js-legacy` npm package.

### Functions

**.on(event, callback)**

Assigns event listener to start listening to events specified in Event section.

  - event - String indicating which event to listen to.
  - callback - Function(\[data\]) used to process new events.

    Function arguments:

    - data - *[Optional]* Any data type passed by the event when the callback is called. See the Event section for more information.
  
  - **Return** - Function() used to unbind the listener. Call this function when the listener is no longer needed.

**.destroy()**

Destroy the `ChessRenderer` instance. Use this to free up memory and destroy WebGL / Canvas context. You cannot undo this action.

**.global.attach(element)**

Attach the renderer to a HTMLElement. This is called in the constructor when element is specified. Note that the renderer will resize to element whenever the element resizes (if element resizes often, the renderer will flicker).

  - element - HTMLElement to attach the main canvas element to (will resize to element size).
  - **Return** - Nothing.

**.global.config(config)**

Change internal configuration values to change renderer behavior.

  - config - Object to indicate what configuration values to use during rendering (see Config section for more details).
  - **Return** - Nothing.

**.global.config(key, config)**

Change internal configuration values to change renderer behavior.

  - key - String used to indicate the top level object field.
  - config - Object to indicate what configuration values to use during rendering (see Config section for more details).
  - **Return** - Nothing.

**.global.palette(palette)**

Change internal palette values to change colors / tints used during rendering.

  - palette - Object to indicate what palette color values to use during rendering (see Palette section for more details).
  - **Return** - Nothing.

**.global.palette(key, palette)**

Change internal palette values to change colors / tints used during rendering.

  - key - String used to indicate the top level object field.
  - palette - Object to indicate what palette color values to use during rendering (see Palette section for more details).
  - **Return** - Nothing.

**.global.texture(key, data)**

Change PIXI.Texture to change textures used during rendering.

  - key - String used to indicate the type of sprite to use the texture.
  - data - Any data type used to create a texture via `PIXI.Texture.from(data)`. More information here (https://pixijs.download/dev/docs/PIXI.Texture.html#from).
  - **Return** - Nothing.

**.global.sync(chess)**

Automatically display the board, action history, move buffer, and checks from a `5d-chess-js` Chess instance.

  - chess - `5d-chess-js` Chess instance used to extract board, action history, move buffer, and checks information to render.
  - **Return** - Nothing.

**.global.board(board)**

Change internal board state to render. Used by `.global.sync(chess)` function.

  - board - `5d-chess-js` board field used to update internal board state.
  - **Return** - Nothing.
  
**.global.actionHistory(actionHistory)**

Change internal action history state to render. Used by `.global.sync(chess)` function.

  - actionHistory - `5d-chess-js` actionHistory field used to update internal action history state.
  - **Return** - Nothing.
  
**.global.moveBuffer(moveBuffer)**

Change internal move buffer state to render. Used by `.global.sync(chess)` function.

  - moveBuffer - `5d-chess-js` moveBuffer field used to update internal move buffer state.
  - **Return** - Nothing.

**.global.checks(checks)**

Change internal check moves to render. Used by `.global.sync(chess)` function.

  - checks - Array of `5d-chess-js` Move objects created from calling `chess.checks('object')`.
  - **Return** - Nothing.

**.global.availableMoves(availableMoves)**

Change internal array of moves that indicate what moves are available to play.

  - availableMoves - Array of `5d-chess-js` Move objects.
  - **Return** - Nothing.

**.global.pastAvailableMoves(pastAvailableMoves)**

Change internal array of moves that indicate what past moves were available to play. Showing possible future moves is assigned here too.

  - pastAvailableMoves - Array of `5d-chess-js` Move objects.
  - **Return** - Nothing.

**.render.customArrowManager.drawArrow(arrowObject)**

Draw a custom arrow. Use this to draw custom arrows programmatically.

  - arrowObject - `Arrow `object used to create the custom arrow.
  - **Return** - Nothing.

**.render.customArrowManager.enableCustomArrowMode([color, middleMode])**

Enables custom arrow drawing mode. In this mode, clicking / tapping on squares are used to draw custom arrows.

  - color - *[Optional]* Integer representing the RGB hex value (`'#FFFFFF' => 0xffffff`). Use `null` to use default custom color.
  - middleMode - *[Optional]* Boolean indicating if the arrow should contain a middle point. Defaults to `true`.
  - **Return** - Nothing.

**.render.customArrowManager.disableCustomArrowMode()**

Disables custom arrow drawing mode.

  - **Return** - Nothing.

**.render.customArrowManager.enableEraseMode()**

Enables custom arrow erasing mode. In this mode, clicking / tapping on squares erases the closest arrow (based on distance to start, middle, or end points).

  - **Return** - Nothing.

**.render.customArrowManager.disableEraseMode()**

Disables custom arrow erasing mode.

  - **Return** - Nothing.

**.render.customArrowManager.undo()**

Erase the last custom arrow drawn.

  - **Return** - Nothing.

**.render.customArrowManager.wipe()**

Erase all custom arrows.

  - **Return** - Nothing.

**.zoom.fullBoard([move, zoom])**

Zoom and move the viewport to view the full board.

  - move - *[Optional]* Boolean indicating to move the viewport to the center of the full board. Defaults to `true`.
  - zoom - *[Optional]* Boolean indicating to zoom the viewport to view the full board. Defaults to `true`.
  - **Return** - Nothing.

**.zoom.present([move, zoom])**

Zoom and move the viewport to view a present board.

  - move - *[Optional]* Boolean indicating to move the viewport to the center of a present board. Defaults to `true`.
  - zoom - *[Optional]* Boolean indicating to zoom the viewport to view a present board. Defaults to `true`.
  - **Return** - Nothing.

**.zoom.board(timeline, turn, player, [move, zoom])**

Zoom and move the viewport to view a specific board.

  - timeline - Integer indicating the timeline number of the board, 0 is neutral, negative integers are for black and positive integers are for white.
  - turn - Integer indicating the turn number of the board, starts from 1.
  - player - String indicating the player that the turn belongs to.
  - move - *[Optional]* Boolean indicating to move the viewport to the center of a specific board. Defaults to `true`.
  - zoom - *[Optional]* Boolean indicating to zoom the viewport to view a specific board. Defaults to `true`.
  - **Return** - Nothing.

### Events

These events are emitted to be used both internally and externally. Use the `.on(event, callback)` endpoint to listen to events.

**'configUpdate'**

Fires when the configuration object is modified.

Callback arguments:

  - None

**'paletteUpdate'**

Fires when the palette object is modified.

Callback arguments:

  - None

**'textureUpdate'**

Fires when the texture store is modified.

Callback arguments:

  - None

**'boardUpdate'**

Fires when the internal board state is modified.

Callback arguments:

  - board - The new board state in the form of a `5d-chess-js` object. Note that ghost boards added, since this board state is used for rendering purposes
  
**'boardUpdate'**

Fires when the internal board state is modified.

Callback arguments:

  - board - The new board state in the form of a `5d-chess-js` object. Note that ghost and check boards are added / modified, since this board state is used for rendering purposes.

**'actionHistoryUpdate'**

Fires when the action history is updated, triggering rendering of move arrows.

Callback arguments:

  - actionHistory - The new `5d-chess-js` style action history object used to update the internal move arrow states.

**'moveBufferUpdate'**

Fires when the move buffer is updated, triggering rendering of move arrows.

Callback arguments:

  - moveBuffer - The new `5d-chess-js` style move buffer object used to update the internal move arrow states.

**'checksUpdate'**

Fires when the array of check moves is updated, triggering rendering of check arrows.

Callback arguments:

  - checks - The new `5d-chess-js` style move objects used to update the internal check arrow states.

**'availableMovesUpdate'**

Fires when the array of available moves is updated, triggering rendering of move highlights when needed.

Callback arguments:

  - checks - The new `5d-chess-js` style move objects used to update the internal available moves.

**'pastAvailableMovesUpdate'**

Fires when the array of past available moves is updated, triggering rendering of move highlights when needed.

Callback arguments:

  - checks - The new `5d-chess-js` style move objects used to update the internal past available moves.

### Schemas

These schemas define the various object types that the API interacts with.

**Arrow**

``` js
{
  type: String Enum ['move','check','custom'] || Integer,     // String indicating the arrow type to draw (this is used to pick which color to use according to palette). For custom color, use an integer representing the RGB hex value ('#FFFFFF' => 0xffffff).
  start: Position,                                            // 5d-chess-js position object used to indicate the starting point of the arrow
  middle: null || Position,                                   // 5d-chess-js position object used to indicate the middle point of the arrow. Null if no need to display middle point.
  end: Position,                                              // 5d-chess-js position object used to indicate the ending point of the arrow
}
```

### Palette

The palette object is defined under `palette.js`. The following code block may not be up to date, so double check with the `palette.js` file for actual implementation.

``` js
{
  fps: {
    text: 0x000000,                       //FPS counter text color
  },
  background: {
    single: 0xE2E5F7,                     //Background color for solid backgrounds
    lightRectangle: 0xE2E5F7,             //Color for light rectangles of checkered background
    lightStripeBlack: 0xBCB6CE,           //Color for black side stripes on light rectangles of the checkered background
    lightStripeWhite: 0xE5EEF6,           //Color for white side stripes on light rectangles of the checkered background
    darkRectangle: 0xCED4F1,              //Color for dark rectangles of the checkered background
    darkStripeBlack: 0xAFA3BD,            //Color for black side stripes on dark rectangles of the checkered background
    darkStripeWhite: 0xDDE5F4,            //Color for white side stripes on dark rectangles of the checkered background
  },
  board: {
    whiteBorder: 0xdddddd,                //Tint for white board borders
    blackBorder: 0x222222,                //Tint for black board borders
    checkBorder: 0xc50000,                //Tint for board borders that are involved in checks
    inactiveBorder: 0x777777,             //Tint for boards that are inactive
    whiteBorderOutline: 0x222222,         //Color of outlines of white boards
    blackBorderOutline: 0xdddddd,         //Color of outlines of black boards
    checkBorderOutline: 0xaf0000,         //Color of outlines of boards involved in checks
    inactiveBorderOutline: 0x777777,      //Color of outlines of inactive boards
  },
  boardLabel: {
    timeline: 0x000000,                   //Color of timeline labels
    turn: 0x000000,                       //Color of turn labels
    whiteBoard: 0x000000,                 //Color of board labels on white board
    blackBoard: 0xffffff,                 //Color of board labels on black board
    checkBoard: 0xffffff,                 //Color of board labels on boards involved in checks
    inactiveBoard: 0xffffff,              //Color of board labels on inactive boards
  },
  boardShadow: {
    shadow: 0x000000,                     //Color of board shadows
  },
  square: {
    white: 0xaaaaaa,                      //Tint for white square
    black: 0x555555,                      //Tint for black square
  },
  arrow: {
    move: 0xd3a026,                       //Color of move arrows
    moveOutline: 0x000000,                //Color of move arrow outlines
    check: 0xf50000,                      //Color of check arrows
    checkOutline: 0x000000,               //Color of check arrow outlines
    custom: 0x32dcfa,                     //Color of custom arrows
                                          //This is the default color used if no color is specified when turning on custom arrow mode
    customOutline: 0x000000,              //Color of custom arrow outlines
  },
  highlight: {
    self: 0x0083be,                       //Tint for square highlights on selected pieces
    move: 0x6fc326,                       //Tint for square highlights on available moves
    pastMove: 0x6fc326,                   //Tint for square highlights on past available moves
    capture: 0xf50000,                    //Tint for square highlights on available capture moves
    pastCapture: 0xf50000,                //Tint for square highlights on past available capture moves
  }
}
```

### Config

The configuration object is defined under `config.js`. The following code block may not be up to date, so double check with the `config.js` file for actual implementation.

``` js
{
  app: {
    height: 600,                          //This option will only be used on creation, updating this value will not resize the renderer
                                          //Use this for when not attaching the canvas element to a HTMLElement (server-side, headless, etc.). No need to change if used normally.
    width: 800,                           //This option will only be used on creation, updating this value will not resize the renderer
                                          //Use this for when not attaching the canvas element to a HTMLElement (server-side, headless, etc.). No need to change if used normally.
    preserveDrawingBuffer: false,         //This option will only be used on creation, updating this will not change PIXI.Application instance behavior
                                          //Enables drawing buffer preservation, enable this if you need to call toDataUrl on the WebGL context.
    antialias: true,                      //This option will only be used on creation, updating this will not change PIXI.Application instance behavior
                                          //Sets antialias option inside PIXI.Application constructor (see https://pixijs.download/dev/docs/PIXI.Application.html#constructor)
    forceCanvas: false,                   //This option will only be used on creation, updating this will not change PIXI.Application instance behavior
                                          //Forces the usage of canvas based rendering instead of webgl. Using canvas based rendering is not recommended, as many effects such as transparency and blur do not work correctly.
    backgroundAlpha: 1,                   //Sets alpha of the solid background (does not effect squares background)
                                          //This option will only be used on creation, updating this will not change PIXI.Application instance behavior
    interactive: true,                    //Enables mouse / touch events
  },
  viewport: {
    drag: true,                           //Enables viewport mouse / touch drag (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#drag)
    dragOptions: {                        //Options object for viewport drag plugin (https://davidfig.github.io/pixi-viewport/jsdoc/global.html#DragOptions)
      direction: 'all',
      pressDrag: true,
      wheel: true,
      wheelScroll: 1,
      reverse: false,
      clampWheel: false,
      underflow: 'center',
      factor: 1,
      mouseButtons: 'all',
    },
    pinch: true,                          //Enables viewport two-finger zoom / touch drag (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#pinch)
    pinchOptions: {                       //Options object for viewport pinch plugin (https://davidfig.github.io/pixi-viewport/jsdoc/global.html#PinchOptions)
      noDrag: false,
      percent: 1,
      factor: 1,
    },
    wheel: true,                          //Enables mouse wheel zoom (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#wheel)
    wheelOptions: {                       //Options object for viewport wheel plugin (https://davidfig.github.io/pixi-viewport/jsdoc/global.html#WheelOptions)
      percent: 0.1,
      smooth: false,
      reverse: false,
    },
    decelerate: true,                     //Enables move deceleration (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#decelerate)
    decelerateOptions: {                  //Options object for viewport decelerate plugin (https://davidfig.github.io/pixi-viewport/jsdoc/global.html#DecelerateOptions)
      friction: 0.95,
      bounce: 0.8,
      minSpeed: 0.01,
    },
    bounce: true,                         //Enables bouncing on borders (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#bounce)
    bounceOptions: {                      //Options object for viewport bounce plugin (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#bounce)
      sides: 'all',
      friction: 0.5,
      time: 150,
      ease: 'easeInOutSine',
      underflow: 'center',
    },
    bounceHeightFactor: 0.5,              //Percent of full board height to keep visible in bounding box (assuming zoomed out fully)
    bounceWidthFactor: 0.5,               //Percent of full board width to keep visible in bounding box (assuming zoomed out fully)
    clampZoom: true,                      //Enables clamping zoom on viewport (https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#clampZoom)
    clampZoomHeightFactor: 1.1,           //Factor for multiply with full board height during zoom clamping
    clampZoomWidthFactor: 1.1,            //Factor for multiply with full board width during zoom clamping
    snapOptions: {                        //Options object during viewport snap move (https://davidfig.github.io/pixi-viewport/jsdoc/global.html#SnapOptions)
      friction: 0.8,
      time: 1000,
      ease: 'easeInOutSine',
    },
    snapZoomOptions: {                    //Options object during viewport snap zooming (https://davidfig.github.io/pixi-viewport/jsdoc/global.html#SnapZoomOptions)
      time: 1000,
      ease: 'easeInOutSine',
    }
  },
  fps: {
    show: false,                          //Enables FPS counter
    fpsTextOptions: {                     //Text options for FPS counter (https://pixijs.download/dev/docs/PIXI.TextStyle.html)
      align: 'center',
      fontFamily: 'Arial',
      fontSize: 30,
      fontStyle: 'normal',
      fontWeight: 'normal',
      textBaseline: 'alphabetic',
    },
    min: 20,                              //Set minimum fps (https://pixijs.download/dev/docs/PIXI.Ticker.html#minFPS)
    max: 0,                               //Set maximum fps (https://pixijs.download/dev/docs/PIXI.Ticker.html#maxFPS)
  },
  background: {
    showRectangle: true,                  //Show checkered rectangle background instead of solid background
    blur: true,                           //Apply blur filter on the background
    blurStrength: 3,                      //Blur strength
    blurQuality: 3,                       //Blur quality (how many gaussian blur passes to apply)
    striped: true,                        //If set to true, a background with diagonal stripes will be shown behind timelines that would be inactive.
                                          //This makes it easy to see how many inactive timelines there are and how many timelines can be created before they become inactive.
    stripeRatio: 0.333,                   //Value between `0` and `1`, representing the ratio between shaded/non-shaded areas of the striped background.
                                          //A value of `0` will cause the background to not show any stripes, a value of `1` to have the background be a flat shade of the stripe colors.
                                          //A value of `0.5` will cause the stripes to take up half of the area. Default is `0.333`.
    expandDuration: 1000,                 //Duration for the non-striped expansion animation
  },
  board: {
    showWhite: true,                      //Show white turn boards
    showBlack: true,                      //Show black turn boards
    marginHeight: 160,                    //Board margin height
    marginWidth: 160,                     //Board margin width
    borderHeight: 50,                     //Board border height
    borderWidth: 50,                      //Board border width
    borderRadius: 45,                     //Board border radius (for rounded rectangle)
    borderLineWidth: 12,                  //Board border outline width
    flipTimeline: false,                  //Flip the boards along the timelines axis
    flipTurn: false,                      //Flip the boards along the turn axis
    flipRank: false,                      //Flip the pieces / squares along the rank axis
    flipFile: false,                      //Flip the pieces / squares along the file axis
    slideBoard: false,                    //Enables the sliding board animation
    fadeDuration: 450,                    //Duration for the fade in / fade out animation
    showGhost: true,                      //Show ghost board
    ghostAlpha: 0.4,                      //Alpha value for ghost board
    showPresentBlink: true,               //Enable blinking animation for present board
    blinkDuration: 350,                   //Duration each blink cycle
  },
  boardLabel: {
    showTimeline: true,                   //Show timeline labels
    showMiddleTimeline: false,            //Show timeline labels in the middle boards
    rotateTimelineLabel: true,            //Rotate timeline labels 90 degrees
    timelineTextOptions: {                //Text options for timeline labels (https://pixijs.download/dev/docs/PIXI.TextStyle.html)
      align: 'center',
      fontFamily: 'Times New Roman',
      fontSize: 96,
      fontStyle: 'italic',
      fontWeight: 'bold',
      textBaseline: 'alphabetic',
    },
    showTurn: true,                       //Show turn labels
    turnTextOptions: {                    //Text options for turn labels (https://pixijs.download/dev/docs/PIXI.TextStyle.html)
      align: 'center',
      fontFamily: 'Times New Roman',
      fontSize: 96,
      fontStyle: 'italic',
      fontWeight: 'bold',
      textBaseline: 'alphabetic',
    },
    showFile: true,                       //Show file labels
    fileTextOptions: {                    //Text options for file labels (https://pixijs.download/dev/docs/PIXI.TextStyle.html)
      align: 'center',
      fontFamily: 'Times New Roman',
      fontSize: 36,
      fontStyle: 'normal',
      fontWeight: 'bold',
      textBaseline: 'alphabetic',
    },
    showRank: true,                       //Show rank labels
    rankTextOptions: {                    //Text options for rank labels (https://pixijs.download/dev/docs/PIXI.TextStyle.html)
      align: 'center',
      fontFamily: 'Times New Roman',
      fontSize: 36,
      fontStyle: 'normal',
      fontWeight: 'bold',
      textBaseline: 'alphabetic',
    },
    fadeDuration: 250,                    //Duration for fade in / fade out animation
  },
  boardShadow: {
    show: true,                           //Show board shadow
    offsetX: 40,                          //Offset x position
    offsetY: 40,                          //Offset y position
    alpha: 0.25,                          //Alpha value of the board shadow
  },
  promotion: {
    borderHeight: 30,                     //Promotion menu border height
    borderWidth: 30,                      //Promotion menu border width
    borderRadius: 28,                     //Promotion menu border radius (for rounded rectangle)
    borderLineWidth: 8,                   //Promotion menu border outline width
    fadeDuration: 150,                    //Duration for fade in / fade out animation
  },
  promotionShadow: {
    show: true,                           //Show promotion menu shadow
    offsetX: 25,                          //Offset x position
    offsetY: 25,                          //Offset y position
    alpha: 0.25,                          //Alpha value of the promotion menu shadow
  },
  square: {
    height: 100,                          //Board square height
    width: 100,                           //Board square width
    fadeDuration: 150,                    //Duration for fade in / fade out animation
  },
  piece: {
    fadeDuration: 150,                    //Duration for fade in / fade out animation
    roundPixel: true,                     //Disable pixel interpolation (https://pixijs.download/dev/docs/PIXI.settings.html#ROUND_PIXELS)
  },
  arrow: {
    lutInterval: 10,                      //Bezier lookup table density, only applies to curved arrows (http://pomax.github.io/bezierjs/#getLUT)
    headSize: 35,                         //Arrowhead size
    size: 12,                             //Arrow line width
    midpointRadius: 11,                   //Radius of the middle point
    outlineSize: 22,                      //Arrow outline width
    animateDuration: 650,                 //Duration for arrow animations (animate in and out)
    alpha: 0.6,                           //Alpha value of the arrow
    showSpatial: false,                   //Show spatial move arrows
    spatialCurved: true,                  //Use curved arrows for spatial moves
    spatialSplitCurve: false,             //Split the curved arrow into two bezier curves
    spatialMiddle: false,                 //Draw arrow with middle point
    spatialRealEnd: false,                //Use the real end position of a 5d-chess-js move object
    showNonSpatial: true,                 //Show non-spatial move arrows
    nonSpatialCurved: true,               //Use curved arrows for non-spatial moves
    nonSpatialSplitCurve: true,           //Split the curved arrow into two bezier curves
    nonSpatialMiddle: true,               //Draw arrow with middle point
    nonSpatialRealEnd: true,              //Use the real end position of a 5d-chess-js move object
    showCheck: true,                      //Show check arrows
    checkCurved: true,                    //Use curved arrows for check arrows
    showCustom: true,                     //Show custom arrows
    customCurved: true,                   //Use curved arrows for custom arrows
    customSplitCurve: true,               //Split the curved arrow into two bezier curves
  },
  highlight: {
    hoverAlpha: 0.4,                      //Alpha value for available move highlight (while hovering)
    pastHoverAlpha: 0.2,                  //Alpha value for past available move highlight (while hovering)
    selectedAlpha: 0.6,                   //Alpha value for available move highlight (while selected)
    pastSelectedAlpha: 0.4,               //Alpha value for past available move highlight (while selected)
    fadeDuration: 75,                     //Duration for fade in / fade out animation
  },
  ripple: {
    timelineDuration: 0,                  //Delay for ripple animation (increasing by timeline)
    turnDuration: 0,                      //Delay for ripple animation (increasing by turn)
    rankDuration: 15,                     //Delay for ripple animation (increasing by rank)
    fileDuration: 15,                     //Delay for ripple animation (increasing by file)
  },
  selector: {
    deselectOnMove: true,                 //Deselect piece on move selection
  },
}
```