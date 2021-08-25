var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scaleMode: 3,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: true,
    },
  },
  pixelArt: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  backgroundColor: '#0f86fc',
};

let gameOver = false;
let objectsCount = 0;

var game = new Phaser.Game(config);
function preload() {
  // this.load.image('base_tiles', './assets/monochrome_tilemap.png');
  // this.load.tilemapTiledJSON('monochrome_tilemap', './assets/caitlyn2.json');
  this.load.image('sky', 'assets/blue-sky.jpg');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('dino-idle', 'assets/dino-idle.png');
  this.load.image('dino-run', 'assets/dino-run.png');
  this.load.image('dino', 'assets/dino-hurt.png');
  this.load.image('bomb', 'assets/shrimp.png');
  // this.load.image('bomb', 'assets/chickenLeg.png');
  this.load.image('out', 'assets/star.png');
  this.load.image('chicken', 'assets/pollo.png');
  this.load.image('caitlyn', 'assets/caitlyn.png');
  this.load.image('caitlyn-love', 'assets/caitlyn-love.png');
  this.load.image('caitlyn-mad', 'assets/caitlyn-mad.png');
  this.load.image('caitlyn-mad-backup', 'assets/caitlyn-mad-backup.png');
  this.load.image('background', 'assets/plx-2.png');
  this.load.image('selva', 'assets/selva.png');
  this.load.image('jose', 'assets/jose.png');
  this.load.spritesheet('skin', 'assets/Woodcutter_idle.png', { frameWidth: 48, frameHeight: 48 });
  this.load.spritesheet('jose-animation', 'assets/jose-animation.png', { frameWidth: 21, frameHeight: 28 });
}

function create() {
  this.add.image(200, 200, 'sky');
  let jungleGround = this.add.image(innerWidth / 2, innerHeight - 30, 'selva');
  jungleGround.setScale(2.7, 2);
  // this.add.image(200, 200, 'caitlyn');
  // let background = this.add.image(innerWidth - 45, innerHeight / 2, 'background');
  // background.setScale(2, 3);

  this.add.image(innerWidth - 45, 40, 'caitlyn-love');
  this.add.image(innerWidth - 45, 100, 'caitlyn-mad');
  this.add.image(innerWidth - 45, 160, 'caitlyn-mad-backup');
  this.add.image(innerWidth - 45, 220, 'caitlyn');

  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '20px', fill: '#000' });
  // let startText = this.add.text(innerWidth / 2, innerHeight / 2, 'score: 0', { fontSize: '20px', fill: '#000', boundsAlignH: 'center', boundsAlignV: 'middle' }).setOrigin(0.5, 0.5);

  const { height, width } = this.game.config;
  this.gameSpeed = 10;
  // this.ground = this.add.tileSprite(0, height, width, 26, 'ground').setOrigin(0, 1);
  this.ground = this.physics.add.sprite(200, height, 'ground').setCollideWorldBounds(true).setOrigin(0, 1);

  this.dino = this.physics.add
    .sprite(20, height - 40, 'jose')
    .setCollideWorldBounds(true)
    // .setGravityY(5000)
    .setOrigin(0, 1)
    .setScale(3);

  this.out = this.physics.add.staticGroup();

  this.out.create(20, height - 240, 'out');

  bar = this.add.graphics();

  bar.fillStyle(0xffff00, 1);

  //  32px radius on the corners
  bar.fillRoundedRect(60, 30, 200, 20, 10);

  // this.out = this.physics.add
  //   .sprite(20, height - 100, 'out')
  //   .setCollideWorldBounds(true)
  //   .setGravityY(0)
  //   .setOrigin(0, 1);

  this.createControll = () => {
    this.input.keyboard.on('keydown_SPACE', () => {
      if (!this.dino.body.onFloor()) {
        return;
      }
      this.dino.setTexture('dino', 0);
      this.dino.setVelocityY(-1900);
    });
  };

  this.createControll();

  this.initAnims = () => {
    this.anims.create({
      key: 'dino-run',
      frames: this.anims.generateFrameNumbers('dino', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  };

  stars = this.physics.add.group({
    key: 'bomb',
    repeat: 5,
    setXY: { x: 30, y: 0, stepX: 32 * 2 },
    // setScale: { x: 2, y: 2 },
  });

  chicken = this.physics.add.group({
    key: 'chicken',
    repeat: 5,
    setXY: { x: 30, y: 0, stepX: 32 * 2 },
    // setScale: { x: 2, y: 2 },
  });

  window.setTimeout(() => {
    deleteBombs();
  }, 1000);

  window.setTimeout(() => {
    showBombs();
  }, 2000);

  // chicken = this.physics.add.group({
  //   key: 'chicken',
  //   repeat: 2,
  //   setXY: { x: 30, y: 60, stepX: 32 * 2 },
  //   // setScale: { x: 2, y: 2 },
  // });

  // this.physics.add.collider(stars, this.dino);
  // this.physics.add.collider(stars, this.out);

  console.log(stars);

  this.physics.add.overlap(this.dino, stars, caitlynDislikes, null, this);
  this.physics.add.overlap(this.dino, chicken, caitlynLoves, null, this);
  this.physics.add.overlap(this.ground, stars, destroyOut, null, this);

  this.physics.add.collider(this.dino, this.ground);

  var score = 0;
  var scoreText;

  function caitlynDislikes(dino, star) {
    score -= 10;
    scoreText.setText('Score: ' + score);

    star.y -= Math.random() * (1500 - 600) + 1500;
    star.body.setAllowGravity(false);
    this.dino.tint = 0xff0000;
    // this.tweens.add({
    //   targets: this.dino,
    //   alpha: 0.5,
    //   ease: 'Cubic.easeOut',
    //   duration: 200,
    //   repeat: 0,
    //   yoyo: true,
    // });
    setTimeout(() => {
      this.dino.clearTint();
    }, 200);
  }

  function caitlynLoves(dino, whatSheLoves) {
    score += 10;
    scoreText.setText('Score: ' + score);

    whatSheLoves.y -= Math.random() * (1500 - 600) + 1500;
    whatSheLoves.body.setAllowGravity(false);
  }

  // this.physics.add.collider(stars, this.ground);

  function destroyOut(out, star) {
    // stars.x = 10;
    console.log('Bomb');
    console.log(star);
    // star.disableBody(true, true);
    star.y -= Math.random() * (1500 - 600) + 1500;
    star.body.setAllowGravity(false);
    // this.dino.tint = 0xff0000;
  }

  function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
      stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });

      var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  // this.physics.add.collider(stars, this.ground);
  this.physics.add.overlap(this.out, stars, destroyOut, null, this);

  // rest of the code
  // dino = this.physics.add.sprite(0, height, 'dino-idle').setCollideWorldBounds(true).setGravityY(5000).setOrigin(0, 1);
  // this.createControll();

  // function createControll() {
  //   this.input.keyboard.on('keydown_SPACE', () => {
  //     if (!this.dino.body.onFloor()) {
  //       return;
  //     }
  //     this.dino.setTexture('dino', 0);
  //     this.dino.setVelocityY(-1600);
  //   });
  // }

  // this.map = this.make.tilemap({ key: 'level1' });
  // this.add.image(440, 440, 'base_tiles');
  // const map = this.make.tilemap({ key: 'monochrome_tilemap' });
  // // add the tileset image we are using
  // const tileset = map.addTilesetImage('monochrome_tilemap', 'base_tiles');
  // // create the layers we want in the right order
  // map.createStaticLayer('Background', tileset);
  // "Ground" layer will be on top of "Background" layer
  // map.createStaticLayer('Ground', tileset);

  this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('skin', { start: 0, end: 4 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: 'jose',
    frames: this.anims.generateFrameNumbers('jose-animation', { start: 0, end: 4 }),
    frameRate: 5,
    repeat: -1,
  });

  skin = this.physics.add.sprite(100, 100, 'skin');
  skin.anims.play('walk', true);

  this.dino.anims.play('jose', true);
  // skin.anims.play('walk', true);
}

