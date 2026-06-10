import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    antialias:true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(
    renderer.domElement
);

// -------------------
// Jugador
// -------------------

const player = new THREE.Object3D();

player.position.set(0,1.6,5);

player.add(camera);

scene.add(player);

// -------------------
// Luz
// -------------------

const light = new THREE.DirectionalLight(
    0xffffff,
    3
);

light.position.set(10,10,10);

scene.add(light);

// -------------------
// Piso
// -------------------

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({
        color:0x44aa44
    })
);

floor.rotation.x = -Math.PI/2;

scene.add(floor);

// -------------------
// Cubos
// -------------------

for(let i=0;i<40;i++){

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({
            color:Math.random()*0xffffff
        })
    );

    cube.position.set(
        (Math.random()-0.5)*50,
        0.5,
        (Math.random()-0.5)*50
    );

    scene.add(cube);
}

// -------------------
// Mirar
// -------------------

let yaw = 0;
let pitch = 0;

let dragging = false;
let lastX = 0;
let lastY = 0;

window.addEventListener("mousedown",(e)=>{
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener("mouseup",()=>{
    dragging = false;
});

window.addEventListener("mousemove",(e)=>{

    if(!dragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    yaw -= dx * 0.005;
    pitch -= dy * 0.005;

    pitch = Math.max(
        -Math.PI/2,
        Math.min(Math.PI/2,pitch)
    );

    lastX = e.clientX;
    lastY = e.clientY;
});

// Touch

window.addEventListener("touchstart",(e)=>{
    dragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
});

window.addEventListener("touchend",()=>{
    dragging = false;
});

window.addEventListener("touchmove",(e)=>{

    if(!dragging) return;

    const dx =
        e.touches[0].clientX - lastX;

    const dy =
        e.touches[0].clientY - lastY;

    yaw -= dx * 0.005;
    pitch -= dy * 0.005;

    pitch = Math.max(
        -Math.PI/2,
        Math.min(Math.PI/2,pitch)
    );

    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
});

// -------------------
// Teclado
// -------------------

const keys = {};

window.addEventListener(
    "keydown",
    e => keys[e.key.toLowerCase()] = true
);

window.addEventListener(
    "keyup",
    e => keys[e.key.toLowerCase()] = false
);

// -------------------
// Botones móvil
// -------------------

let mobileForward=false;
let mobileBackward=false;
let mobileLeft=false;
let mobileRight=false;

function bindButton(id,setter){

    const btn=document.getElementById(id);

    btn.addEventListener(
        "touchstart",
        ()=>setter(true)
    );

    btn.addEventListener(
        "touchend",
        ()=>setter(false)
    );

    btn.addEventListener(
        "mousedown",
        ()=>setter(true)
    );

    btn.addEventListener(
        "mouseup",
        ()=>setter(false)
    );
}

bindButton(
    "forward",
    v=>mobileForward=v
);

bindButton(
    "backward",
    v=>mobileBackward=v
);

bindButton(
    "left",
    v=>mobileLeft=v
);

bindButton(
    "right",
    v=>mobileRight=v
);

// -------------------
// Giroscopio
// -------------------

document
.getElementById("gyroBtn")
.onclick = async ()=>{

    try{

        if(
            typeof DeviceOrientationEvent !==
            "undefined"
            &&
            typeof DeviceOrientationEvent
            .requestPermission ===
            "function"
        ){

            const permission =
            await DeviceOrientationEvent
            .requestPermission();

            if(permission!=="granted")
                return;
        }

        window.addEventListener(
            "deviceorientation",
            event=>{

                if(event.alpha!=null){

                    yaw =
                    THREE.MathUtils
                    .degToRad(event.alpha);

                }

            }
        );

        document
        .getElementById("gyroBtn")
        .style.display="none";

    }catch(err){

        console.log(err);

    }

};

// -------------------
// Movimiento
// -------------------

function updateMovement(){

    const speed = 0.1;

    const dir =
    new THREE.Vector3();

    camera.getWorldDirection(dir);

    dir.y = 0;
    dir.normalize();

    const right =
    new THREE.Vector3()
    .crossVectors(
        dir,
        new THREE.Vector3(0,1,0)
    )
    .normalize();

    if(keys["w"] || mobileForward){

        player.position.add(
            dir.clone().multiplyScalar(speed)
        );

    }

    if(keys["s"] || mobileBackward){

        player.position.add(
            dir.clone().multiplyScalar(-speed)
        );

    }

    if(keys["a"] || mobileLeft){

        player.position.add(
            right.clone().multiplyScalar(speed)
        );

    }

    if(keys["d"] || mobileRight){

        player.position.add(
            right.clone().multiplyScalar(-speed)
        );

    }

}

// -------------------
// Render
// -------------------

function animate(){

    requestAnimationFrame(animate);

    updateMovement();

    camera.rotation.order="YXZ";

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    renderer.render(
        scene,
        camera
    );
}

animate();

window.addEventListener(
    "resize",
    ()=>{

        camera.aspect=
        window.innerWidth/
        window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);