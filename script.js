import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

/* ==========================================================
 * CONFIGURACIÓN GENERAL
 * ========================================================== */

const cameraState = {
    yaw: 0,
    pitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0
};

const movementState = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

const pressedKeys = {};

/* ==========================================================
 * ESCENA
 * ========================================================== */

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

const player = createPlayer();

createLighting();
createFloor();
createObstacles(40);

/* ==========================================================
 * CONTROLES
 * ========================================================== */

setupKeyboardControls();
setupMouseControls();
setupTouchControls();
setupMobileButtons();
setupGyroscope();

/* ==========================================================
 * CICLO PRINCIPAL
 * ========================================================== */

animate();

/* ==========================================================
 * CREACIÓN DE ESCENA
 * ========================================================== */

function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    return scene;
}

function createCamera() {
    return new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
}

function createRenderer() {

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    document.body.appendChild(
        renderer.domElement
    );

    return renderer;
}

function createPlayer() {

    const player = new THREE.Object3D();

    player.position.set(
        0,
        1.6,
        5
    );

    player.add(camera);

    scene.add(player);

    return player;
}

/* ==========================================================
 * ENTORNO
 * ========================================================== */

function createLighting() {

    const light = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    light.position.set(
        10,
        10,
        10
    );

    scene.add(light);
}

function createFloor() {

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({
            color: 0x44aa44
        })
    );

    floor.rotation.x = -Math.PI / 2;

    scene.add(floor);
}

/*
 * Genera objetos distribuidos aleatoriamente
 * para proporcionar referencias visuales
 * dentro de la escena.
 */
function createObstacles(count) {
    for (let i = 0; i < count; i++) {
        const obstacle = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial({
                color: Math.random() * 0xffffff
            })
        );

        obstacle.position.set(
            (Math.random() - 0.5) * 50,
            0.5,
            (Math.random() - 0.5) * 50
        );

        scene.add(obstacle);
    }
}

/* ==========================================================
 * CONTROLES DE TECLADO
 * ========================================================== */

function setupKeyboardControls() {

    window.addEventListener("keydown", e => {
        pressedKeys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", e => {
        pressedKeys[e.key.toLowerCase()] = false;
    });
}

/* ==========================================================
 * CONTROLES DE RATÓN
 * ========================================================== */

/*
 * Permite modificar la orientación
 * de la cámara mediante arrastre.
 */
function setupMouseControls() {

    window.addEventListener("mousedown", e => {
        cameraState.dragging = true;
        cameraState.lastX = e.clientX;
        cameraState.lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
        cameraState.dragging = false;
    });

    window.addEventListener("mousemove", e => {

        if (!cameraState.dragging) return;

        updateView(
            e.clientX,
            e.clientY
        );
    });
}

/* ==========================================================
 * CONTROLES TÁCTILES
 * ========================================================== */

function setupTouchControls() {

    window.addEventListener("touchstart", e => {

        cameraState.dragging = true;

        cameraState.lastX =
            e.touches[0].clientX;

        cameraState.lastY =
            e.touches[0].clientY;
    });

    window.addEventListener("touchend", () => {
        cameraState.dragging = false;
    });

    window.addEventListener("touchmove", e => {

        if (!cameraState.dragging) return;

        updateView(
            e.touches[0].clientX,
            e.touches[0].clientY
        );
    });
}

function updateView(x, y) {

    const dx = x - cameraState.lastX;
    const dy = y - cameraState.lastY;

    cameraState.yaw -= dx * 0.005;
    cameraState.pitch -= dy * 0.005;

    cameraState.pitch = Math.max(
        -Math.PI / 2,
        Math.min(
            Math.PI / 2,
            cameraState.pitch
        )
    );

    cameraState.lastX = x;
    cameraState.lastY = y;
}

/* ==========================================================
 * BOTONES MÓVILES
 * ========================================================== */

function setupMobileButtons() {
    bindMovementButton(
        "forward",
        value => movementState.forward = value
    );
    bindMovementButton(
        "backward",
        value => movementState.backward = value
    );
    bindMovementButton(
        "right",
        value => movementState.left = value
    );
    bindMovementButton(
        "left",
        value => movementState.right = value
    );
}

function bindMovementButton(id, setter) {

    const button =
        document.getElementById(id);

    ["mousedown", "touchstart"]
        .forEach(event =>
            button.addEventListener(
                event,
                () => setter(true)
            )
        );

    ["mouseup", "touchend"]
        .forEach(event =>
            button.addEventListener(
                event,
                () => setter(false)
            )
        );
}

/* ==========================================================
 * GIROSCOPIO
 * ========================================================== */

/*
 * Si el dispositivo dispone de sensores de
 * orientación, permite controlar la cámara
 * mediante el movimiento físico del teléfono.
 */
function setupGyroscope() {

    const button =
        document.getElementById("gyroBtn");

    if (!button) return;

    button.onclick = async () => {

        try {

            if (
                typeof DeviceOrientationEvent !== "undefined" &&
                typeof DeviceOrientationEvent.requestPermission === "function"
            ) {

                const permission =
                    await DeviceOrientationEvent
                        .requestPermission();

                if (permission !== "granted") {
                    return;
                }
            }

            window.addEventListener(
                "deviceorientation",
                event => {

                    if (event.alpha != null) {

                        cameraState.yaw =
                            THREE.MathUtils.degToRad(
                                event.alpha
                            );
                    }
                }
            );

            button.style.display = "none";

        } catch (error) {

            console.error(error);

        }
    };
}

/* ==========================================================
 * MOVIMIENTO
 * ========================================================== */

/*
 * Actualiza la posición del jugador a partir
 * de las entradas activas.
 */
function updateMovement() {

    const speed = 0.1;

    const forward =
        new THREE.Vector3();

    camera.getWorldDirection(
        forward
    );

    forward.y = 0;
    forward.normalize();

    const right =
        new THREE.Vector3()
            .crossVectors(
                forward,
                new THREE.Vector3(0, 1, 0)
            )
            .normalize();

    if (
        pressedKeys.w ||
        movementState.forward
    ) {
        movePlayer(forward, speed);
    }

    if (
        pressedKeys.s ||
        movementState.backward
    ) {
        movePlayer(forward, -speed);
    }

    if (
        pressedKeys.a ||
        movementState.left
    ) {
        movePlayer(right, speed);
    }

    if (
        pressedKeys.d ||
        movementState.right
    ) {
        movePlayer(right, -speed);
    }
}

function movePlayer(direction, speed) {

    player.position.add(
        direction.clone()
            .multiplyScalar(speed)
    );
}

/* ==========================================================
 * CÁMARA
 * ========================================================== */

function updateCameraRotation() {

    camera.rotation.order = "YXZ";

    camera.rotation.y =
        cameraState.yaw;

    camera.rotation.x =
        cameraState.pitch;
}

/* ==========================================================
 * RENDERIZADO
 * ========================================================== */

function animate() {
    requestAnimationFrame(
        animate
    );
    updateMovement();
    updateCameraRotation();

    renderer.render(
        scene,
        camera
    );
}

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);