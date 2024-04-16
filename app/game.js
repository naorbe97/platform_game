
// Variables globales del juego
let score = 0; // Puntuación inicial del jugador
let lives = 3; // Número inicial de vidas del jugador

// Texto de la puntuación
let scoreText;

// Texto de las vidas
let livesText;

// Elemento del temporizador
let timerElement;

// Estado del juego (si ha terminado o no)
let gameOver = false;

// Jugador
let player;

// Plataformas
let platforms;

// Cursores para el control del jugador
let cursors;

// Grupo de estrellas
let stars;

// Grupo de bombas
let bombs;

// Escena actual
let scene;

// Intervalo de la cuenta atrás del temporizador
let countdownInterval;

// Tiempo restante del temporizador
let timeRemaining = 30;



const collectStar = (_player, star) =>  {
    // Desactivamos el cuerpo de la estrella
    star.disableBody(true, true);
    // Aumentamos la puntuación del jugador
    score += 10;
    scoreText.setText("Score: " + score);

    // Verificamos si stars está definido y es un grupo válido
    if (stars && stars.countActive && typeof stars.countActive === 'function') {
        // Verificamos si se han recogido todas las estrellas
        if (stars.countActive(true) === 0) {
            // Habilitamos todas las estrellas para que vuelvan a aparecer
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });
            bombs = this.physics.add.group();
            // Creamos nuevas bombas
            createBombs(scene);
        }
    }
}

function createMultiple(scene, starsGroup) {
    // Limpiamos las estrellas anteriores si las hubiera
    if (stars && stars.children && stars.children.size > 0) {
        stars.clear(true, true);
    }

    // Creamos un nuevo grupo de estrellas
    starsGroup  = scene.physics.add.group({
        key: "star",
        repeat: 6,
        setXY: {
            x: window.innerWidth / 8,
            y: 0,
            stepX: window.innerWidth / 8,
        },
    });

    // Configuramos el rebote de las nuevas estrellas
    starsGroup.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
}


// Función para crear bombas
function createBombs(scene, bombsGroup) {
    // Limpiamos las bombas anteriores si las hubiera
    if (bombsGroup && bombsGroup.children && bombsGroup.children.size > 0) {
        bombsGroup.clear(true, true);
    } else {
        bombsGroup = scene.physics.add.group();
    }

    // Creamos un número fijo de bombas y les aplicamos propiedades aleatorias
    for (var i = 0; i < 5; i++) {
        var x = Phaser.Math.Between(0, window.innerWidth);
        var bomb = bombsGroup.create(x, 16, "bomb");
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }

    // Añadimos la colisión entre las bombas y las plataformas
    scene.physics.add.collider(bombsGroup, platforms);

    // Añadimos la colisión entre el jugador y las bombas y llamamos a la función hitBomb
    scene.physics.add.collider(player, bombsGroup, hitBomb, null, scene);
}

// Función para gestionar el impacto de las bombas en el jugador
function hitBomb(player, _bomb) {
    console.log("Bomba golpeada");
    if (!gameOver) {
        // Restamos una vida al jugador
        lives--;
        livesText.setText("Lives: " + lives);
        // Hacemos parpadear al jugador al recibir el impacto
        player.setTint(0xff0000);
        scene.tweens.add({
            targets: player,
            alpha: 0,
            duration: 100,
            ease: "Power2",
            yoyo: true,
            repeat: 1,
            onComplete: function () {
                player.clearTint();
            },
        });
        // Verificamos si el jugador ha perdido todas las vidas
        if (lives === 0) {
            endGame(); // Finalizamos el juego
        } else {
            // Movemos al jugador a la posición inicial
            player.setX(100);
            player.setY(window.innerHeight - 100);
        }
    }
}

