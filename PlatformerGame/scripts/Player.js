var TesterGame = TesterGame || {};

TesterGame.Player = function (that, items){

   this.game = that.game;
   this.map = that.map;
   this.gid = this.map.objects.Player[0].gid;
   this.self = null;
   this.items = items;

   this.LevelData = that;

   this.init();

   this.group = this.getGroup();
   this.movement = this.movement;
   this.isClimbing = false;
   this.isAlive = true;
   this.canMove = true;

};

TesterGame.Player.prototype = {
   movement: {
      runSpeed: 200,
      climbSpeed: 50,
      jumpHeight: 185,
      fps: 10,
      animate: {
         left: [0,1,2,3],
         right: [5,6,7,8],
         climb: [10,11,12,13,14,15,16],
         climbSlide: [14],
         faceAway: [9],
         faceForward: [4],
      }
   },
   State: {
      alive: true
   },

   init: function() {

      this.createGroup();
      this.inputsInit();
      this.animationsInit();
      this.stockBullets();

      this.game.camera.follow(this.self);
      console.log("camera: ", this.game.camera)
      this.game.physics.enable(this.self);

   },
   createGroup: function() {
      var group = this.game.add.group();
         group.enableBody = true;
         this.map.createFromObjects('Player',this.gid,'player',4,true,false, group);
         for (var p in group.children) {
            // group.children[p].body
            this.self = group.children[p];
         }
      this.group = group;
   },
   getGroup: function() {
      return this.group;
   },
   inputsInit: function() {
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      //  Stop the following space key from propagating up to the browser
      this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
   },
   animationsInit: function() {
      this.self.direction = 'right';
      this.self.animations.add('walkLeft', this.movement.animate.left, true);
      this.self.animations.add('walkRight', this.movement.animate.right, true);
      this.self.animations.add('climb', this.movement.animate.climb, true);
      this.self.animations.add('climbSlide', this.movement.animate.climbSlide, true);
      this.self.animations.add('faceAway', this.movement.animate.faceAway, true);
      this.self.animations.add('faceForward', this.movement.animate.faceForward);
   },
   handlePlayerMovement: function() {
      if ((!this.isClimbing && this.isAlive && this.canMove)) {
         this.self.body.allowGravity = true;
         this.self.body.velocity.x = 0;
         this.self.body.collideWorldBounds = true;
         //
         if (this.spaceKey.isDown) {
            this.fireBullet();
         }

         if (this.cursors.up.isDown)
         {
            if (this.self.body.onFloor() || this.self.body.touching.down)
            {
               this.self.body.velocity.y = -this.movement.jumpHeight;
               this.self.direction = 'up';
            }
         }
         else if (this.cursors.down.isDown)
         {
            this.self.direction = 'down';
         }
         if (this.cursors.left.isDown)
         {
            this.self.body.velocity.x = -this.movement.runSpeed;
            this.self.direction = 'left';
            this.self.animations.play('walkLeft', this.movement.fps, true);
         }
         else if (this.cursors.right.isDown)
         {
            this.self.body.velocity.x = this.movement.runSpeed;
            this.self.direction = 'right';
            this.self.animations.play('walkRight', this.movement.fps, true);
         }

         if (this.self.body.velocity.x === 0) {
            this.self.animations.stop(null, true);
            this.self.animations.refreshFrame = true;
            // this.self.animations.play('faceForward', this.movement.fps, true);
         }
      }
   },
   handleClimb: function(player, ladder) {
      if (this.isClimbing) { //this = this Player object
         this.self.body.allowGravity = true;
         if (player.body.center.x >= (ladder.body.center.x - 10) && player.body.center.x <= (ladder.body.center.x + 10)) {
            this.self.body.allowGravity = false;
            this.self.body.velocity.y = 0;
            this.self.body.velocity.x = 0;

            if (this.cursors.up.isDown) {
               this.self.animations.play('climb', this.movement.fps, true);
               this.self.body.velocity.y -= this.movement.climbSpeed;
            } else if (this.cursors.down.isDown) {
               this.self.animations.play('climbSlide', this.movement.fps, true);
               this.self.body.velocity.y += this.movement.climbSpeed*2;
            }


            if (this.cursors.right.isDown) {
               this.self.animations.play('climbSlide', this.movement.fps, true);
               this.self.body.velocity.x += this.movement.climbSpeed*2;
            } else if (this.cursors.left.isDown) {
               this.self.animations.play('climbSlide', this.movement.fps, true);
               this.self.body.velocity.x -= this.movement.climbSpeed*2;
            }

            if (this.self.body.velocity.x === 0 && this.self.body.velocity.y === 0) {
               this.self.animations.stop(null, true);
               this.self.animations.refreshFrame = true;
               this.self.animations.play('faceAway', this.movement.fps, true);
            }
         } else {
            this.isClimbing = false;
            this.handlePlayerMovement();
         }
      }
   },
   handleDanger: function(player, danger) {
      var speed = 100;
      var alpha;
      if (danger.DANGER_TYPE == 'enemy') {
         if (danger.STATE.alive) { //this == player
            if (danger.body.overlapY > 0) {
               //player.body.velocity.y -= 20;
               player.body.velocity.y = -100;
               danger.animations.stop(false, false);
               danger.STATE.alive = false;
               danger.body.enableBody = false;
               danger.body.enable = false;
               danger.speed = 0;
               danger.body.velocity.y = 100;
               danger.body.allowGravity = true;
               alpha = this.game.add.tween(danger).to( { alpha: 0 }, speed, Phaser.Easing.Elastic.EaseOut, true, 0, 5);
               alpha.onRepeat.add(slowDownTweenFlash, this);
               alpha.onComplete.add(removeTarget, this);

               //danger.kill();
            } else {
               this.player.self.animations.stop(null, true);
               this.player.speed = 0;
               this.player.self.body.enableBody = false;
               this.player.self.body.enable = false;
               this.player.isAlive = false;
               alpha = this.game.add.tween(player).to( { alpha: 0 }, speed, Phaser.Easing.Elastic.EaseOut, true, 0, 5);
               alpha.onRepeat.add(slowDownTweenFlash, this);
               alpha.onComplete.add(removeTarget, this);
            }
         }
      } else if (danger.layer.properties.danger && danger.layer.properties != 'undefined') {
         this.player.self.animations.stop(null, true);
         this.player.speed = 0;
         this.player.allowGravity = true;
         this.game.physics.arcade.gravity.y = 500;
         this.player.isAlive = false;
         alpha = this.game.add.tween(player).to( { alpha: 0 }, speed, Phaser.Easing.Elastic.EaseOut, true, 0, 5);
         alpha.onRepeat.add(slowDownTweenFlash, this);
         alpha.onComplete.add(removeTarget, this);
         this.player.self.body.enableBody = false;
         this.player.self.body.enable = false;
      }
      function slowDownTweenFlash(target, tween) {
         tween.timeline[0].duration *= 1.3;
      }
      function removeTarget(target, tween) {
         target.destroy();
         if (target.key == 'player') {
            this.game.state.start('MainMenu', true, false, this.items);
         }
      }
   },
   stockBullets: function(amt) {
      // console.log("THIS: ", this);
      var fill;
      if (typeof amt == 'undefined' && (this.bullets != 'undefined')) {
         this.bullets = this.game.add.group();
         this.bullets.enableBody = true;
         this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
         this.bullets.createMultiple(this.items.ammo.bullets, 'bullet');
      }
      if ((amt > 0) && (typeof amt != 'undefined')) {
         this.bullets.createMultiple(amt, 'bullet');
      }
      this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this);
      this.bullets.setAll(this.map.key, true);
      this.bulletTime = 0;
      for (var b in this.bullets.children) {
         var _bullet = this.bullets.children[b];
         _bullet.body.allowGravity = false;
         _bullet.body.drag.x = 50;
         _bullet.body.enableBody = true;
         _bullet.body.enable = true;
      }
      // console.log("bullets: ", this.bullets)

   },
   fireBullet: function() {
      if (this.game.time.now > this.bulletTime)
      {
         var bullet = this.bullets.getFirstExists(false);
         // console.log("bullet: ", bullet);

         if (bullet)
         {
            bullet.body.enableBody = true;
            bullet.body.enable = true;
            //console.log("BULLET: ", bullet);
            bullet.reset(this.self.x+10, this.self.y+35);
            var bv = bullet.body.velocity;
            bv.x = 500;
            if (this.self.direction=='right') {
               bv.x = 500;
               bullet.angle = 0;
            } else if (this.self.direction=='left') {
               bv.x = -500;
               bullet.angle = 180;
            }
            this.bulletTime = this.game.time.now + 250;
            this.items.ammo.bullets--;
            this.LevelData.numBullets.text = this.items.ammo.bullets;
         }
         // console.log("bullets: ", this.bullets)
      }
   },
   resetBullet: function(bullet) {
      bullet.destroy();
   },
   handleBulletTileCollision: function(bullet, tile) {
      // bullet.body.allowGravity = true;
      // emitter = this.game.add.emitter(bullet.body.center.x, bullet.body.center.y, 10);
      // emitter.makeParticles('coin_particle');
      // emitter.gravity = -225;
      // emitter.particleDrag.x = 100;
      // emitter.particleDrag.y = 100;
      // this.game.add.tween(emitter).to( { alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
      // emitter.explode(500, 10);
      //bullet.body.allowGravity = false;
      console.log("this: ", this);
      console.log("bullet: ", bullet)
      console.log("tile: ", tile);
      bullet.destroy();
      // console.log("bullets: ", this.bullets)
      // this.bullets.removeChild(this.bullets[0]);
   },
};
