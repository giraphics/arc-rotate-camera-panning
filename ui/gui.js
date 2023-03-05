var mainarea = null;
var gwidth = 800;
var gheight = 640;

export default class Gui {
  constructor(store, canvas, canvasOverlay, canvasAreaWidthPx, canvasAreaHeightPx) {
    this.store = store;

    this.canvas = canvas;
    this.canvasOverlay = canvasOverlay;

    this.canvasAreaWidthPx = canvasAreaWidthPx;
    this.canvasAreaHeightPx = canvasAreaHeightPx;
    this.canvasLeftSharePx = canvasAreaWidthPx * 0.5;

    if (this.canvas) {
      this.canvas.width = this.canvasLeftSharePx > gwidth ? gwidth : this.canvasLeftSharePx;
      this.canvas.height = this.canvasAreaHeightPx > gheight ? gheight : this.canvasAreaHeightPx;
    }
  }

  setup() {
    LiteGUI.init();

    /*
      ┌──────────────────────────┬──────┐
      │  canvas place holder     │      │
      │                          │right │
      |                          | panel│
      │                          │      │
      └──────────────────────────┴──────┘
    */
      this.manageLayoutArea();

    /*
      ┌──────────────────────────┬──────┐
      │ ┌─────────────────────┐  │      │
      │ │                     │  │      │
      │ │        canvas       │  │right │
      │ │                     │  │ panel│
      │ └─────────────────────┘  │      │
      └──────────────────────────┴──────┘
    */
      this.manageCanvas();

    /*
      ┌──────────────────────────┬──────┐
      │ ┌─────────────────────┐  │ ==== │
      │ │                     │  │ ==== │
      │ │        canvas       │  │right │
      │ │                     │  │ panel│
      │ └─────────────────────┘  │      │
      └──────────────────────────┴──────┘
    */
      this.createSidePanel();

    // Update any gui change request at a fixed frequency.
    setInterval(
      function () {
        this.updateGui();
      }.bind(this),
      100,
    );
  }

  manageLayoutArea() {
    // Create canvas area
    mainarea = new LiteGUI.Area({
      id: 'mainarea',
      content_id: 'canvasarea',
      height: 'calc( 100% - 20px )',
      main: true,
      inmediateResize: true,
    });
    LiteGUI.add(mainarea);

    mainarea.onresize = function () {};

    mainarea.split('horizontal', [this.canvasAreaWidthPx, null], true);
    this.canvasAndBottomPanelArea = mainarea.getSection(0); // Horizontal left side area
    this.sidePanelArea = mainarea.getSection(1); // Horizontal right side area

    this.canvasAndBottomPanelArea.onresize = function () {};
  }