// Función para finalizar el juego
function endGame() {
    // Establecemos el estado del juego como terminado
    gameOver = true;
    // Pausamos la física del juego
    scene.physics.pause();
    // Detenemos el intervalo de la cuenta atrás del temporizador
    clearInterval(countdownInterval);

    // Guardamos todas las variables globales en el historial del juego
    scene.game.history = {
        score: score,
        lives: lives,
        timeRemaining: timeRemaining,
        gameOver: gameOver,
        player: player,
        platforms: platforms,
        cursors: cursors,
        stars: stars,
        bombs: bombs,
        scene: scene,
        countdownInterval: countdownInterval
    };

    // Creamos un texto para mostrar el mensaje de "Game Over"
    var style = {
        fontSize: "64px",
        fill: "rgba(0, 0, 0, 0)",
        stroke: "#ff0000",
        strokeThickness: 5,
        padding: {
            x: 10,
            y: 5,
        },
    };

    var gameOverText = scene.add
        .text(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Game Over",
            style
        )
        .setOrigin(0.5)
        .setName("gameOverText");

    // Configuramos el texto para reiniciar el juego
    style.fontSize = "32px";
    style.strokeThickness = 3;
    style.fill = "#ffffff";
    var restartText = scene.add
        .text(
            window.innerWidth / 2,
            window.innerHeight / 2 + 100,
            "Click to Restart",
            style
        )
        .setOrigin(0.5)
        .setName("restartText");

    // Habilitamos la interacción para reiniciar el juego haciendo clic
    restartText.setInteractive();
    restartText.on("pointerdown", function () {
        // Reiniciamos la posición del jugador
        player.setX(100);
        player.setY(window.innerHeight - 100);

        // Reiniciamos las variables y el estado del juego
        score = 0;
        lives = 3;
        timeRemaining = 30;
        gameOver = false;

        // Actualizamos los textos de puntuación y vidas
        scoreText.setText("Score: " + score);
        livesText.setText("Lives: " + lives);

        // Eliminamos los textos de "Game Over" y "Click to Restart"
        gameOverText.destroy();
        restartText.destroy();

        // Permitimos que el jugador se mueva nuevamente
        player.setVelocityX(0);
        player.setVelocityY(0);

        // Reiniciamos las estrellas y las bombas
        restartStarsAndBombs(scene);

        // Reanudamos la física del juego
        scene.physics.resume();

        // Iniciamos de nuevo la cuenta atrás del temporizador
        startCountdown();
    });
}

function restartStarsAndBombs(stars, bombs, scene) {
    // Eliminamos todas las estrellas
    stars.clear(true, true);
    
    // Creamos un nuevo grupo de estrellas
    stars.createMultiple({
        key: "star",
        repeat: 6,
        setXY: {
            x: window.innerWidth / 8,
            y: 0,
            stepX: window.innerWidth / 8,
        },
    });
    
    // Configuramos el rebote de las nuevas estrellas
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    
    // Eliminamos todas las bombas
    bombs.clear(true, true);
    
    // Luego, creas nuevas bombas como antes
    createBombs(scene);
} 

// Función para iniciar la cuenta atrás del temporizador
function startCountdown() {
    timeRemaining = 30;
    updateTimerDisplay(timeRemaining);
    countdownInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining < 0) {
            clearInterval(countdownInterval);
            if (score < 30) {
                endGame(); 
            }
        } else {
            updateTimerDisplay(timeRemaining); 
        }
    }, 1000);
}

// Función para actualizar la pantalla del temporizador
function updateTimerDisplay(timeRemaining) {
    if (timerElement && typeof timerElement.setText === 'function') {
        timerElement.setText("Time: " + timeRemaining);
    } else {
        console.error("timerElement is not initialized");
    }
}

function restarttStarsAndBombs(scene) {
    // Verificar si stars y bombs son grupos válidos
    if (!stars || !bombs || typeof stars.createMultiple !== 'function' || typeof bombs.createMultiple !== 'function') {
        console.error('Stars or bombs groups are not defined or invalid.');
        return;
    }

    // Eliminamos todas las estrellas si el grupo existe y tiene el método clear
    if (stars.children && stars.children.size > 0) {
        stars.clear(true, true);
    }
    
    createMultiple(scene, stars); // Pasamos stars como argumento
    
    // Eliminamos todas las bombas si el grupo existe y tiene el método clear
    if (bombs.children && bombs.children.size > 0) {
        bombs.clear(true, true);
    }
    
    bombs = scene.physics.add.group(); // Usamos scene.physics.add.group() aquí
    createBombs(scene, bombs); // Pasamos bombs como argumento
}


