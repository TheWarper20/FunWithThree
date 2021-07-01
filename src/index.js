import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertex from "./shaders/vertex.glsl";
import frag from "./shaders/frag.glsl";
import planeFrag from "./shaders/planeFrag.glsl";
import planeVertex from "./shaders/planeVertex.glsl";

import dat from "dat.gui";

class Gl {
  constructor(container) {
    this.container = container;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer.domElement.style.position = "fixed";
    this.renderer.domElement.style.top = 0;
    this.renderer.domElement.style.left = 0;
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.pickPosition = { x: 0.0, y: 0.0 };
    this.mousePosition = new THREE.Vector4();
    this.options = {
      plane: {
        plane_bg_color: 0x00
      },
      trianglesInfo: {
        number: 30,
        triangleSize: 0.06,
        color: 0xffffff,
        material: new THREE.MeshStandardMaterial({
          color: 0xffffff,
          side: THREE.FrontSide
        }),
        emissive: 0x00,
        roughness: 0.0,
        wireframe: false,
        metalness: 0.0
      },
      sphereConfig: {
        size: 2,
        color: 0xfffff,
        reflectivity: 0.2
      }
    };
    // Config
    // Grid
    this.gridInfo = {
      columns: {
        count: 10,
        size: 0.2
      },
      rows: {
        count: 5,
        size: 0.3
      }
    };
    this.gridMaterial = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3() }
      }
    });

    this.lightsConfig = {
      directional: {
        color: 0xfffff,
        int: 0.125,
        enable: true
      },
      point: {
        color: 0xfffff,
        int: 1,
        distance: 0,
        decay: 1,
        enable: true
      },
      amb: {
        color: 0xfffff,
        int: 1,
        enable: true
      }
    };

    container.append(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;
    this.camera.layers.enable(0); // enabled by default
    this.camera.layers.enable(1);

    // Rendering objects
    this.trianglesCollection = [];

    this.drawPlane();
    this.renderSphere();
    // console.log(this.sphere);
    // this.renderTriangles();
    this.addLights();

    this.clock = new THREE.Clock();

    this.initGUI();
  }
  addControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }
  addLights() {
    this.ambientLight = new THREE.AmbientLight(
      this.lightsConfig.amb.color,
      this.lightsConfig.amb.int
    );
    this.ambientLight.position.set(0, 0, 47.8);

    this.directionalLight = new THREE.DirectionalLight(
      this.lightsConfig.directional.color,
      this.lightsConfig.directional.int
    );

    this.pointLight = new THREE.PointLight(
      this.lightsConfig.point.color,
      this.lightsConfig.point.int,
      this.lightsConfig.point.distance,
      this.lightsConfig.point.decay
    );
    this.pointLight.position.set(0, 0, 47.8);

    const pointLightHelper = new THREE.PointLightHelper(this.pointLight, 1);

    this.scene.add(this.ambientLight);
    this.scene.add(this.directionalLight);
    this.scene.add(this.pointLight);
    this.scene.add(pointLightHelper);
  }
  renderSphere() {
    var sphere_geometry = new THREE.SphereGeometry(
      this.options.sphereConfig.size,
      128,
      128
    );
    var material = new THREE.MeshPhysicalMaterial({
      color: this.options.sphereConfig.color,
      reflectivity: this.options.sphereConfig.reflectivity
    });
    this.sphere = new THREE.Mesh(sphere_geometry, material);
    this.sphereVertInfo = {
      length: this.sphere.geometry.vertices.length,
      topSection: this.sphere.geometry.vertices.length * 0.3,
      bottomSection:
        this.sphere.geometry.vertices.length -
        this.sphere.geometry.vertices.length * 0.3
    };
    this.sphere.layers.set(1);
    this.sphere.renderOrder = 2;
  }
  renderTriangles() {
    var _this = this;
    if (_this.trianglesCollection.length) {
      for (let index = 0; index < _this.trianglesCollection.length; index++) {
        _this.plane.remove(_this.trianglesCollection[index]);
      }
    }
    for (let index = 0; index < this.options.trianglesInfo.number; index++) {
      var geom = new THREE.Geometry();
      let posX = Math.random() * 2 - 1;
      let posY = Math.random() * 2 - 0.75;
      geom.vertices.push(new THREE.Vector3(posX, posY, 0));
      geom.vertices.push(
        new THREE.Vector3(
          posX + this.options.trianglesInfo.triangleSize,
          posY - Math.random() * 0.07,
          Math.random() * 0.3
        )
      );
      geom.vertices.push(
        new THREE.Vector3(
          posX + this.options.trianglesInfo.triangleSize,
          posY + this.options.trianglesInfo.triangleSize,
          0
        )
      );

      geom.faces.push(new THREE.Face3(0, 1, 2));
      geom.computeFaceNormals();

      var triangleMesh = new THREE.Mesh(
        geom,
        this.options.trianglesInfo.material
      );
      let distanceFromCamera = Math.random() * 0.08;
      triangleMesh.doubleSided = true;
      triangleMesh.position.set(0, 0, distanceFromCamera - 0.06 + 48);
      triangleMesh.layers.set(1);
      triangleMesh.renderOrder = 2;
      this.trianglesCollection.push(triangleMesh);

      this.plane.add(triangleMesh);
    }
  }
  initGUI() {
    // GUI
    const gui = new dat.GUI();
    var options = this.options;
    var plane = this.plane;

    const backgroundFolder = gui.addFolder("Background");
    backgroundFolder
      .addColor(options.plane, "plane_bg_color")
      .name("Color")
      .onChange(() => {
        const color = new THREE.Color(options.plane.plane_bg_color);
        plane.material.uniforms.color.value.set(color.r, color.g, color.b);
      });
    const trianglesFolder = gui.addFolder("Triangles");

    trianglesFolder
      .add(this.options.trianglesInfo, "triangleSize", 0, 100)
      .name("Triangle Size")
      .onChange(() => {
        this.renderTriangles();
      });
    trianglesFolder
      .add(this.options.trianglesInfo, "number", 0, 100)
      .name("Number of triangles")
      .onChange(() => {
        this.renderTriangles();
      });

    trianglesFolder
      .addColor(this.options.trianglesInfo, "color")
      .name("Color")
      .onChange(() => {
        this.options.trianglesInfo.material.color.setHex(
          this.options.trianglesInfo.color
        );
        this.renderTriangles();
      });
    // emissive: 0x00,
    // roughness: 0.0,
    // wireframe: false,
    // metalness: 0.0
    trianglesFolder
      .addColor(this.options.trianglesInfo, "emissive")
      .name("Emissive Color")
      .onChange(() => {
        this.options.trianglesInfo.material.emissive.setHex(
          this.options.trianglesInfo.emissive
        );
        this.renderTriangles();
      });

    trianglesFolder
      .add(this.options.trianglesInfo, "wireframe")
      .onChange(() => {
        this.renderTriangles();
      });
    trianglesFolder
      .add(this.options.trianglesInfo, "roughness")
      .name("Roughness")
      .min(0)
      .max(1)
      .step(0.1)
      .listen()
      .onChange(() => {
        this.options.trianglesInfo.material.roughness = this.options.trianglesInfo.roughness;
        this.renderTriangles();
      });

    trianglesFolder
      .add(this.options.trianglesInfo, "metalness")
      .name("metalness")
      .min(0)
      .max(1)
      .step(0.1)
      .listen()
      .onChange(() => {
        this.options.trianglesInfo.material.metalness = this.options.trianglesInfo.metalness;
        this.renderTriangles();
      });

    const directionLightFolder = gui.addFolder("Directional Light");
    const ambLightFolder = gui.addFolder("Ambient Light");
    const pointLightFolder = gui.addFolder("Point Light");

    ambLightFolder
      .addColor(this.lightsConfig.amb, "color")
      .name("Color")
      .onChange(() => {
        this.ambientLight.color.setHex(this.lightsConfig.amb.color);
      });
    ambLightFolder
      .add(this.lightsConfig.amb, "int", 0, 100)
      .name("Intesity")
      .onChange(() => {
        this.ambientLight.intensity = this.lightsConfig.amb.int;
      });

    directionLightFolder
      .addColor(this.lightsConfig.directional, "color")
      .name("Color")
      .onChange(() => {
        this.directionalLight.color.setHex(this.lightsConfig.directional.color);
      });
    directionLightFolder
      .add(this.lightsConfig.directional, "int", 0, 100)
      .name("Intesity")
      .onChange(() => {
        this.directionalLight.intensity = this.lightsConfig.directional.int;
      });

    pointLightFolder
      .addColor(this.lightsConfig.point, "color")
      .name("Color")
      .onChange(() => {
        this.pointLight.color.setHex(this.lightsConfig.point.color);
      });
    pointLightFolder
      .add(this.lightsConfig.point, "int", 0, 100)
      .name("Intesity")
      .onChange(() => {
        this.pointLight.intensity = this.lightsConfig.point.int;
      });
    pointLightFolder
      .add(this.lightsConfig.point, "decay", 0, 100)
      .name("Decay")
      .onChange(() => {
        this.pointLight.decay = this.lightsConfig.point.decay;
      });
    pointLightFolder
      .add(this.lightsConfig.point, "distance", 0, 100)
      .name("Distance")
      .onChange(() => {
        this.pointLight.distance = this.lightsConfig.point.distance;
      });
  }
  getViewSizeAtDepth(depth = 0) {
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const height = Math.abs(
      (this.camera.position.z - depth) * Math.tan(fovInRadians / 2) * 2
    );
    return { width: height * this.camera.aspect, height };
  }

  init() {
    this.addEvents();
  }
  drawPlane() {
    const viewSize = this.getViewSizeAtDepth();

    const bg_plane_material = new THREE.MeshPhongMaterial({
      color: this.options.plane_bg_color,
      side: THREE.DoubleSide
    });
    bg_plane_material.depthTest = true;
    bg_plane_material.depthWrite = false;
    const uniforms = THREE.UniformsLib["lights"];
    uniforms.iTime = { value: 0 };
    uniforms.iResolution = { value: new THREE.Vector3() };
    uniforms.color = { value: new THREE.Vector3(0.05, 0.05, 0.05) };
    uniforms.iMouse = {
      value: new THREE.Vector2(this.pickPosition.x, this.pickPosition.y)
    };

    const planeMaterial = new THREE.ShaderMaterial({
      fragmentShader: planeFrag,
      uniforms: uniforms,
      lights: true
    });
    planeMaterial.depthTest = true;
    planeMaterial.depthWrite = false;

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(viewSize.width, viewSize.height),
      planeMaterial
    );
    // console.log(plane);
    this.plane.layers.set(0);
    this.plane.visible = true;
    this.plane.renderOrder = 0;

    this.scene.add(this.plane);
  }
  drawGrid() {
    for (let index = 0; index < this.gridInfo.rows.count; index++) {
      this.generateRows(index);
    }
    for (let colIndex = 0; colIndex < this.gridInfo.columns.count; colIndex++) {
      this.generateColumns(colIndex);
    }
  }

  generateRows(rowNum) {
    const points = [];

    let rowTop =
      this.gridInfo.rows.size - (this.gridInfo.rows.size * rowNum) / 2;
    points.push(new THREE.Vector3(-1.2, rowTop, 0));
    points.push(new THREE.Vector3(1.2, rowTop, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, this.gridMaterial);
    this.scene.add(line);
  }
  generateColumns(colIdx) {
    const points = [];
    let colLeft =
      -(1 - this.gridInfo.columns.size) + this.gridInfo.columns.size * colIdx;

    points.push(new THREE.Vector3(colLeft, 0.5, 0));
    points.push(new THREE.Vector3(colLeft, -0.5, 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, this.gridMaterial);
    this.scene.add(line);
  }

  addEvents() {
    window.requestAnimationFrame(this.run.bind(this));
    // window.addEventListener("mousemove", (event) => {
    //   this.setPickPosition(event, this);
    // });
    window.addEventListener("mousedown", () => {
      this.mousePosition.setZ(1);
      this.counter = 0;
    });

    window.addEventListener("mouseup", () => {
      this.mousePosition.setZ(0);
    });

    window.addEventListener("mousemove", (event) => {
      this.mousePosition.setX(event.clientX);
      this.mousePosition.setY(this.renderer.domElement.height - event.clientY);
    });
    window.addEventListener("resize", this.onResize.bind(this), false);
  }

  run() {
    requestAnimationFrame(this.run.bind(this));
    this.render();
  }

  render() {
    var t = this.clock.getElapsedTime();
    const canvas = this.renderer.domElement;
    this.plane.material.uniforms.iTime.value = t;
    this.plane.material.uniforms.iResolution.value.set(
      canvas.width,
      canvas.height,
      1
    );
    this.plane.material.uniforms.iMouse.value = this.mousePosition;
    // for (let index = 0; index < this.trianglesCollection.length; index++) {
    //   this.trianglesCollection[index].rotation.x = -Math.PI / 2;
    // }
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const w = this.container.offsetWidth;
    const h = this.container.offsetHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
  }
  getCanvasRelativePosition(event, ctx) {
    const rect = ctx.renderer.domElement.getBoundingClientRect();
    return {
      x:
        ((event.clientX - rect.left) * ctx.renderer.domElement.width) /
        rect.width,
      y:
        ((event.clientY - rect.top) * ctx.renderer.domElement.height) /
        rect.height
    };
  }

  setPickPosition(event, ctx) {
    const pos = ctx.getCanvasRelativePosition(event, ctx);
    ctx.pickPosition.x = (pos.x / ctx.renderer.domElement.width) * 2 - 1;
    ctx.pickPosition.y = (pos.y / ctx.renderer.domElement.height) * -2 + 1; // note we flip Y
    console.log(ctx.pickPosition);
  }
}

var gl = new Gl(document.getElementById("app"));
gl.init();
