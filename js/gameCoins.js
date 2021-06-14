// Man on a mission
// A simple yet fun game 

/**
 * Constants used in this game.
 */
 var Colors = {
  cherry: 0xe35d6a,
  blue: 0x1560bd,
  white: 0xd8d0d1,
  black: 0x000000,
  brown: 0x4F2412,
  peach: 0xffdab9,
  yellow: 0xffff00,
  olive: 0x556b2f,
  grey: 0x696969,
  sand: 0xc2b280,
  brownDark: 0x23190f,
  green: 0x669900,
  red: 0xFF2B2B,
  skin: 0xDEAA88,
  darkBlue:0x1F263B,
  lightBlue: 0x9CBFE3
};
var camera_x;
var camera_y;
var camera_z_position;
var camera_z_look;
var right;
var left;
var rightClick;
var leftClick
var center;
var deg2Rad = Math.PI / 180;
var score;

// Make a new world when the page is loaded.
window.addEventListener("load", function () {
  new World();
});

/*
 * THE WORLD
 */

/**
 * A class of which the world is an instance. Initializes the game
 * and contains the main game loop.
 *
 */
function World() {
  // Explicit binding of this even in changing contexts.
  var self = this;

  // Scoped variables in this world.
  var element,
    audio,
    audio2,
    source,
    source2,
    scene,
    camera,
    character,
    renderer,
    light,
    objects,
    objectsCoins,
    paused,
    keysAllowed,
    score,
    difficulty,
    spikePresenceProb,
    maxSpikeSize,
    fogDistance,
    gameOver;
    var coinsCollected = 0;
    

  // Initialize the world.
  init();

  /**
   * Builds the renderer, scene, lights, camera, and the character,
   * then begins the rendering loop.
   */
  function init() {
    // Locate where the world is to be located on the screen.
    camera_x=0;
    camera_y=700;
    camera_z_position = -1600;
    camera_z_look = -100000;
    right = false;
    left = false;
    center = true;
    rightClick = false;
    leftClick = false;
    element = document.getElementById("world");

    //initialize sound for spikes
    // audio = document.createElement('audio');
    // source = document.createElement('source');
    // source.src = 'images/sounds/WoodCrashesDistant FS022705.mp3';
    // audio.appendChild(source);

    //initialize sound for coins
    // source = document.createElement('source');
    // source.src = 'images/sounds/zapsplat_multimedia_game_sound_coins_money_collect_bank_006_67722.mp3';
    // audio.appendChild(source);
    // audio.play();

    // Initialize the renderer.
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(element.clientWidth, element.clientHeight);
    renderer.shadowMap.enabled = true;
    element.appendChild(renderer.domElement);

    // Initialize the scene.
    scene = new THREE.Scene();
    fogDistance = 40000;
    scene.fog = new THREE.Fog(0xbadbe4, 1, fogDistance);

    // Initialize the camera with field of view, aspect ratio,
    // near plane, and far plane.
    camera = new THREE.PerspectiveCamera(
      60,
      element.clientWidth / element.clientHeight,
      1,
      120000
    );
    
    //init camera for first time
    camera.position.set(0, camera_y, camera_z_position);
    camera.lookAt(new THREE.Vector3(0, 650, camera_z_look));
    window.camera = camera;

    // Set up resizing capabilities.
    window.addEventListener("resize", handleWindowResize, false);

    // Initialize the lights.
    light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(light);

    // Initialize the character and add it to the scene.
    character = new Character();
    scene.add(character.element);

    // //creating sound for coin
    // const listener = new
    // Three.AudioListener();
    // camera.add(listener);
    // const sound = new THREE.PositionalAudio(listener);
    // const audioLoader = new THREE.AudioLoader();
    // audioLoader.load('images/sounds/zapsplat_multimedia_game_sound_coins_money_collect_bank_006_67722.mp3')
    
    // function(buffer){
    //   sound.setBuffer(buffer);
    //   sound.setRefDistance(20);

    // }

    //Create Running Platform
    var geometry = new THREE.BoxGeometry(8000, 0, 120000);
    const loader = new THREE.TextureLoader().load( "images/23886804.jpg", (texture) => {
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, -400, -60000);
      loader.wrapS = THREE.RepeatWrapping;
      loader.wrapT = THREE.RepeatWrapping;
      loader.repeat.set( 3, 1);
      scene.add(cube);
    });

    var geometryLeft = new THREE.BoxGeometry(3000, 1000, 120000);
    const loaderLeft = new THREE.TextureLoader().load( "images/images (1).jpg", (texture) => {
      const materialLeft = new THREE.MeshBasicMaterial({ map: texture });
      const cubeLeft = new THREE.Mesh(geometryLeft, materialLeft);
      cubeLeft.position.set(-1800, -400, -60000);
      loaderLeft.wrapS = THREE.RepeatWrapping;
      loaderLeft.wrapT = THREE.RepeatWrapping;
      loaderLeft.repeat.set(100, 50);
      scene.add(cubeLeft);
      cubeLeft.rotation.z =-1.5;
    });

    var geometryRight = new THREE.BoxGeometry(3000, 1000, 120000);
    const loaderRight = new THREE.TextureLoader().load( "images/images (1).jpg", (texture) => {
      const materialRight = new THREE.MeshBasicMaterial({ map: texture });
      const cubeRight = new THREE.Mesh(geometryRight, materialRight);
      cubeRight.position.set(1800, -400, -60000);
      loaderRight.wrapS = THREE.RepeatWrapping;
      loaderRight.wrapT = THREE.RepeatWrapping;
      loaderRight.repeat.set(100, 50);
      scene.add(cubeRight);
      cubeRight.rotation.z =1.5;
    });

    objects = [];
    objectsCoins = [];
    spikePresenceProb = 0.2;
    maxSpikeSize = 0.5;
    for (var i = 10; i < 40; i++) {
      createRowOfSpikes(i * -3000, spikePresenceProb, 0.5, maxSpikeSize);
    }
    for (var i = 10; i < 40; i++) {
      createRowOfCoins(i * -3000, spikePresenceProb, 0.5, maxSpikeSize);
    }


    // The game is paused to begin with and the game is not over.
    gameOver = false;
    paused = true;

    // Start receiving feedback from the player.
    var left = 37;
    var up = 38;
    var right = 39;
    var p = 80;

    keysAllowed = {};
    document.addEventListener("click", 
    function(){
      paused = true;
            character.onPause();
            document.getElementById("variable-content").style.visibility =
              "visible";
            document.getElementById("variable-content").innerHTML =
              "Game is paused. Press any key to resume.";
    })
    document.addEventListener("keydown", function (e) {
      if (!gameOver) {
        var key = e.keyCode;
        if (keysAllowed[key] === false) return;
        keysAllowed[key] = false;
        if (paused && !collisionsDetected() && key > 18) {
          paused = false;
          character.onUnpause();
          document.getElementById("variable-content").style.visibility =
            "hidden";
          document.getElementById("controls").style.display = "none";
        } else {
          if (key == p) {
            paused = true;
            character.onPause();
            document.getElementById("variable-content").style.visibility =
              "visible";
            document.getElementById("variable-content").innerHTML =
              "Game is paused. Press any key to resume.";
          }
          if (key == up && !paused) {
            character.onUpKeyPressed();
          }
          if (key == left && !paused) {
            character.onLeftKeyPressed();
          }
          if (key == right && !paused) {
            character.onRightKeyPressed();
          }
        }
      }
    });
    document.addEventListener("keyup", function (e) {
      keysAllowed[e.keyCode] = true;
    });
    document.addEventListener("focus", function (e) {
      keysAllowed = {};
    });

    // Initialize the scores and difficulty.
    score = 0;
    difficulty = 0;
    document.getElementById("score").innerHTML = score;
    document.getElementById("coins").innerHTML = coinsCollected;

    // Begin the rendering loop.
    loop();
  }

  /**
   * The main animation loop.
   */
  function loop() {
    // Update the game.
    if (!paused) {
      // Add more spikes and increase the difficulty.
      if (objects[objects.length - 1].mesh.position.z % 3000 == 0) {
        difficulty += 1;
        var levelLength = 100;
        if (difficulty % levelLength == 0) {
          var level = difficulty / levelLength;
          switch (level) {
            case 1:
              spikePresenceProb = 0.35;
              break;
            case 2:
              spikePresenceProb = 0.37;
              break;
            case 3:
              spikePresenceProb = 0.39;
              break;
            case 4:
              spikePresenceProb = 0.41;
              break;
            case 5:
              spikePresenceProb = 0.43;
              break;
            case 6:
              spikePresenceProb = 0.45;
              break;

          }
        }
        if (difficulty >= 5 * levelLength && difficulty < 6 * levelLength) {
          fogDistance -= 25000 / levelLength;
        } else if (
          difficulty >= 8 * levelLength &&
          difficulty < 9 * levelLength
        ) {
          fogDistance -= 5000 / levelLength;
        }
  
        if (score > 1){
          // window.alert(score)
          createRowOfSpikes(-125000, spikePresenceProb, 0.5, maxSpikeSize);
          createRowOfCoins(-119500, spikePresenceProb, 0.5, maxSpikeSize);
          scene.fog.far = fogDistance;
        }
        // createRowOfSpikes(-120000, spikePresenceProb, 0.5, maxSpikeSize);
        // createRowOfCoins(-120000, spikePresenceProb, 0.5, maxSpikeSize);
        // scene.fog.far = fogDistance;
      }

      // Move the spikess closer to the character.
      objects.forEach(function (object) {
        object.mesh.position.z += 100;
      });
      // Move the coins closer to the character.
      objectsCoins.forEach(function (object) {
        object.mesh.position.z += 100;
      });

      // Remove spikes that are outside of the world.
      objects = objects.filter(function (object) {
        return object.mesh.position.z < 0;
      });
      // Remove coins that are outside of the world.
      objectsCoins = objectsCoins.filter(function (object) {
        return object.mesh.position.z < 0;
      });

      // Make the character move according to the controls.
      character.update();

      // Check for collisions between the character and coin.
      if (collisionsDetectedCoin()) {
        coinsCollected+=1;
        //adds sound
        audio = document.createElement('audio');
        source = document.createElement('source');
        source.src = 'images/sounds/zapsplat_multimedia_game_sound_coins_money_collect_bank_006_67722.mp3';
        audio.appendChild(source);
        audio.play();
        
        console.log(coinsCollected)
       }
       //end game at a certain score that relates to the end of the road
      if(score==14400){
        console.log(character.element.position.z)
        gameOver = true;
        paused = true;
        
      }
      // Check for collisions between the character and objects.
      if (collisionsDetected()) {
        gameOver = true;
        paused = true;
        document.addEventListener("keydown", function (e) {
          if (e.keyCode == 40) document.location.reload(true);
        });
        //Adds crash when character hits the obstacle
        audio = document.createElement('audio');
        source = document.createElement('source');
        source.src = 'images/sounds/WoodCrashesDistant FS022705.mp3';
        audio.appendChild(source);
        audio.play();

        var variableContent = document.getElementById("variable-content");
        variableContent.style.visibility = "visible";
        variableContent.innerHTML =
          "Game over! Press the down arrow to try again.";
        var table = document.getElementById("ranks");
        var rankNames = [
          "Typical Engineer",
          "Couch Potato",
          "Weekend Jogger",
          "Daily Runner",
          "Local Prospect",
          "Regional Star",
          "National Champ",
          "Second Mo Farah",
        ];
        var rankIndex = Math.floor(score / 15000);

        // If applicable, display the next achievable rank.
        if (score < 124000) {
          var nextRankRow = table.insertRow(0);
          nextRankRow.insertCell(0).innerHTML =
            rankIndex <= 5
              ? "".concat((rankIndex + 1) * 15, "k-", (rankIndex + 2) * 15, "k")
              : rankIndex == 6
              ? "105k-124k"
              : "124k+";
          nextRankRow.insertCell(1).innerHTML =
            "*Score within this range to earn the next rank*";
        }

        // Display the achieved rank.
        var achievedRankRow = table.insertRow(0);
        achievedRankRow.insertCell(0).innerHTML =
          rankIndex <= 6
            ? "".concat(rankIndex * 15, "k-", (rankIndex + 1) * 15, "k").bold()
            : score < 124000
            ? "105k-124k".bold()
            : "124k+".bold();
        achievedRankRow.insertCell(1).innerHTML =
          rankIndex <= 6
            ? "Congrats! You're a ".concat(rankNames[rankIndex], "!").bold()
            : score < 124000
            ? "Congrats! You're a ".concat(rankNames[7], "!").bold()
            : "Congrats! You exceeded the creator's high score of 123790 and beat the game!".bold();

        // Display all ranks lower than the achieved rank.
        if (score >= 120000) {
          rankIndex = 7;
        }
        for (var i = 0; i < rankIndex; i++) {
          var row = table.insertRow(i);
          row.insertCell(0).innerHTML = "".concat(
            i * 15,
            "k-",
            (i + 1) * 15,
            "k"
          );
          row.insertCell(1).innerHTML = rankNames[i];
        }
        if (score > 124000) {
          var row = table.insertRow(7);
          row.insertCell(0).innerHTML = "105k-124k";
          row.insertCell(1).innerHTML = rankNames[7];
        }
      }

      

      // Update the scores.
      score += 10;
      document.getElementById("score").innerHTML = score;

      // Update the coins collected.
      document.getElementById("coins").innerHTML = coinsCollected;
    }

    // Render the page and repeat.
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  /**
   * A method called when window is resized.
   */
  function handleWindowResize() {
    renderer.setSize(element.clientWidth, element.clientHeight);
    camera.aspect = element.clientWidth / element.clientHeight;
    camera.updateProjectionMatrix();
  }

  /**
   * Creates and returns a row of spikes with coins on top according to the specifications.
   *
   * @param {number} POSITION The z-position of the row of spikes.
   * @param {number} PROBABILITY The probability that a given lane in the row
   *                             has a spikes.
   * @param {number} MINSCALE The minimum size of the spikes. The spikes have a
   *							uniformly distributed size from minScale to maxScale.
   * @param {number} MAXSCALE The maximum size of the spikes.
   *
   */
  function createRowOfSpikes(position, probability, minScale, maxScale) {
    for (var lane = -1; lane < 2; lane++) {
      var randomNumber = Math.random();
      if (randomNumber < probability) {
        var scale = 0.50
        var spike = new Spike(lane * 800, -400, position, scale, score);
        objects.push(spike);
        scene.add(spike.mesh);

      }
    }
  }

  function createRowOfCoins(position, probability, minScale, maxScale) {
    for (var lane = -1; lane < 2; lane++) {
      var randomNumber = Math.random();
      if (randomNumber < probability) {
        var scaleCoin = 0.5
        var coin = new CoinFunc(lane * 800, -400, position, scaleCoin)
        objectsCoins.push(coin)
        // objectsCoins.pop(coin)
        scene.add(coin.mesh)
        // scene.remove(coin.mesh)
      }
    }
  }

  /**
   * Returns true if and only if the character is currently colliding with
   * an object on the map.
   */
  function collisionsDetected() {
    var charMinX = character.element.position.x - 115;
    var charMaxX = character.element.position.x + 115;
    var charMinY = character.element.position.y - 310;
    var charMaxY = character.element.position.y + 320;
    var charMinZ = character.element.position.z - 40;
    var charMaxZ = character.element.position.z + 40;

    for (var i = 0; i < objects.length; i++) {
      if (objects[i].collides(charMinX,charMaxX,charMinY,charMaxY,charMinZ,charMaxZ)) {
        return true;
      }
    }

    return false;
  }

  function collisionsDetectedCoin() {
    var charMinX = character.element.position.x - 115;
    var charMaxX = character.element.position.x + 115;
    var charMinY = character.element.position.y - 310;
    var charMaxY = character.element.position.y + 320;
    var charMinZ = character.element.position.z - 40;
    var charMaxZ = character.element.position.z + 40;

    for (var i = 0; i < objectsCoins.length; i++) {
      if (objectsCoins[i].collides(charMinX,charMaxX,charMinY,charMaxY,charMinZ,charMaxZ)) {
        scene.remove(objectsCoins[i].mesh)
        return true;
      }
    }
    return false;
  }
  
}//enf of world function