class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.characterHistory = []; // Inicializa characterHistory como un array vacío
    }

    preload() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro
        // Cargar aquí los recursos necesarios para el menú
        this.load.image("backgroundmenu", "assets/img/backgroundmenu.png");
        //Cargar los spritesheets de los personajes
        this.load.spritesheet("dude", "assets/img/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("dude2", "assets/img/dude2.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        
        this.load.audio('bgMusic', ['assets/audio/42309__showster1232000__loop63.wav']);
    }

    create() {
        // Lógica para crear el menú aquí
        this.add
            .image(
                window.innerWidth / 2,
                window.innerHeight / 2,
                "backgroundmenu"
            )
            .setDisplaySize(window.innerWidth, window.innerHeight);

        // Guardar una referencia a la escena actual
        let scene = this;

        // Cargar música
        this.music = this.sound.add("bgMusic", { loop: true, volume: 0.5 });
        this.music.play();

        // Botón de silenciar/reanudar música
        let muteButton = this.add
            .text(
                window.innerWidth - 300, // Posición X
                50, // Posición Y
                "Mute",
                {
                    fontSize: "50px",
                    fill: "#fff",
                    fontFamily: "Orbitron",
                }
            )
            .setInteractive({ useHandCursor: true });

        muteButton.on(
            "pointerdown",
            function () {
                if (this.musicPlaying) {
                    this.music.pause();
                    muteButton.setText("Unmute");
                } else {
                    this.music.resume();
                    muteButton.setText("Mute");
                }
                this.musicPlaying = !this.musicPlaying;
            },
            this
        );

        // Botón ON
        let onButton = this.add
            .text(window.innerWidth / 2 - 750, window.innerHeight / 2.5, "ON", {
                fontSize: "140px",
                fill: "#fff",
                fontFamily: "Orbitron",
            })
            .setInteractive({ useHandCursor: true });

        onButton.on("pointerdown", function () {
            onButton.setFill("#00FF00"); // Cambia el color a verde neón
            offButton.setFill("#FFFFFF"); // Restaura el color del botón OFF a blanco
            startGameButton.setFill("#00FF00"); // Cambia el color del botón Start Game a verde neón
            let selectedCharacter = "dude"; // Establece el personaje seleccionado como dude
            console.log(selectedCharacter);

            // Guardar el personaje seleccionado en el historial
            scene.characterHistory.push(selectedCharacter);
        });

        // Botón OFF
        let offButton = this.add
            .text(
                window.innerWidth / 2 - 450,
                window.innerHeight / 2.5,
                "OFF",
                {
                    fontSize: "140px",
                    fill: "#fff",
                    fontFamily: "Orbitron",
                }
            )
            .setInteractive({ useHandCursor: true });

        offButton.on("pointerdown", function () {
            offButton.setFill("#FF0000"); // Cambia el color a rojo neón
            onButton.setFill("#FFFFFF"); // Restaura el color del botón ON a blanco
            startGameButton.setFill("#FF0000"); // Cambia el color del botón Start Game a rojo neón
            let selectedCharacter = "dude2"; // Establece el personaje seleccionado como dude2
            console.log(selectedCharacter);

            // Guardar el personaje seleccionado en el historial
            scene.characterHistory.push(selectedCharacter);
        });

        // Botón Start Game
        let startGameButton = this.add
            .text(
                window.innerWidth / 2 - 50,
                window.innerHeight / 2.5,
                "Start Game",
                {
                    fontSize: "124px",
                    fill: "#fff",
                    fontFamily: "Orbitron",
                }
            )
            .setInteractive({ useHandCursor: true });

        // Al hacer clic en "Start Game", iniciar la escena de instrucciones
        startGameButton.on(
            "pointerdown",
            function () {
                // Verificar si no se ha seleccionado manualmente un personaje
                if (scene.characterHistory.length === 0) {
                    // Array de personajes disponibles
                    const characters = ["dude", "dude2"];
                    // Elegir un personaje aleatoriamente
                    let selectedCharacter = Phaser.Math.RND.pick(characters);
                    console.log(
                        "Personaje aleatorio seleccionado: " + selectedCharacter
                    );
                    // Guardar el personaje seleccionado en el historial
                    scene.characterHistory.push(selectedCharacter);
                }
                this.scene.start("InstructionsScene");
            },
            this
        );
        this.characterHistory = [];
    }
}




