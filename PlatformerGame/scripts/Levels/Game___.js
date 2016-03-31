var TesterGame = TesterGame || {};

TesterGame.Game = function(){};

TesterGame.Game.prototype = {

   pMove: {
      fps: 10,
      left: [0,1,2,3],
      right: [5,6,7,8]
   },

   init: function(items) {
      this.playerItems = {
         points: {
            coins: items.points.coins,
            orbs: items.points.orbs
         },
         ammo: {
            bullets: items.ammo.bullets
         }
      }
   },

   create: function() {
      //  The 'level1' key here is the Loader key given in game.load.tilemap
      this.map = this.game.add.tilemap('map1');
      // var mp = this.game.add.tilemap('map1');
      this.game.world.setBounds(0, 0, 900, 900);
      //
      // console.log("map: ", this.map.objects.Player[0].gid);
      // var pl = new TesterGame.Player(this.map.objects.Player[0].gid, mp);
      // console.log("pl: ", pl);
      // this.usr = pl.user;
      // console.log("this: ", this);

      this.map.addTilesetImage('generic_1_21x21_0m_2s', 'all_map_pieces');
      this.layer = this.map.createLayer('background');
      this.collisionLayer = this.map.createLayer('collisionLayer');
      this.map.setCollision([
         121,122,123,124,125,152,153,154,155
      ], true, this.collisionLayer);
      this.dangerLayer = this.map.createLayer('dangerLayer');
      this.map.setCollision([
         547,548,549,550,577,578,579,580
      ], true, this.dangerLayer);

      this.goalOrbs = this.game.add.group();
      this.goalOrbs.enableBody = true;
      this.goalOrbs.physicsBodyType = Phaser.Physics.ARCADE;
      this.map.createFromObjects('Collectables', 918, 'yellow-orb', 0, true, false, this.goalOrbs);
      for (var o in this.goalOrbs.children) {
         this.goalOrbs.children[o].body.immovable = true;
         this.goalOrbs.children[o].body.gravity.y = -200;
         this.goalOrbs.children[o].isCollected = false;
      }

      this.springs = this.game.add.group();
      this.springs.enableBody = true;
      this.springs.physicsBodyType = Phaser.Physics.ARCADE;

      this.map.createFromObjects('ActionObject',917,'mushroom',0,true,false,this.springs);
      for (var item in this.springs.children) {
         this.springs.children[item].body.immovable = true;
      }

      this.user = this.game.add.group();
      //this.player = this.user.create(32, 430, 'player', 4);
      this.map.createFromObjects('Player',912,'player',5,true,false,this.user);
      for (var p in this.user.children) {
         this.player = this.user.children[p];
      }

      this.setUpPlayer();
      this.generateCoins();
      this.stockBullets();

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
      this.game.physics.arcade.collide(this.player, this.dangerLayer, this.createDanger, null, this);

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
      this.game.state.start('GM', true, false, this.playerItems);
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
   generateCoins: function() {
      this.coins = this.game.add.group();
      this.coins.enableBody = true;
      this.coins.physicsBodyType = Phaser.Physics.ARCADE;

      this.map.createFromObjects('Collectables', 901, 'coin', 7, true, false, this.coins);

      //animate coins to spin
      var coins = this.coins.children;
      for (var coin in coins) {
         this.game.physics.enable(coins[coin]);
         coins[coin].animations.add('spin');
         coins[coin].animations.play('spin', 10, true);
         coins[coin].body.bounce.y = .2;
         coins[coin].body.linearDamping = 1;
         coins[coin].body.gravity.y = -200; //holds in place
         coins[coin].isCollected = false;
      }
   },
   collect: function(player, collectable) {
      if (!collectable.isCollected) {
         this.collectSound.play();
         collectable.isCollected = true;
         this.playerItems.points.coins++;
         this.scoreLabel.text = this.playerItems.points.coins;
         this.game.add.tween(collectable).to( { alpha: 0, y:collectable.position.y - 50 }, 500, Phaser.Easing.Linear.None, true);
         this.game.time.events.add(500, this.killCollectable, collectable);
      }
   },
   killCollectable: function() {
      this.kill();
   },
   stockBullets: function() {
      this.bullets = this.game.add.group();
      this.bullets.enableBody = true;
      this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
      this.remBullets = 10;
      this.bullets.createMultiple(this.remBullets, 'bullet');
      this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this);
      this.bullets.setAll('map1', true);
      this.bulletTime = 0;

      this.user.add(this.bullets);
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

   },
   fireBullet: function() {
      if (this.game.time.now > this.bulletTime)
      {
         bullet = this.bullets.getFirstExists(false);
         if (bullet)
         {
            bullet.reset(this.player.x+10, this.player.y+35);
            var bv = bullet.body.velocity;
               (this.player.direction=='right') ? bv.x = 300 : bv.x = -300;
            bullet.body.allowGravity = false;
            this.bulletTime = this.game.time.now + 250;

            this.remBullets--;
            this.numBullets.text = this.remBullets;
         }
      }
   },
   //  Called if the bullet goes out of the screen
   resetBullet: function(bullet) {
      bullet.kill();
   },
   handleSpring: function(player, spring) {
      //only spring player if hits top of spring
      if (spring.body.overlapY > 0) {
         player.body.velocity.y = -250;
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
   createDanger: function(player, danger) {
      console.log("player: ", player)
      player.kill();
      this.game.time.events.add(800, this.gameOver, this);
   },
   gameOver: function() {
      this.game.state.start('MainMenu', true, false);
   }
}