/**
 *
 * IMPORTANT OBJECTS
 *
 * The character and environmental objects in the game.
 *
 */

/**
 * The player's character in the game.
 */
function Character() {
  // Explicit binding of this even in changing contexts.
  var self = this;

  // Character defaults that don't change throughout the game.
  this.skinColor = Colors.skin;
  this.hairColor = Colors.brown;
  this.shirtColor = Colors.lightBlue;
  this.shortsColor = Colors.blue;
  this.jumpDuration = 0.6;
  this.jumpHeight = 1000;

  // Initialize the character.
  init();

  /**
   * Builds the character in depth-first order. The parts of are
   * modelled by the following object hierarchy:
   *
   * - character (this.element)
   *    - head
   *       - face
   *       - hair
   *    - torso
   *    - leftArm
   *       - leftLowerArm
   *    - rightArm
   *       - rightLowerArm
   *    - leftLeg
   *       - rightLowerLeg
   *    - rightLeg
   *       - rightLowerLeg
   *
   * Also set up the starting values for evolving parameters throughout
   * the game.
   *
   */
  function init() {
    // Build the character.
    self.face = createBox(100, 100, 60, self.skinColor, 0, 0, 0);
    self.hair = createBox(105, 20, 65, self.hairColor, 0, 50, 0);
    self.head = createGroup(0, 260, -25);
    self.head.add(self.face);
    self.head.add(self.hair);

    self.torso = createBox(150, 190, 40, self.shirtColor, 0, 100, 0);

    self.leftLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
    self.leftArm = createLimb(30, 140, 40, self.skinColor, -100, 190, -10);
    self.leftArm.add(self.leftLowerArm);

    self.rightLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
    self.rightArm = createLimb(30, 140, 40, self.skinColor, 100, 190, -10);
    self.rightArm.add(self.rightLowerArm);

    self.leftLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
    self.leftLeg = createLimb(50, 170, 50, self.shortsColor, -50, -10, 30);
    self.leftLeg.add(self.leftLowerLeg);

    self.rightLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
    self.rightLeg = createLimb(50, 170, 50, self.shortsColor, 50, -10, 30);
    self.rightLeg.add(self.rightLowerLeg);

    self.element = createGroup(0, 0, -4000);
    self.element.add(self.head);
    self.element.add(self.torso);
    self.element.add(self.leftArm);
    self.element.add(self.rightArm);
    self.element.add(self.leftLeg);
    self.element.add(self.rightLeg);

    // Initialize the player's changing parameters.
    self.isJumping = false;
    self.isSwitchingLeft = false;
    self.isSwitchingRight = false;
    self.currentLane = 0;
    self.runningStartTime = new Date() / 1000;
    self.pauseStartTime = new Date() / 1000;
    self.stepFreq = 2;
    self.queuedActions = [];
  }

  /**
   * Creates and returns a limb with an axis of rotation at the top.
   *
   * @param {number} DX The width of the limb.
   * @param {number} DY The length of the limb.
   * @param {number} DZ The depth of the limb.
   * @param {color} COLOR The color of the limb.
   * @param {number} X The x-coordinate of the rotation center.
   * @param {number} Y The y-coordinate of the rotation center.
   * @param {number} Z The z-coordinate of the rotation center.
   * @return {THREE.GROUP} A group that includes a box representing
   *                       the limb, with the specified properties.
   *
   */
  function createLimb(dx, dy, dz, color, x, y, z) {
    var limb = createGroup(x, y, z);
    var offset = -1 * (Math.max(dx, dz) / 2 + dy / 2);
    var limbBox = createBox(dx, dy, dz, color, 0, offset, 0);
    limb.add(limbBox);
    return limb;
  }

  /**
   * A method called on the character when time moves forward.
   */
  this.update = function () {
    // Obtain the curren time for future calculations.
    var currentTime = new Date() / 1000;

    // Apply actions to the character if none are currently being
    // carried out.
    if (
      !self.isJumping &&
      !self.isSwitchingLeft &&
      !self.isSwitchingRight &&
      self.queuedActions.length > 0
    ) {
      switch (self.queuedActions.shift()) {
        case "up":
          self.isJumping = true;
          self.jumpStartTime = new Date() / 1000;
          break;
        case "left":
          if (self.currentLane != -1) {
            self.isSwitchingLeft = true;
            left = true;
            leftClick = true;
            // camera_x -= 750;
            // camera.position.set(camera_x, 1500, -2000);
            // camera.lookAt(new THREE.Vector3(0, 600, -5000));
          }
          break;
        case "right":
          if (self.currentLane != 1) {
            self.isSwitchingRight = true;
            right = true;
            rightClick = true;
            // camera_x += 750;
            // camera.position.set(camera_x, 1500, -2000);
            // camera.lookAt(new THREE.Vector3(0, 600, -5000));
          }
          break;
      }
    }
    // camera.position.set(camera_x, 700, -1600);
    // camera.lookAt(new THREE.Vector3(camera_x, 650, -10000));

    // if(camera_y >= 650){
    //   camera_y -=1;
    // }

    //follow character
    camera_z_position -= 80;
    camera_z_look -= 80;

    if(right){
      if(center){
        if(camera_x < 750){
          camera_x +=187.5;
        }
        else{
          right = false;
          center = false;
        }
      }
      else{ //currently at left lane
        if(rightClick){ //right click
          if(camera_x == -750){ //begining of left lane
            camera_x +=187.5;
            rightClick = false;
          }
        }
        else{
          if(camera_x < 0){ // no right click
            camera_x +=187.5;
          }
          else{
            right = false;
            center = true;
          }
        } 
      }
    }

    if(left){
      if(center){
        if(camera_x > -750){
          camera_x -=187.5;
        }
        else{
          left = false;
          center = false;
        }
      }
      else{ //currently at right lane
        if(leftClick){ //right click
          if(camera_x == 750){ //begining of right lane
            camera_x -=187.5;
            leftClick = false;
          }
        }
        else{
          if(camera_x > 0){ // no right click
            camera_x -=187.5;
          }
          else{
            left = false;
            center = true;
          }
        } 
      }
    }

    camera.position.set(camera_x, camera_y, camera_z_position);
    camera.lookAt(new THREE.Vector3(camera_x, 650, camera_z_look));

    window.camera = camera;

    // If the character is jumping, update the height of the character.
    // Otherwise, the character continues running.
    if (self.isJumping) {
      var jumpClock = currentTime - self.jumpStartTime;
      self.element.position.y =
        self.jumpHeight *
          Math.sin((1 / self.jumpDuration) * Math.PI * jumpClock) +
        sinusoid(
          2 * self.stepFreq,
          0,
          20,
          0,
          self.jumpStartTime - self.runningStartTime
        );
      if (jumpClock > self.jumpDuration) {
        self.isJumping = false;
        self.runningStartTime += self.jumpDuration;
      }
    } else {
      var runningClock = currentTime - self.runningStartTime;
      self.element.position.y = sinusoid(
        2 * self.stepFreq,
        0,
        20,
        0,
        runningClock
      );
      self.head.rotation.x =
        sinusoid(2 * self.stepFreq, -10, -5, 0, runningClock) * deg2Rad;
      self.torso.rotation.x =
        sinusoid(2 * self.stepFreq, -10, -5, 180, runningClock) * deg2Rad;
      self.leftArm.rotation.x =
        sinusoid(self.stepFreq, -70, 50, 180, runningClock) * deg2Rad;
      self.rightArm.rotation.x =
        sinusoid(self.stepFreq, -70, 50, 0, runningClock) * deg2Rad;
      self.leftLowerArm.rotation.x =
        sinusoid(self.stepFreq, 70, 140, 180, runningClock) * deg2Rad;
      self.rightLowerArm.rotation.x =
        sinusoid(self.stepFreq, 70, 140, 0, runningClock) * deg2Rad;
      self.leftLeg.rotation.x =
        sinusoid(self.stepFreq, -20, 80, 0, runningClock) * deg2Rad;
      self.rightLeg.rotation.x =
        sinusoid(self.stepFreq, -20, 80, 180, runningClock) * deg2Rad;
      self.leftLowerLeg.rotation.x =
        sinusoid(self.stepFreq, -130, 5, 240, runningClock) * deg2Rad;
      self.rightLowerLeg.rotation.x =
        sinusoid(self.stepFreq, -130, 5, 60, runningClock) * deg2Rad;

      // If the character is not jumping, it may be switching lanes.
      if (self.isSwitchingLeft) {
        self.element.position.x -= 200;
        var offset = self.currentLane * 800 - self.element.position.x;
        if (offset > 800) {
          self.currentLane -= 1;
          self.element.position.x = self.currentLane * 800;
          self.isSwitchingLeft = false;
        }
      }
      if (self.isSwitchingRight) {
        self.element.position.x += 200;
        var offset = self.element.position.x - self.currentLane * 800;
        if (offset > 800) {
          self.currentLane += 1;
          self.element.position.x = self.currentLane * 800;
          self.isSwitchingRight = false;
        }
      }
    }
    //move person forward
    self.element.position.z -= 80;
  };

  /**
   * Handles character activity when the left key is pressed.
   */
  this.onLeftKeyPressed = function () {
    self.queuedActions.push("left");
  };

  /**
   * Handles character activity when the up key is pressed.
   */
  this.onUpKeyPressed = function () {
    self.queuedActions.push("up");
  };

  /**
   * Handles character activity when the right key is pressed.
   */
  this.onRightKeyPressed = function () {
    self.queuedActions.push("right");
  };

  /**
   * Handles character activity when the game is paused.
   */
  this.onPause = function () {
    self.pauseStartTime = new Date() / 1000;
  };

  /**
   * Handles character activity when the game is unpaused.
   */
  this.onUnpause = function () {
    var currentTime = new Date() / 1000;
    var pauseDuration = currentTime - self.pauseStartTime;
    self.runningStartTime += pauseDuration;
    if (self.isJumping) {
      self.jumpStartTime += pauseDuration;
    }
  };
}

