var TesterGame = TesterGame || {};

TesterGame.LevelTwo = function() {};

TesterGame.LevelTwo.prototype = {

   pMove: {
      fps: 10,
      left: [0,1,2,3],
      right: [5,6,7,8]
   },

   create: function() {
      this.map = this.game.add.tilemap('map3');
      this.game.world.setBounds(0, 0, 900, 900);

      this.map.addTilesetImage('generic_1_21x21_0m_2s', 'all_map_pieces');
      this.layer = this.map.createLayer('background');
      this.collisionLayer = this.map.createLayer('collisionLayer');
      this.map.setCollision([
         121,122,123,124,125,
         151,152,153,154,155,
         301,302,303,304,305,306,307,308,309,
         331,332,333,334,335,336,337,338,339,
         693,695,723,724,725,753,754,755
      ], true, this.collisionLayer);


      this.springs = this.game.add.group();
      this.springs.enableBody = true;
      this.springs.physicsBodyType = Phaser.Physics.ARCADE;

      this.map.createFromObjects('ActionObject',901,'mushroom',0,true,false,this.springs);
      for (var item in this.springs.children) {
         this.springs.children[item].body.immovable = true;
      }


      this.user = this.game.add.group();
      //this.player = this.user.create(32, 430, 'player', 4);
      this.map.createFromObjects('Player',906,'player',5,true,false,this.user);
      for (var p in this.user.children) {
         this.player = this.user.children[p];
      }

      this.setUpPlayer();
      this.generateCoins();
      this.goalOrbs = this.game.add.group();
      this.goalOrbs.enableBody = true;
      this.goalOrbs.physicsBodyType = Phaser.Physics.ARCADE;
      this.map.createFromObjects('Collectables', 918, 'yellow-orb', 0, true, false, this.goalOrbs);
      for (var o in this.goalOrbs.children) {
         this.goalOrbs.children[o].body.immovable = true;
         this.goalOrbs.children[o].body.gravity.y = -200;
         this.goalOrbs.children[o].isCollected = false;
      }

      this.game.physics.arcade.gravity.y = 200;

      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      //  Stop the following space key from propagating up to the browser
      this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

      //menu bar
      this.playerCoins = 0;
      this.buildGameInfo();

      //create sounds
      this.collectSound = this.game.add.audio('collect');
   },
   update: function() {
      this.game.physics.arcade.collide(this.player, this.collisionLayer);
      this.game.physics.arcade.collide(this.coins, this.collisionLayer);
      this.game.physics.arcade.collide(this.springs, this.collisionLayer);
      this.game.physics.arcade.collide(this.player, this.springs, this.handleSpring, null, this);
      this.game.physics.arcade.overlap(this.player, this.coins, this.collect, null, this);
      this.game.physics.arcade.overlap(this.player, this.goalOrbs, this.handleGoal, null, this);

      this.handlePlayerMovement();
   },
   handleGoal: function(player, orb) {
      if (!orb.isCollected) {
         console.log("orb: ", orb);
         // this.game.paused = true;
         orb.isCollected = true;
         //collectable.body.velocity.y = -50;
         this.game.add.tween(orb).to( { alpha: 0, y:orb.position.y - 500 }, 2000, Phaser.Easing.Linear.None, true);
         this.game.add.tween(player).to({alpha: 0, y:player.position.y}, 2000, Phaser.Easing.Linear.None, true);
         this.game.time.events.add(3000, this.endLevel, this);
      }
   },
   endLevel: function() {
      this.game.state.start('MainMenu');
   },
   generateCoins: function() {
      this.coins = this.game.add.group();
      this.coins.enableBody = true;
      this.coins.physicsBodyType = Phaser.Physics.ARCADE;

      this.map.createFromObjects('Collectables', 911, 'coin', 7, true, false, this.coins);

      //animate coins to spin
      var coins = this.coins.children;
      for (var coin in coins) {
         this.game.physics.enable(coins[coin]);
         coins[coin].animations.add('spin');
         coins[coin].animations.play('spin', 10, true);
         coins[coin].body.bounce.y = .2;
         coins[coin].body.linearDamping = 1;
         coins[coin].body.gravity.y = -200;
         coins[coin].isCollected = false;
      }
   },
   collect: function(player, collectable) {
      if (!collectable.isCollected) {
         this.collectSound.play();
         collectable.isCollected = true;
         this.playerCoins++;
         this.scoreLabel.text = this.playerCoins;
         //collectable.body.velocity.y = -50;
         this.game.add.tween(collectable).to( { alpha: 0, y:collectable.position.y - 50 }, 500, Phaser.Easing.Linear.None, true);
         this.game.time.events.add(500, this.killCollectable, collectable);
      }
   },
   killCollectable: function() {
      this.kill();
   },
   setUpPlayer: function() {
      //player animations
      this.player.direction = 'right';
      this.player.animations.add('walkLeft', this.pMove.left, true);
      this.player.animations.add('walkRight', this.pMove.right, true);

      this.game.camera.follow(this.player);
      this.game.physics.enable(this.player);
      this.player.body.collideWorldBounds = true;
   },
   handleSpring: function(player, spring) {
      //only spring player if hits top of spring
      if (spring.body.overlapY > 0) {
         player.body.velocity.y = -300;
         //COOL: Makes the spring fall below the collsion layer after 2 bounces
         //spring.body.position.y = spring.body.position.y + (spring.body.overlapY*5);
      }
   },
   handlePlayerMovement: function() {
      this.player.body.velocity.x = 0;
      this.player.body.collideWorldBounds = true;

      if (this.spaceKey.isDown) {
         console.log("down");
         this.fireBullet();
      }

      if (this.cursors.up.isDown)
      {
         if (this.player.body.onFloor())
         {
            this.player.body.velocity.y = -200;
            this.player.direction = 'up';
         }
      }
      else if (this.cursors.down.isDown)
      {
         if (!this.player.body.onFloor())
         {
            this.player.body.velocity.y = 200;
            this.player.direction = 'down';
         }
      }
      if (this.cursors.left.isDown)
      {
         this.player.body.velocity.x = -150;
         this.player.direction = 'left';
         this.player.animations.play('walkLeft', this.pMove.fps, true);
      }
      else if (this.cursors.right.isDown)
      {
         this.player.body.velocity.x = 150;
         this.player.direction = 'right';
         this.player.animations.play('walkRight', this.pMove.fps, true);
      }

      //console.log("velocityX: ", this.player.body.velocity.x)
      if (this.player.body.velocity.x == 0) {
         this.player.animations.stop(null, true);
         this.player.animations.refreshFrame = true;
      }
   },
   buildGameInfo: function() {
      //score text
      var style = { font: "20px Arial", fill: "#111", align: "center" };
      this.SLcoinImage = this.game.add.sprite(this.game.width - 180, 20, 'coin', 0);
      this.scoreLabel = this.game.add.text(this.game.width - 150, 20, this.playerCoins, style);

      var blt = this.game.add.sprite(50, 30, 'bullet', 0);
      this.numBullets = this.game.add.text(80, 20, this.remBullets, style);

      //ensures items stay fixed to the camera view, not the map
      this.scoreLabel.fixedToCamera = true;
      this.numBullets.fixedToCamera = true;
      this.SLcoinImage.fixedToCamera = true;
      blt.fixedToCamera = true

   }

}