class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro

        // Crear rectángulo blanco como ventana
        let windowRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 400, 0xffffff);

        // Agregar texto dentro del rectángulo
        let text = "Tu nave se acaba de estrellar contra el suelo terrícola. Ahora que estás condenado a llevar una vida terrestre tendrás que aprender sobre hábitos humanos. Aclaro, estos mamíferos de dos patas utilizan lo que ellos llaman 'moda', para nosotros 'stop going naked'.";
        this.add.text(window.innerWidth / 2, window.innerHeight / 2, text, {
            fontSize: "25px",
            fill: "#000",
            fontFamily: "Orbitron",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Botón Skip
        let skipButton = this.add.text(window.innerWidth - 50, window.innerHeight - 50, "Skip", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            fontFamily: "Orbitron",
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Ir a la siguiente instrucción al hacer clic en Skip
        skipButton.on("pointerdown", function () {
            this.scene.start('InstructionsScene2'); // Cambiar por la siguiente escena correspondiente
        }, this);

    }
}



class InstructionsScene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene2' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro

        // Crear rectángulo blanco como ventana
        let windowRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 400, 0xffffff);
        // Agregar texto dentro del rectángulo
        let text = "Primero te llevaré a una lavandería, te he conseguido petos de color blanco. Sin embargo, antes de vestirte debes lavarlos porque han sido usados. Es una acción que tendrás que repetir cada vez que tu ropa huela mal o reciba alguna mancha de comida, pintura o viceversa.";
        this.add.text(window.innerWidth / 2, window.innerHeight / 2, text, {
            fontSize: "25px",
            fill: "#000",
            fontFamily: "Orbitron",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Botón Skip
        let skipButton = this.add.text(window.innerWidth - 50, window.innerHeight - 50, "Skip", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            fontFamily: "Orbitron",
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Ir a la siguiente instrucción al hacer clic en Skip
        skipButton.on("pointerdown", function () {
            this.scene.start('InstructionsScene3'); // Cambiar por la siguiente escena correspondiente
        }, this);

    }
}

class InstructionsScene3 extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene3' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro

        // Crear rectángulo blanco como ventana
        let windowRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 400, 0xffffff);
        // Agregar texto dentro del rectángulo
        let text = "Para seguir aprendiendo sobre hábitos humanos tendrás que superar una prueba en la lavandería, tendrás que recoger un mínimo 3 petos de color blanco. Si lo consigues antes de que se acabe el tiempo o antes de que pierdas todas tus vidas, te llevaré a otro sitio.";
        this.add.text(window.innerWidth / 2, window.innerHeight / 2, text, {
            fontSize: "25px",
            fill: "#000",
            fontFamily: "Orbitron",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Botón Skip
        let skipButton = this.add.text(window.innerWidth - 50, window.innerHeight - 50, "Skip", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            fontFamily: "Orbitron",
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Ir a la siguiente instrucción al hacer clic en Skip
        skipButton.on("pointerdown", function () {
            this.scene.start('InstructionsScene4'); // Cambiar por la siguiente escena correspondiente
        }, this);

    }
}

class InstructionsScene4 extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene4' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro
        // Crear rectángulo blanco como ventana
        let windowRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 400, 0xffffff);

        // Agregar texto dentro del rectángulo
        let text = "Si te preguntas como no perder vidas, evita la ropa de colores. Por cada prenda de color con la que colisiones perderás una vida. Lección: Los humanos separan la ropa antes de lavarla en: ROPA BLANCA, ROPA NEGRA/OSCURA Y ROPA DE COLOR.";
        this.add.text(window.innerWidth / 2, window.innerHeight / 2, text, {
            fontSize: "25px",
            fill: "#000",
            fontFamily: "Orbitron",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Botón Skip
        let skipButton = this.add.text(window.innerWidth - 50, window.innerHeight - 50, "Skip", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            fontFamily: "Orbitron",
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Ir a la siguiente instrucción al hacer clic en Skip
        skipButton.on("pointerdown", function () {
            this.scene.start('GameScene'); // Cambiar por la siguiente escena correspondiente
            createBombs(this); //Agregar esta línea para crear las bombas
        }, this);

    }
}



// Declaramos la clase GameScene que extiende de Phaser.Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' }); // Llamamos al constructor de la clase padre con la clave de la escena
    }

    // Método preload para cargar recursos antes de que se inicie la escena
    preload() {
        // Cargamos las imágenes necesarias para el juego
        this.load.image("background", "assets/img/background.png");
        this.load.image("ground", "assets/img/platform.png");
        this.load.image("star", "assets/img/star.png");
        this.load.image("bomb", "assets/img/bomb.png");
        this.load.spritesheet("dude", "assets/img/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet("dude2", "assets/img/dude2.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    // Método create para inicializar la escena
    create() {
        scene = this;
        // Agregamos una imagen de fondo al centro de la pantalla
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, "background")
            .setDisplaySize(window.innerWidth, window.innerHeight);

        // Creamos un grupo estático de plataformas para el suelo y las plataformas
        platforms = this.physics.add.staticGroup();

        // Creamos el suelo y las plataformas
        platforms.create(window.innerWidth / 2, window.innerHeight - 16, "ground")
            .setDisplaySize(window.innerWidth, 32)
            .refreshBody();

        platforms.create(600, window.innerHeight - 150, "ground"); //izquierda casi en medio
        platforms.create(210, window.innerHeight - 250, "ground"); //izquierda extremo
        platforms.create(750, window.innerHeight - 280, "ground"); //izquierda casi en medio
        platforms.create(window.innerWidth - 210, window.innerHeight - 200, "ground"); // derecha extremo
        platforms.create(window.innerWidth - 600, window.innerHeight - 150, "ground"); // derecha

        // Obtener una referencia a la escena MenuScene
        const menuScene = this.scene.get('MenuScene');

        // Obtener el personaje seleccionado del historial
        const selectedCharacter = menuScene.characterHistory[menuScene.characterHistory.length - 1];

        // Creamos al jugador utilizando el personaje seleccionado
        player = this.physics.add.sprite(100, window.innerHeight - 100, selectedCharacter);
        player.setBounce(0.2); // Establecemos el rebote del jugador
        player.setCollideWorldBounds(true); // Hacemos que el jugador colisione con los límites del mundo

        // Creamos las animaciones del jugador
        this.anims.create({
            key: "left", // Nombre de la animación de caminar hacia la izquierda
            frames: this.anims.generateFrameNumbers(selectedCharacter, { start: 0, end: 3 }), // Selección de los fotogramas para la animación
            frameRate: 10, // Velocidad de la animación en fotogramas por segundo
            repeat: -1, // Repetición infinita de la animación
        });

        this.anims.create({
            key: "turn", // Nombre de la animación de estar parado
            frames: [{ key: selectedCharacter, frame: 4 }], // Fotograma estático para la animación de estar parado
            frameRate: 20, // Velocidad de la animación en fotogramas por segundo
        });

        this.anims.create({
            key: "right", // Nombre de la animación de caminar hacia la derecha
            frames: this.anims.generateFrameNumbers(selectedCharacter, { start: 5, end: 8 }), // Selección de los fotogramas para la animación
            frameRate: 10, // Velocidad de la animación en fotogramas por segundo
            repeat: -1, // Repetición infinita de la animación
        });

        // Añadimos la colisión entre el jugador y las plataformas
        this.physics.add.collider(player, platforms);

        // Creamos los cursores para el control del jugador
        cursors = this.input.keyboard.createCursorKeys();

        // Creamos un grupo de estrellas
        stars = this.physics.add.group({
            key: "star",
            repeat: 6, // 
            setXY: {
                x: window.innerWidth / 8,
                y: 0,
                stepX: window.innerWidth / 8,
            }, // Distribuir uniformemente a lo ancho
        });

        // Configuramos el rebote de las estrellas
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Añadimos la colisión entre las estrellas y las plataformas
        this.physics.add.collider(stars, platforms);

        // Detectamos la superposición entre el jugador y las estrellas y llamamos a la función collectStar
        this.physics.add.overlap(player, stars, collectStar, null, this);

        // Creamos el texto de la puntuación
        scoreText = this.add.text(25, 60, "Score: 0", {
            fontSize: "27px", // Reducir el tamaño del texto
            fill: "#fff",
            fontFamily: "Orbitron",
        });

        // Creamos el texto de las vidas
        livesText = this.add.text(25, 20, "Lives: 3", {
            fontSize: "27px", // Reducir el tamaño del texto
            fill: "#fff",
            fontFamily: "Orbitron",
        });

         // Creamos el texto del temporizador
         timerElement = this.add.text(window.innerWidth / 2, 40, "Time: 30", {
            fontSize: "27px", // Reducir el tamaño del texto
            fill: "#fff",
            fontFamily: "Orbitron",
        });
        timerElement.setOrigin(0.5);

        // Creamos un grupo de bombas y las creamos en la escena
        bombs = this.physics.add.group();
        createBombs(this);
        startCountdown(); // Iniciamos la cuenta atrás del temporizador

        // Guardamos todas las variables globales en el historial del juego
        this.game.history = {
            score: score,
            lives: lives,
            timeRemaining: timeRemaining,
            gameOver: gameOver,
            player: player,
            platforms: platforms,
            cursors: cursors,
            stars: stars,
            bombs: bombs,
            scene: scene,
            countdownInterval: countdownInterval
        };
    }

    // Método update para actualizar el estado del juego en cada fotograma
    update() {
        if (gameOver) {
            return; // Si el juego ha terminado, no hacemos nada
        }

        // Movimiento del jugador según las teclas presionadas
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play("left", true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play("right", true);
        } else {
            player.setVelocityX(0);
            player.anims.play("turn");
        }

        // Salto del jugador si está tocando el suelo
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
        }

        // Verificar si el jugador ha ganado
        if (score >= 30 && !gameOver) {
            // Establecer el estado del juego como terminado
            gameOver = true;
            // Pausar la física del juego
            this.physics.pause();
            // Detener el intervalo de la cuenta regresiva del temporizador
            clearInterval(countdownInterval);

            // Mostrar el mensaje de "Winner"
            let winnerText = this.add
                .text(window.innerWidth / 2, window.innerHeight / 2, "Winner", {
                    fontSize: "64px",
                    fill: "#00ff00", // Cambiar el color a verde neón
                    stroke: "#ffffff",
                    strokeThickness: 5,
                    padding: {
                        x: 10,
                        y: 5,
                    },
                })
                .setOrigin(0.5);

            // Estilizar el botón "Back to menu"
            let backToMenuButton = this.add
                .text(
                    window.innerWidth / 2,
                    window.innerHeight / 2 + 100,
                    "Back to menu",
                    {
                        fontSize: "32px",
                        fill: "#ffffff",
                        stroke: "#000000",
                        strokeThickness: 3,
                    }
                )
                .setOrigin(0.5);

            // Habilitar interactividad para el botón "Back to menu"
            backToMenuButton.setInteractive();
            backToMenuButton.on(
                "pointerdown",
                function () {
                    // Ir a la siguiente escena del juego
                    this.scene.start("MenuScene"); // Cambiar por la siguiente escena correspondiente
                },
                this
            );
        }
    }
}