/**
 * A collidable spike in the game positioned at X, Y, Z in the scene and with
 * scale S.
 */
function Spike(x, y, z, s,score) {
  // Explicit binding.
  var self = this;

  // The object portrayed in the scene.
  this.mesh = new THREE.Object3D();

  //make metallic spikes

  var spikeMiddle = createCylinder(0, 150, 750, 64, Colors.grey, 250, 500, 0);
  var spikeLeft = createCylinder(0, 150, 750, 64, Colors.grey, 0, 500, 0);
  var spikeRight = createCylinder(0, 150, 750, 64, Colors.grey, -250, 500, 0);


  if (score>11100){
  var geometry = new THREE.BoxGeometry(3500, 4000, 100);
  const loader = new THREE.TextureLoader();
  loader.load("images/level_up.jpg", (texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    this.mesh.add(cube);
  });

  this.mesh.add(spikeMiddle);
  // this.mesh.add(spikeLeft);
  // this.mesh.add(spikeRight);

  this.mesh.position.set(0, 370*5, z);
  this.mesh.scale.set(0.65, 0.33, 1);
  // this.scale = s;

  this.collides = function (minX, maxX, minY, maxY, minZ, maxZ) {
    var spikeMinX = self.mesh.position.x - this.scale * 250;
    var spikeMaxX = self.mesh.position.x + this.scale * 250;
    var spikeMinY = self.mesh.position.y;
    var spikeMaxY = self.mesh.position.y + this.scale * 1150;
    var spikeMinZ = self.mesh.position.z - this.scale * 250;
    var spikeMaxZ = self.mesh.position.z + this.scale * 250;
    return (spikeMinX <= maxX && spikeMaxX >= minX && spikeMinY <= maxY && spikeMaxY >= minY && spikeMinZ <= maxZ && spikeMaxZ >= minZ );
  };
 }


 else{
  var geometry = new THREE.BoxGeometry(1000, 500, 500);
  const loader = new THREE.TextureLoader();
  loader.load("js/future_text.jpg", (texture) => {
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    this.mesh.add(cube);
  });

  this.mesh.add(spikeMiddle);
  this.mesh.add(spikeLeft);
  this.mesh.add(spikeRight);

  this.mesh.position.set(x, y, z);
  this.mesh.scale.set(s, s, s);
  this.scale = s;

  this.collides = function (minX, maxX, minY, maxY, minZ, maxZ) {
    var spikeMinX = self.mesh.position.x - this.scale * 250;
    var spikeMaxX = self.mesh.position.x + this.scale * 250;
    var spikeMinY = self.mesh.position.y;
    var spikeMaxY = self.mesh.position.y + this.scale * 1150;
    var spikeMinZ = self.mesh.position.z - this.scale * 250;
    var spikeMaxZ = self.mesh.position.z + this.scale * 250;
    return (spikeMinX <= maxX && spikeMaxX >= minX && spikeMinY <= maxY && spikeMaxY >= minY && spikeMinZ <= maxZ && spikeMaxZ >= minZ );
  };
 }

}

