//AJOUT DE THREEJS
import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

//JQUERY ENCAPSULATION
$(($) => {
    
    //Hide game areas at page loading
    $('.score-area, .avatar, #throwDice, #keepScore').hide()

    //VanillaJS DOM Variables for the audio
    const startGameSound = document.getElementById("startGameSound")
    const openGameSound = document.getElementById("openGameSound")
    const throwSound = document.getElementById("throwSound")

        
    /******************** OBJECTS WITH METHODS FOR THE GAME************************* */
    
    //PLAYERS/////////////////////////////////////////////////////////////////////////

    //player class with different attributes and methods to define player 1 and player 2
    class Player {
        constructor(name, avatar, score, ready, turn) {
            this.name = name;
            this.avatar = avatar; //number to display avatar img depending on avatars array
            this.score = score; //score of the player during the game
            this.ready = ready; //boolean : ready to play or not after choosing avatar to launch the game area
            this.turn = turn; //boolean : is it the player turn to play ?
            this.fillScore = 0;//a percentage to fill the scorebar of the player
            //METHODS
            //Display the score of the player and fill the scorebar
            this.showScore = () => {
                $('#' + this.name + ' .score').text(this.score.toString())
                $('#' + this.name + ' .scorefill').width(this.fillScore.toString() + "%")
            }
            //Avatar Change
            //Function to display the avatar picture and name depending on the index number (avatar attribute)
            this.generateAvatar = () => {
                $('#' + this.name + ' .avatar>img').attr("src", "assets/avatars/" + avatars[this.avatar].file)
                $('#' + this.name + ' .choice').text(avatars[this.avatar].name)
            }
            //Change avatar with right arrow
            this.avatarRight = () => {
                if (this.avatar < (avatars.length -1)) {
                    this.avatar++;
                    this.generateAvatar()
                }
                else {
                    this.avatar = 0;
                    this.generateAvatar()
                }
            }
            //Change avatar with left arrow
            this.avatarLeft = () => {
                if (this.avatar > 0) {
                    this.avatar--;
                    this.generateAvatar()
                }
                else {
                    this.avatar = (avatars.length - 1);
                    this.generateAvatar()
                }
            }
            //Show which player is in active turn with CSS classes
            this.showTurn = () => {
                this.turn ? $('#' + this.name).removeClass('inactive-turn').addClass('active-turn') : $('#' + this.name).removeClass('active-turn').addClass('inactive-turn')
            }
            //Show which player is the winner with CSS classe
            this.showWinner = () => {
                $('#' + this.name).addClass('winner')
                console.log(this.name)
            }
        }
    }

    //avatars array
    const avatars = [
        {name : "magma", file: "magma.png"},
        {name: "amy", file: "amy.png"},
        {name : "chan", file : "chan.png"},
        {name: "cox", file: "cox.png"},
        {name: "destiny", file: "destiny.png"},
        {name: "hamlet", file: "hamlet.png"},
        {name: "quentin", file: "quentin.png"},
        {name: "tracker", file: "Tracker.png"},
        {name: "zebra", file: "zebra.png"}
    ]

    // CREATE PLAYERS OBJECT VARIABLES
    let player1 = new Player("player1", 0, 0, false, false)

    let player2 = new Player("player2", 0, 0, false, false)

    let players = [player1, player2];

    //Function to display the CSS class for each player with the showTurn() player Method
    let displayTurnInDom = () => {
        players.forEach(player => player.showTurn())
    }


    //GAME////////////////////////////////////////////////////////////////////////////////////

    //The dice result after each roll
    let dicePoints

    //Game object
    let game = {
        turnPoints: 0, //points added during the turn
        winScore: 100, //maximum score to win
        startGame: () => {
            if (alertMessage()) {
                alert(alertMessage()) //avoid incoherent number
            }
            else {
                //GAME INITIALISATION
                $('.score-area, .avatar, #throwDice, #keepScore').hide()
                $('.score-area, .avatar, .avatar-selector   ').show();
                $('.active-turn, .inactive-turn, .winner').removeClass('active-turn inactive-turn winner')
                players.forEach((player) => {
                    player.score = 0;
                    player.fillScore = 0;
                    player.showScore();
                    player.ready = false;
                    player.turn = false;
                });
                startGameSound.play();
                game.turnPoints = 0;
                game.winScore = $('#winScore').val()
                $('#turn-points').text(game.turnPoints)
            }
        },
        openGame: () => {
            if (player1.ready && player2.ready) {
            $('#throwDice, #keepScore').show()
            player1.turn = true;
            dice.rotation.x = Math.PI //3D Threejs Methods to rotate the dice
            dice.rotation.y = Math.PI
            initiateAnimation();
            displayTurnInDom();
            startGameSound.pause();
            startGameSound.currentTime = 0;
            }
        },
        changeTurn: () => {
            if (player1.turn) {
                player1.turn = false;
                player2.turn = true;
                displayTurnInDom()
            }
            else {
                player1.turn = true;
                player2.turn = false;
                displayTurnInDom()
            }
        },
        startTurn: () => {
            game.turnPoints = 0;
            $('#turn-points').text(game.turnPoints)
        },
        throwDice: () => {
            throwSound.play()
            dicePoints = Math.ceil(Math.random() * 6)
            if (dicePoints === 1) {
                dice.rotation.x = 0;
                dice.rotation.y = 0;
                throwAnimation()
                setTimeout(game.changeTurn,1000);
                setTimeout(game.startTurn,1000);
            }
            else {
                game.turnPoints += dicePoints
                dice.rotation.x = 0;
                dice.rotation.y = 0;
                throwAnimation()
                setTimeout(() => {
                    $('#turn-points').text(game.turnPoints)
                }, 1500)
            }
        },
        keepScore: () => {
            let player = players.filter((player) => player.turn === true);
            player = player[0];
            player.score += game.turnPoints;
            player.fillScore = player.score / game.winScore * 100;
            player.showScore();
            if (game.winGame()) {
                let winner = game.winGame();
                winFunction(winner)
            }
            else if (game.winGame() === undefined) {
                game.changeTurn();
                game.startTurn();
            }
        },
        winGame: () => {
            if (player1.score >= game.winScore) {
                return player1
            }
            else if (player2.score >= game.winScore) {
                return player2
            }
        }
    }


    /****************************EVENTS AND FUNCTIONS********************************** */

    //CLICK EVENTS TO CHANGE AVATAR
    players.forEach((player) => {
        $(`#${player.name} .fa-arrow-circle-left`).click(player.avatarLeft);
        $(`#${player.name} .fa-arrow-circle-right`).click(player.avatarRight);
        $(`#${player.name} .ok`).click(() => {
            $(`#${player.name} .avatar-selector`).hide();
            player.ready = true;
            game.openGame();
        })
    })
    
    //START GAME EVENT
    $('#start').click(game.startGame);

    //THROW DICE EVENT
    $('#throwDice').click(game.throwDice)

    //KEEP SCORE EVENT
    $('#keepScore').click(game.keepScore)

    //WinScore input security events
    const alertMessage = () => {
        if ($('#winScore').val() < 20) {
            return('Vous risquez de ne pas jouer très longtemps')
        }
        else if ($('#winScore').val() > 500) {
            return('Cette partie va durer une éternité')
        }
        else if (!($('#winScore').val())) {
            return('Entrez un chiffre pour jouer')
        }
    }
    $('#winScore').blur(() => {
        if (alertMessage()) {
            alert(alertMessage())
        }
    })


    /************************DICE 3D SCENE MODELING WITH THREE JS ***************************************** */

    let canvas = document.getElementById("dice")

    //Initialisation des paramètres principaux de la scène
    const scene = new THREE.Scene();

    const loader = new GLTFLoader();
    
    let dice

    //import dice
    loader.load( 'assets/dice.glb', function ( gltf ) {
        scene.add(gltf.scene);
        dice = gltf.scene.children[5];
        renderer.render(scene, camera)
    }, 
        function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
        undefined, function ( error ) {
        console.error( error );
    } )
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer( {canvas: canvas, alpha: true } );


    renderer.outputEncoding = THREE.sRGBEncoding


    // Recul de la camera par rapport à l'origine
    camera.position.z = 4;

    //Different lights
    const light2 = new THREE.PointLight( 0xffff4f, 5, 100 );
    const light3 = new THREE.PointLight( 0xffffff, 2, 100 );
    const light4 = new THREE.PointLight( 0xffffff, 10, 100 );
    light2.position.set(2,-7,3);
    light3.position.set(-3,5,8);
    light4.position.set(0,-4,5);
    scene.add(light2, light3, light4)

    //predefined rotations depending on the number to show
    let rotations = {
        1 : {
            x: Math.PI/2,
            y: 2 * Math.PI },
        2 : {
            x: 2 * Math.PI,
            y: 2 * Math.PI },
        3 : {
            x: 2 * Math.PI,
            y: 3 * Math.PI/2 },
        4 : {
            x: 2 * Math.PI,
            y: Math.PI/2 },
        5 : {
            x: 2 * Math.PI,
            y: Math.PI },
        6 : {
            x: 3 * Math.PI/2,
            y: 2 * Math.PI }
    }

    //Create variable to animate and stop x axis and y axis rotations
    let animateX
    let animateY

    //Dice animation at Game opening (after choosing avatars)
    let initiateAnimation = () => {
        if (dice.rotation.y > 0) {
            dice.rotation.y -= Math.PI * 0.04
            renderer.render(scene, camera) //render the scene
            animateY = window.requestAnimationFrame(initiateAnimation) //launch frame animation with recursive function
        }
        else {
            window.cancelAnimationFrame(animateY)
            if (dice.rotation.x > 0) {
                dice.rotation.x -= Math.PI * 0.04
                renderer.render(scene, camera)
                animateX = window.requestAnimationFrame(initiateAnimation)
            }
            else {
                window.cancelAnimationFrame(animateX)
                console.log("après initialisation : " + dice.rotation.x + " " + dice.rotation.y)
            }
        }
    }

    //Dice animation when roll
    let throwAnimation = () => {
        if (dice.rotation.y < rotations[dicePoints].y) {
            dice.rotation.y += Math.PI * 0.05
            renderer.render(scene, camera)
            console.log("y : " + dice.rotation.y)
            animateY = window.requestAnimationFrame(throwAnimation)
        }
        else {
            window.cancelAnimationFrame(animateY)
            if (dice.rotation.x < rotations[dicePoints].x) {
                dice.rotation.x += Math.PI * 0.03
                renderer.render(scene, camera)
                console.log("x : " + dice.rotation.x)
                animateX = window.requestAnimationFrame(throwAnimation)
            }
            else {
                window.cancelAnimationFrame(animateX)
                console.log("fin de l'animation")
            }
        }
    }

    //Winner display function
    let winFunction = (player) => {
        player.showWinner()
        $('#throwDice, #keepScore').hide()
        openGameSound.play()
    }

   //Orientation check for mobile device for game experience
   window.addEventListener("resize", () => {
       if (window.innerWidth < window.innerHeight) {
           alert("Passez en mode paysage pour une meilleure expérience de jeu")
       }
   })
    
//Ending Jquery
})