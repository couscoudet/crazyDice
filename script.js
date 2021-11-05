//AJOUT DE THREEJS
import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

let bouton = document.getElementById("bouton")

//Initialisation des paramètres principaux de la scène
const scene = new THREE.Scene();

const loader = new GLTFLoader();
let dice

loader.load( 'assets/dice.glb', function ( gltf ) {
    scene.add(gltf.scene);
    console.log(gltf.scene.children)
    dice = gltf.scene.children[5];
}, 
    function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
},
    undefined, function ( error ) {
    console.error( error );
} )

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding
document.body.appendChild(renderer.domElement)

// Recul de la camera par rapport à l'origine
camera.position.z = 6;

const light2 = new THREE.PointLight( 0xffff4f, 5, 100 );
const light3 = new THREE.PointLight( 0xffffff, 2, 100 );
const light4 = new THREE.PointLight( 0xffffff, 10, 100 );
light2.position.set(2,-7,3);
light3.position.set(-3,5,8);
light4.position.set(0,-4,5);
scene.add(light2, light3, light4)

let rotations = {
    1 : "Math.PI/2"
}

let test = () => {
    var a = performance.now();  
    dice.rotation.y = 0;
    dice.rotation.x = 0;
    animate()
    var b = performance.now();
    console.log('It took ' + (b - a) + ' ms.');
}

let animate = () => {
    requestAnimationFrame(animate);
    if (dice.rotation.y < (Math.PI)) {
        dice.rotation.y += (Math.PI * 0.01)
        console.log(dice.rotation.y)
        //dice.rotation.z += Math.PI/20
    }
    renderer.render(scene, camera)
    
}

bouton.addEventListener("click", test)