function CoinFunc(x, y, z, s) {
  // Explicit binding.
  var self = this;

  // The object portrayed in the scene.
  this.mesh = new THREE.Object3D();

  //Insert Coin
  const texture = new THREE.TextureLoader().load( "js/coin_text.jpg" );

  const material = new THREE.MeshStandardMaterial({map: texture})

  var geometry = new THREE.CylinderGeometry(300,300,40,100);
  const coin = new THREE.Mesh(geometry,material)
  coin.position.set(0,2500,0)
  coin.rotation.x=2
  coin.rotation.y = 1.5

  this.mesh.add(coin)
  //this.mesh.add(sound)

  this.mesh.position.set(x, y, z);
  this.mesh.scale.set(s, s, s);
  this.scale = s;

  /**
   * A method that detects whether this coin is colliding with the character,
   * which is modelled as a box bounded by the given coordinate space.
   */
  this.collides = function (minX, maxX, minY, maxY, minZ, maxZ) {
    var coinMinX = this.mesh.position.x - this.scale * 250;
    var coinMaxX = this.mesh.position.x + this.scale * 250;
    var coinMinY = this.mesh.position.y+1250;
    var coinMaxY = this.mesh.position.y + this.scale * 1150+1250;
    var coinMinZ = this.mesh.position.z - this.scale * 250;
    var coinMaxZ = this.mesh.position.z + this.scale * 250;
    return (coinMinX <= maxX && coinMaxX >= minX && coinMinY <= maxY && coinMaxY >= minY && coinMinZ <= maxZ && coinMaxZ >= minZ );
  };

}

