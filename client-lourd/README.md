# Polydraw-Project2

Second university development project. Recquires installing [NodeJS](https://nodejs.org/en/) as there is currently no host. Run commands "npm install" then "npm start" under client folder to view website. Do the same but under server folder to start server.

Currently undergoing fourth sprint. This will introduce new tools (Airbrush, Quill, Paint Bucket), selection manipulation (Translation, Rotation, Scaling), a grid magnet, and a global database for storing and sharing data.

Following features were implemented during third sprint:

    - The ability to export a screenshot of the drawing into various image files (.bmp, .jpg, .png, .svg).
    
    - The ability to input text. Font, alignment, size, bold, and italics can be set. Arrow keys allow user to move arround currently inputed text. Note that all clicks outside of text zone apply the text.
    
    - An eraser tool. Can be applied using clicks or dragging.
    
    - Undo/Redo commands
    
    - A pen tool. The width changes with respect to mouse speed.
    
    - The ability to save and open savefiles locally.
    
    - A general clipboard for copying, cutting, pasting, deletion, and duplication
    
    - Much better overall preformance
    
    - Better support for Linux and Mac
    
    - Support for most chromium browsers and Firefox

Following features were implemented during second sprint:

    - Server allowing for saving and filtering drawings using tags
    
    - Gallery where user can view preview of all drawings on the server, filter them by tag, and open them
    
    - Basic selection tool
    
    - New shapes: Ellipses (Shift forces to circle) and Polygon (Regular polygons, 3 to 12 sides)
    
    - Line tool for creating straight lines. Double click ends the line. Holding shift key closes the line.
    
    - Eyedropper tool for getting color of clicked element. Left click applies to primary color, right to secondary.
    
    - Stamp tool for adding stickers. Mousewheel rotates stamp by 15 degrees. Can be set to 1 degrees by holding alt (Chrome) or          
    ctrl+alt (Firefox, Opera)
    
    - A grid with adjustable scale and opacity.

Following features were implemented during first sprint:

    - The skeleton for the UI

    - A welcome message which can be disabled upon further visits

    - The ability to create a new drawing by defining width, height, and background color (Either through a palette, RGBA, or Hexadecima
    color values). Form dimensions are auto-ajusted to workspace dimensions until user inputs are detected.

    - A canvas for drawing and inserting shapes

    - A pencil tool under which the stroke width can be adjusted

    - A paintbrush tool under which the stroke width can be adjusted. Choice of 5 seperate textures are implemented, the first currently  
    being the pencil texture (Because eventually, user will be able to define the "splash" ratio of the paintbrush).

    - A shapes tool under which the user can currently insert a rectangle. The border width can be defined. Shift key forces shape into     a square

    - A color tool which is always displayed at the bottom of the properties section. User can define primary and secondary colors,         switch these colors, define their transparency, and change background color. Tool also displays last ten colors used.

    - A color applicator tool. This applies current primary and secondary colors to clicked objects
  
Curent shortcuts:

    Ctrl+O: Create new drawing
    Ctrl+S: Save drawing
    Ctrl+G: Drawing gallery
    Ctrl+E: Export to image
    
    Ctrl+Z: Undo
    Ctrl+Shift+Z: Redo (School requirements, will be changed to Ctrl+Y later)
    Ctrl+A: Select All
    Ctrl+C: Copy
    Ctrl+V: Paste
    Ctrl+X: Cut
    Ctrl+D: Duplicate
    Delete: Delete
    
    C: Pencil
    Y: Pen
    W: Paintbrush
    1: Rectangle
    2: Ellipses
    3: Polygon
    R: Color applicator
    L: Line
    I: Eyedropper
    S: Selection
    T: Text
    G: Show grid
    E: Eraser
    +: Increase grid square size
    -: Decrease grid square size
    