class InstructionsSceneA extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsSceneA' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro

        // Crear rectángulo blanco como ventana
        let windowRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 400, 0xffffff);

        // Agregar texto dentro del rectángulo
        let text = "¡Enhorabuena, ahora cuentas con un mínimo de prendas! Ahora que has aprendido a que la ropa blanca se separa de la ropa oscura y de la ropa de color, es importante que empieces a familiarizarte con la higiene bucal. Verás, a los humanos no les gusta que alguien les hable si su boca desprende un olor desagradable...";
        this.add.text(window.innerWidth / 2, window.innerHeight / 2, text, {
            fontSize: "25px",
            fill: "#000",
            fontFamily: "Orbitron",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Botón Skip
        let skipButton = this.add.text(window.innerWidth - 50, window.innerHeight - 50, "Skip", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            fontFamily: "Orbitron",
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Ir a la siguiente instrucción al hacer clic en Skip
        skipButton.on("pointerdown", function () {
            this.scene.start('InstructionsSceneB'); // Cambiar por la siguiente escena correspondiente
        }, this);
    }
}

class InstructionsSceneB extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsSceneB' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#000'); // Fondo negro

        // Crear rectángulo blanco como ventana
        let windowRect = this.add.rectangle(window.innerWidth / 2, window.innerHeight / 2, 600, 400, 0xffffff);

        // Agregar texto dentro del rectángulo
        let text = "El plan ahora es acudir a un baño con lavabo, te he conseguido un cepillo con pasta de dientes. Esta vez tendrás que esquivar las bacterias que afectan a tu dentadura cuando no te cepillas los dientes después de cada comida, ¡procura no tocarlas y que no te toquen! Y lo más importante, debes cepillarte los dientes durante 5 minutos.";
        this.add.text(window.innerWidth / 2, window.innerHeight / 2, text, {
            fontSize: "25px",
            fill: "#000",
            fontFamily: "Orbitron",
            align: "center",
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        // Botón Skip
        let skipButton = this.add.text(window.innerWidth - 50, window.innerHeight - 50, "Skip", {
            fontSize: "24px",
            fill: "#fff",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            fontFamily: "Orbitron",
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });

        // Ir a la siguiente instrucción al hacer clic en Skip
        skipButton.on("pointerdown", function () {
            this.scene.start('GameScene2'); // Cambiar por la siguiente escena correspondiente
        }, this);
    }
}