/**
 *
 * UTILITY FUNCTIONS
 *
 * Functions that simplify and minimize repeated code.
 *
 */

/**
 * Utility function for generating current values of sinusoidally
 * varying variables.
 *
 * @param {number} FREQUENCY The number of oscillations per second.
 * @param {number} MINIMUM The minimum value of the sinusoid.
 * @param {number} MAXIMUM The maximum value of the sinusoid.
 * @param {number} PHASE The phase offset in degrees.
 * @param {number} TIME The time, in seconds, in the sinusoid's scope.
 * @return {number} The value of the sinusoid.
 *
 */
function sinusoid(frequency, minimum, maximum, phase, time) {
  var amplitude = 0.5 * (maximum - minimum);
  var angularFrequency = 2 * Math.PI * frequency;
  var phaseRadians = (phase * Math.PI) / 180;
  var offset = amplitude * Math.sin(angularFrequency * time + phaseRadians);
  var average = (minimum + maximum) / 2;
  return average + offset;
}

/**
 * Creates an empty group of objects at a specified location.
 *
 * @param {number} X The x-coordinate of the group.
 * @param {number} Y The y-coordinate of the group.
 * @param {number} Z The z-coordinate of the group.
 * @return {Three.Group} An empty group at the specified coordinates.
 *
 */