function update() {
  // this.ground.tilePositionX += this.gameSpeed;

  // if (this.dino.body.deltaAbsY() > 0) {
  //   this.dino.anims.stop();
  //   this.dino.setTexture('dino', 0);
  // } else {
  //   this.dino.play('dino-run', true);
  // }

  // cursors = this.input.keyboard.createCursorKeys();
  // var keys = this.input.keyboard.addKeys({ up: 'W', left: 'A', down: 'S', right: 'D' });

  // if (keys.left.isDown) {
  //   console.log('left');
  //   this.dino.x -= 10;
  // } else if (keys.right.isDown) {
  //   this.dino.x += 10;
  // }

  var pointer = this.input.activePointer;
  if (pointer.isDown && !gameOver) {
    var touchX = pointer.x;
    var touchY = pointer.y;
    this.dino.x = touchX - 45;
    // this.dino.anims.play('walk', true);
  }

  if (gameOver) {
    // this.physics.pause();
    // this.dino.body.moves = 'false';
    // this.add.text(innerWidth / 2, innerHeight / 2, 'Game Over', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5, 0.5);
    // this.scene.restart();
    let self = this;
    restartGame(this);
  }

  // if (!gameOver) {
  //   this.physics.resume();
  //   this.dino.body.moves = 'true';
  //   // this.add.text(innerWidth / 2, innerHeight / 2, 'Game Over', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5, 0.5);
  // }

  // if (objectsCount < 5) {
  //   let randX = Math.random() * (0 - innerWidth) + innerWidth;
  //   let randY = Math.random() * (1600 - 900) + 1600;
  //   // sprite = this.add.sprite(randX, 0, 'chicken');
  //   // this.physics.arcade.enable([sprite]);
  //   sprite = this.physics.add.sprite(randX, 0, 'chicken').setCollideWorldBounds(true).setGravityY(20).setOrigin(0, 1);
  //   // this.physics.add.overlap(this.out, sprite, destroyOut, null, this);

  //   objectsCount++;
  //   // this.physics.arcade.enable(sprite);
  // }

  // if (sprite.y > 300) {
  //   // console.log('pause');
  //   sprite.disableBody(true, true);
  // }
}

function restartGame(self) {
  self.scene.restart();
  gameOver = false;
}

function spawnCaitlynHates() {
  // Sorry I'm shy and I don't like those :(
  // stars = this.physics.add.group({
  //   key: 'bomb',
  //   repeat: 5,
  //   setXY: { x: 30, y: 0, stepX: 32 * 2 },
  //   // setScale: { x: 2, y: 2 },
  // });
}

function deleteBombs() {
  stars.children.iterate(function (child) {
    child.disableBody(false, true);
  });
}

function showBombs() {
  stars.children.iterate(function (child) {
    child.enableBody(false, 300, 0, true, true);
  });
}

var health = 100;
function decreaseHealth() {
  health += 10;
  bar.clear();
  bar.fillRoundedRect(60, 30, health, 20, 10);
  // graphics
}