/* // Declarar GameScene2
class GameScene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene2' });
        this.scoreText = null;
        this.livesText = null;
        this.timeRemainingText = null;
        this.timerElement = null;  // Declara timerElement aquí
    }

    create() {
        // Obtener una referencia a la escena MenuScene
        let menuScene = this.scene.get("MenuScene");

        // Obtener el personaje seleccionado del historial
        let selectedCharacter =
            menuScene.characterHistory[menuScene.characterHistory.length - 1];

        // Obteniendo las variables guardadas en el historial de GameScene
        let {
            score,
            lives,
            timeRemaining,
            gameOver,
            player,
            platforms,
            cursors,
            stars,
            bombs,
            scene,
            countdownInterval,
        } = this.game.history;

        // Reestableciendo el juego con las variables guardadas
        this.physics.resume(); 
        this.scene.stop("InstructionsSceneA"); 
        this.scene.stop("InstructionsSceneB");
        this.scene.stop("InstructionsSceneC");

        // Inicializar jugador con cuerpo de física
        this.player = this.physics.add.sprite(
            100,
            window.innerHeight - 100,
            "selectedCharacter"
        ); // Reemplaza 'playerImageKey' con la clave de tu imagen del jugador
        this.player.body.setCollideWorldBounds(true); // Para asegurar que el jugador no salga de los límites del mundo

        // Reiniciar posición del jugador
        this.player.setX(100);
        this.player.setY(window.innerHeight - 100);

        // Reiniciar variables del juego
        score = 0;
        lives = 3;
        timeRemaining = 30;
        gameOver = false;

        if (!this.scoreText || this.scoreText.isDestroyed) {
            this.scoreText = this.add.text(10, 10, "", {
                fontFamily: "Arial",
                fontSize: 24,
                color: "#ffffff",
            });
        }
        if (!this.livesText || this.livesText.isDestroyed) {
            this.livesText = this.add.text(10, 40, "", {
                fontFamily: "Arial",
                fontSize: 24,
                color: "#ffffff",
            });
        }
        if (!this.timeRemainingText || this.timeRemainingText.isDestroyed) {
            this.timeRemainingText = this.add.text(10, 70, "", {
                fontFamily: "Arial",
                fontSize: 24,
                color: "#ffffff",
            });
        }

        // Actualizar los textos de puntuación y vidas
        this.scoreText.setText("Score: " + score);
        this.livesText.setText("Lives: " + lives);
        this.timeRemainingText.setText("Time remaining: " + timeRemaining);

        console.log(stars);
        console.log(bombs);
        console.log(timerElement);

        // Pasar stars y bombs como argumentos a restartStarsAndBombs
        restarttStarsAndBombs(this);

        // Inicializar timerElement
        this.timerElement = this.add.text(window.innerWidth / 2, 40, "Time: 30", {
            fontSize: "27px", 
            fill: "#fff",
            fontFamily: "Orbitron",
        });
        this.timerElement.setOrigin(0.5);
        console.log(timerElement);
        // Iniciar de nuevo la cuenta atrás del temporizador
        startCountdown(game, timeRemaining);
    }

    update() {
        let { score, lives, timeRemaining, gameOver, player, platforms, cursors, stars, bombs, scene, countdownInterval } = this.game.history;
        
        if (gameOver) {
            return; // Si el juego ha terminado, no hacemos nada
        }

        // Verificar si player tiene un cuerpo de física
        if (player.body) {
            // Movimiento del jugador según las teclas presionadas
            if (cursors.left.isDown) {
                player.setVelocityX(-160);
                player.anims.play("left", true);
            } else if (cursors.right.isDown) {
                player.setVelocityX(160);
                player.anims.play("right", true);
            } else {
                player.setVelocityX(0);
                player.anims.play("turn");
            }

            // Salto del jugador si está tocando el suelo
            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-330);
            }
        }

        // Verificar si el jugador ha ganado
        if (score >= 30 && !gameOver) {
            // Establecer el estado del juego como terminado
            gameOver = true;
            // Pausar la física del juego
            this.physics.pause();
            // Detener el intervalo de la cuenta regresiva del temporizador
            clearInterval(countdownInterval);

            // Mostrar el mensaje de "Winner"
            let winnerText = this.add
                .text(window.innerWidth / 2, window.innerHeight / 2, "Winner", {
                    fontSize: "64px",
                    fill: "#00ff00", // Cambiar el color a verde neón
                    stroke: "#ffffff",
                    strokeThickness: 5,
                    padding: {
                        x: 10,
                        y: 5,
                    },
                })
                .setOrigin(0.5);

            // Estilizar el botón "Back to menu"
            let backToMenuButton = this.add
                .text(
                    window.innerWidth / 2,
                    window.innerHeight / 2 + 100,
                    "Back to menu",
                    {
                        fontSize: "32px",
                        fill: "#ffffff",
                        stroke: "#000000",
                        strokeThickness: 3,
                    }
                )
                .setOrigin(0.5);

            // Habilitar interactividad para el botón "Back to menu"
            backToMenuButton.setInteractive();
            backToMenuButton.on(
                "pointerdown",
                function () {
                    // Ir a la siguiente escena del juego
                    this.scene.start("MenuScene"); // Cambiar por la siguiente escena correspondiente
                },
                this
            );
        }
    }
}
 */

// Configuración del juego GameScene y GameScene2
let config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: [MenuScene, InstructionsScene, InstructionsScene2, InstructionsScene3, InstructionsScene4, GameScene, InstructionsSceneA, InstructionsSceneB],
};

let game = new Phaser.Game(config);