  updateGui() {
    if (this.store.isGuiDirty) {
      this.store.isGuiDirty = false;
      this.createSidePanel();
    }

    var rect = this.canvas.parentNode.getClientRects()[0];
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  manageCanvas() {
    if (this.canvas) {
      if (this.canvasOverlay){
        this.canvasAndBottomPanelArea.content.appendChild(this.canvasOverlay);
      }
      this.canvasAndBottomPanelArea.content.appendChild(this.canvas);

      this.canvasAndBottomPanelArea.onresize = function () {
        if (this.canvas){
          var rect = this.canvas.parentNode.getClientRects()[0];
          this.canvas.width = rect.width > gwidth ? gwidth : rect.width;
          this.canvas.height = rect.height > gheight ? gheight : rect.height;
          console.log("Canvas Left Resize: " + this.canvas.width + ", " + this.canvas.height);
        }
      }.bind(this);
    }
  }

  createSidePanel() {
    this.removeSidePanel();
    this.addSidePanel();
  }

  addSidePanel() {
    var docked = new LiteGUI.Panel('right_panel', { title: 'Docked panel', close: true });
    this.sidePanelArea.add(docked);
    LiteGUI.bind(docked, 'closed', function () {
      mainarea.merge();
    });
    window.sidepanel = docked;
    this.updateSidePanel(docked, this.store);
  }

  removeSidePanel() {
    LiteGUI.remove(window.sidepanel);
  }

  updateSidePanel(root, store) {
    root = root || window.sidepanel;
    root.content.innerHTML = '';
    // Create category tabs
    this.createSidePanelTabs(window.sidepanel);
    {
      // Side panel - General tab inspector widgets
      this.createGeneralTabInspector();
      { 
        this.createAnimationDurationWidgets(this.inspectorWidgets, store);
           
        if (this.store.currentSelection == this.store.box) {
          this.createCubeWidgets(this.inspectorWidgets, store);
        }
        else if (this.store.currentSelection == this.store.icosphere) {
          this.createIcoSphereWidgets(this.inspectorWidgets, store);
        }
        else if (this.store.currentSelection == this.store.cylinder) {
          this.createCylinderWidgets(this.inspectorWidgets, store);
        }
      }
    }
  }

  createSidePanelTabs(root) {
    this.categoryTab = new LiteGUI.Tabs();
    this.categoryTab.addTab('General');
    root.add(this.categoryTab);
  }

  createGeneralTabInspector() {
    this.inspectorWidgets = new LiteGUI.Inspector();
    var inspectorWidgets = this.inspectorWidgets;
    inspectorWidgets.onchange = function (name, value, widget) {
      console.log('Widget change: ' + name + ' -> ' + value);
    };
    this.categoryTab.getTabContent('General').appendChild(inspectorWidgets.root);
  }

  createAnimationDurationWidgets(inspectorWidgets, store) {
    inspectorWidgets.addSection('Animation');
    inspectorWidgets.addSlider('Amplitude', store.animationAmplitude, {
      min: 0.1,
      max: store.animationAmplitude,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.animationAmplitude = x;
        store.applyBouncing(store.transformNode ,store.animationAmplitude, store.animationDuration);
      },
    });
    inspectorWidgets.addNumber('Duration (Milliseconds)', store.animationDuration, {
      name_width: 200,
      callback: function (value) {
        store.animationDuration = value;
        store.applyBouncing(store.transformNode, store.animationAmplitude, store.animationDuration);
      },
    });
    inspectorWidgets.addSeparator();
  }

  createIcoSphereWidgets(inspectorWidgets, store) {
    inspectorWidgets.addSection('Ico Sphere');
    inspectorWidgets.addSlider('Diameter', store.icoSphereDiameter, {
      min: 0.1,
      max: 2,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.icoSphereDiameter = x;
        store.sceneDirty = true;
      },
    });
    inspectorWidgets.addSlider('Subdivisions', store.icoSphereSubdivisions, {
      min: 1,
      max: 10,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.icoSphereSubdivisions = Math.floor(x);
        store.sceneDirty = true;
      },
    });
  }

  createCylinderWidgets(inspectorWidgets, store) {
    inspectorWidgets.addSection('Cylinder');
    inspectorWidgets.addSlider('Height', store.cylinderHeight, {
      min: 0.1,
      max: 2,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.cylinderHeight = x;
        store.sceneDirty = true;
      },
    });
    inspectorWidgets.addSlider('Diameter', store.cylinderDiameter, {
      min: 0.1,
      max: 2,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.cylinderDiameter = x;
        store.sceneDirty = true;
      },
    });
  }

  createCubeWidgets(inspectorWidgets, store) {
    inspectorWidgets.addSection('Cube');
    inspectorWidgets.addSlider('Width', store.boxWidth, {
      min: 0.1,
      max: 2,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.boxWidth = x;
        store.sceneDirty = true;
      },
    });
    inspectorWidgets.addSlider('Height', store.boxHeight, {
      min: 0.1,
      max: 2,
      step: 1,
      empadding: '2',
      callback: function (x) {
        store.boxHeight = x;
        store.sceneDirty = true;
      },
    });
    inspectorWidgets.addSlider('Depth', store.boxDepth, {
      min: 0.1,
      max: 2,
      step: 1,
      empadding: '10',
      callback: function (x) {
        store.boxDepth = x;
        store.sceneDirty = true;
      },
    });
  }  
}
