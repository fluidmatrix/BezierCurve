import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Initialize the scene
const scene = new THREE.Scene();
var clock = new THREE.Clock();

// Initialize the camera
const camera = new THREE.PerspectiveCamera(
    60,  // Field of view (60 degrees)
    window.innerWidth / window.innerHeight,  // Aspect ratio based on window size
    0.1,  // Near clipping plane
    200  // Far clipping plane
);

// Constants for hyperbolic paraboloid (change to modify the shape)
var a = 2.0;
var b = 1.0;

// Function to calculate the z position for the hyperbolic paraboloid
function f(u, v, p) {
    let x = u * 2 - 1; // Transform u to the domain [-1, 1]
    let y = v * 2 - 1; // Transform v to the domain [-1, 1]
    p.set(x, y, (x * x) / (a * a) - (y * y) / (b * b)); // Formula for hyperbolic paraboloid
}

// Function to create the grid (axis helper)
function createPlaneGrid(size, steps) {
    const group = new THREE.Group(); // Create a group to hold all grid lines
    const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });

    // X-direction grid lines
    for (let i = 0; i <= steps; i++) {
        let f = (i / steps) - 0.5;
        let geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(f * size, -size * 0.5, 0), new THREE.Vector3(f * size, size * 0.5, 0));
        let line = new THREE.Line(geometry, material); // Create the line
        group.add(line); // Add the line to the group
    }

    // Y-direction grid lines
    for (let i = 0; i <= steps; i++) {
        let f = (i / steps) - 0.5;
        let geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-size * 0.5, f * size, 0), new THREE.Vector3(size * 0.5, f * size, 0));
        let line = new THREE.Line(geometry, material); // Create the line
        group.add(line); // Add the line to the group
    }

    return group; // Return the complete grid
}

// Axis Helper Creation (for reference)
function axisArrow(color) {
    const group = new THREE.Group();
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: color, specular: 0x222222, shininess: 100 });

    const arrowCylinder = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 32); // Create cylinder for arrow shaft
    const arrowCone = new THREE.ConeGeometry(0.03, 0.1, 32); // Create cone for arrowhead

    const cylinder = new THREE.Mesh(arrowCylinder, arrowMaterial);
    cylinder.position.set(0, 0.125, 0); // Position the cylinder
    group.add(cylinder);

    const cone = new THREE.Mesh(arrowCone, arrowMaterial);
    cone.position.set(0, 0.275, 0); // Position the cone
    group.add(cone);

    return group; // Return the axis arrow (shaft + cone)
}

// Axis helper to create all 3 axes (x, y, z)
function axisHelper() {
    const group = new THREE.Group(); // Create a new group for the axes
    const xAxis = axisArrow(new THREE.Color(0.0, 1.0, 0.0)); // Green for x-axis
    const yAxis = axisArrow(new THREE.Color(1.0, 0.0, 0.0)); // Red for y-axis
    const zAxis = axisArrow(new THREE.Color(0.0, 0.0, 1.0)); // Blue for z-axis

    // Rotate x and z axes to proper orientations
    xAxis.rotateZ(-Math.PI * 0.5);
    zAxis.rotateX(Math.PI * 0.5);

    group.add(xAxis); // Add x-axis
    group.add(yAxis); // Add y-axis
    group.add(zAxis); // Add z-axis

    // Cube to represent the origin
    const cubeGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, specular: 0x222222, shininess: 100 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    group.add(cube); // Add the cube to the group

    return group; // Return the complete axis helper group
}

// Create the hyperbolic paraboloid geometry using BufferGeometry (manually calculate)
const geometry = new THREE.BufferGeometry();

// Number of divisions in the u and v directions (grid size)
const uDivisions = 50;
const vDivisions = 50;

// Create the position and color arrays for the geometry
const positions = [];
const colors = [];

// Generate the vertices and colors
for (let i = 0; i <= uDivisions; i++) {
    for (let j = 0; j <= vDivisions; j++) {
        const u = i / uDivisions;  // U parameter in range [0, 1]
        const v = j / vDivisions;  // V parameter in range [0, 1]

        const p = new THREE.Vector3();
        f(u, v, p); // Calculate the position (x, y, z)

        positions.push(p.x, p.y, p.z); // Push the calculated position to the positions array

        // Use the u and v parameters to create a gradient effect
        const color = new THREE.Color(u, v, Math.abs(p.z) / 2); // Gradients based on u, v, and z
        colors.push(color.r, color.g, color.b); // Push the colors to the colors array
    }
}

// Set the attributes for positions and colors
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// Create the material for the mesh (with vertex colors)
const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors, // Use vertex colors
    color: 0xFF1df0,
    side: THREE.DoubleSide
});

// Create the mesh for the hyperbolic paraboloid
const paraboloid = new THREE.Mesh(geometry, material);
paraboloid.scale.setScalar(2); // Scale the paraboloid mesh
scene.add(paraboloid); // Add the paraboloid to the scene

// Plane Grid (to show as a reference)
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0x505050, wireframe: true, transparent: true, opacity: 0.25 })
);
plane.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat
scene.add(plane); // Add the plane to the scene

// Add axis helpers (showing x, y, z axes)
const axisOrigin = axisHelper();
axisOrigin.scale.setScalar(2)
scene.add(axisOrigin); // Add the axis helper to the scene

// Add ambient lighting (soft lighting everywhere)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
scene.add(ambientLight); // Add the ambient light to the scene

// Add directional light (to simulate sunlight)
const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(100, 100, 100); // Position the sun light
sunLight.castShadow = true; // Enable shadows from the light
scene.add(sunLight); // Add the sun light to the scene

// Initialize the camera position
camera.position.x = 10;
camera.position.y = 2;

// Renderer setup
const canvas = document.querySelector("canvas.threejs"); // Select the canvas element
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); // Create the WebGL renderer
renderer.setSize(window.innerWidth, window.innerHeight); // Set the renderer size to the window size
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Set the pixel ratio to device pixel ratio

// Orbit Controls (to move and zoom the camera)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Enable smooth control

// Handle window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Update camera aspect ratio
    camera.updateProjectionMatrix(); // Update the camera projection matrix
    renderer.setSize(window.innerWidth, window.innerHeight); // Update renderer size
});

// Animation loop
const renderloop = () => {
    controls.update(); // Update the controls
    renderer.render(scene, camera); // Render the scene from the camera's perspective
    window.requestAnimationFrame(renderloop); // Request the next animation frame
};

// Start the animation loop
renderloop();