function createGroup(x, y, z) {
  var group = new THREE.Group();
  group.position.set(x, y, z);
  return group;
}

/**
 * Creates and returns a simple box with the specified properties.
 *
 * @param {number} DX The width of the box.
 * @param {number} DY The height of the box.
 * @param {number} DZ The depth of the box.
 * @param {color} COLOR The color of the box.
 * @param {number} X The x-coordinate of the center of the box.
 * @param {number} Y The y-coordinate of the center of the box.
 * @param {number} Z The z-coordinate of the center of the box.
 * @param {boolean} NOTFLATSHADING True iff the flatShading is false.
 * @return {THREE.Mesh} A box with the specified properties.
 *
 */
function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
  var geom = new THREE.BoxGeometry(dx, dy, dz);
  var mat = new THREE.MeshPhongMaterial({
    color: color,
    flatShading: notFlatShading != true,
  });
  var box = new THREE.Mesh(geom, mat);
  box.castShadow = true;
  box.receiveShadow = true;
  box.position.set(x, y, z);
  return box;
}

/**
 * Creates and returns a (possibly asymmetrical) cyinder with the
 * specified properties.
 *
 * @param {number} RADIUSTOP The radius of the cylinder at the top.
 * @param {number} RADIUSBOTTOM The radius of the cylinder at the bottom.
 * @param {number} HEIGHT The height of the cylinder.
 * @param {number} RADIALSEGMENTS The number of segmented faces around
 *                                the circumference of the cylinder.
 * @param {color} COLOR The color of the cylinder.
 * @param {number} X The x-coordinate of the center of the cylinder.
 * @param {number} Y The y-coordinate of the center of the cylinder.
 * @param {number} Z The z-coordinate of the center of the cylinder.
 * @return {THREE.Mesh} A box with the specified properties.
 */


function createCylinder( radiusTop, radiusBottom, height, radialSegments, color, x, y, z) {

  var geom = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radialSegments);
  const texture = new THREE.TextureLoader().load( "js/future_text.jpg" );
  const mat = new THREE.MeshStandardMaterial({map: texture})
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;

  // var mat = new THREE.MeshPhongMaterial({
  //   color: color,
  //   flatShading: true,
  // });
  // var cylinder = new THREE.Mesh(geom, mat);

  // cylinder.castShadow = true;
  // cylinder.receiveShadow = true;
  // cylinder.position.set(x, y, z);
  // return cylinder;
}
