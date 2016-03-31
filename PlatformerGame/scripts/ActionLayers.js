var Boulder = function(game, x, y, type, map) {
   this.game = game;
   this.map = map;

   y -= 21;

   Phaser.Sprite.call(this, game, x, y, 'boulder', 0);

   this.game.physics.enable(this);
   this.body.allowGravity = false;
   this.collideWorldBounds = true;
   this.body.immovable = true;
   this.body.bounce.set(0,0);
   this.MOVEMENT = {
      fps: 6,
      fall: [3,2,1,0]
   };
   this.mState = {
      startY: this.body.position.y, //?+8 needed to reposition properly after revive & bounce
   };
   //one in ten chance the boulder has a hidden Collectable
   //revealed only on smash
   var rnd = Math.random();
   if (rnd > 0.6) {
      this.hasCollectable = true;
   } else this.hasCollectable = false;

   this.animations.add('fall', this.MOVEMENT.fall, true);
};

Boulder.prototype = Object.create(Phaser.Sprite.prototype);
Boulder.prototype.constructor = Boulder;

Boulder.prototype.update = function () {

};
Boulder.prototype.handleFall = function (player, boulder) {
   if (boulder.body.overlapY > 0) {
      boulder.body.allowGravity = true;
      boulder.animations.play('fall', boulder.MOVEMENT.fps, true);
   }
};
Boulder.prototype.handleSmash = function (boulder, layer) {
   //console.log("this: ", boulder);
   emitter = this.game.add.emitter(boulder.body.center.x, boulder.body.bottom, 100);
   emitter.makeParticles('coin_particle');
   emitter.gravity = 0;
   emitter.start(true, 2000, null, 10);
   boulder.kill();
   boulder.animations.stop(null, true);
   boulder.animations.refreshFrame = true;
   if (boulder.hasCollectable) {
      //console.log("has Collectable: ", boulder);
      boulder.createCollectable(layer, this);
      boulder.hasCollectable = false;
   }

   this.time.events.add(1000, boulder.resetBoulder, boulder, layer);
};
Boulder.prototype.resetBoulder = function (layer) {
   this.body.enable = false;
   this.alpha = 0;
   this.body.allowGravity = false;
   this.revive();
   flash = this.game.add.tween(this).to( { alpha: 1 }, 30, Phaser.Easing.Elastic.EaseOut, true, 0, 20);
   rise = this.game.add.tween(this).to({y: this.mState.startY}, 1500, Phaser.Easing.Elastic.EaseOut, true);
   //alpha.onRepeat.add(speedUpTweenFlash, this);
   flash.onRepeat.add(slowDownTweenFlash, this);
   flash.chain(rise);
   flash.onComplete.add(this.reviveBoulder, this);

   //this.revive();
   function slowDownTweenFlash(target, tween) {
      tween.timeline[0].duration *= 1.1;
   }
};
Boulder.prototype.reviveBoulder = function () {
   this.body.enable = true;
};
Boulder.prototype.createCollectable = function(layer, level) {
   var coin = new Coin('point_coin', layer.worldX, layer.worldY, level);
   level.game.add.existing(coin);
   level.collectables.coins.push(coin);
};


//bridge_rock -> [0,1,2] randomized
//bridge_rope -> [3]
//bridge_rope_left -> [4]
//bridge_rope_right -> [5]
Bridge = function(type, x, y, level, props) {
   y -= 21; //account for positioning error in map. Bridge height = 21px

   this.type = type;
   this.level = level;
   this.props = props;
   this.typeId = 0;

   switch (this.type) {
      case 'bridge_rock':
         var rnd = Math.random();
            if (rnd < 0.33)
               this.typeId = 0;
            else if (rnd > 0.33 && rnd < 0.66) {
               this.typeId = 1;
            } else {
               this.typeId = 2;
            }
         break;
      case 'bridge_rope':
         this.typeId = 3;
         break;
      case 'bridge_rope_left':
         this.typeId = 4;
         break;
      case 'bridge_rope_right':
         this.typeId = 5;
         break;
      default: throw new Error("Invalid type: "+this.type);

   }

   Phaser.Sprite.call(this, level.game, x, y, 'bridge', this.typeId);
   this.game.physics.enable(this);
   this.body.allowGravity = false;
   this.alpha = 0;
   this.isBuilding = true;
   this.body.immovable = true;

   if (props.collision == 'true') {
      this.body.enableBody = true;
      this.body.enable = true;
   } else {
      this.body.enableBody = false;
      this.body.enable = false;
   }

   this.game.add.tween(this).to( {alpha: 1}, 600, Phaser.Easing.Circular.In, true);

   if (this.props.anchor == 'true' && this.isBuilding) {
      console.log("building: ", this)
      this.game.camera.unfollow(this.level.player.self);
      this.game.camera.follow(this);
      this.game.renderer.renderSession.roundPixels = true;
   }


   this.game.time.events.add(1000, this.build, this);

};

Bridge.prototype = Object.create(Phaser.Sprite.prototype);
Bridge.prototype.constructor = Bridge;

Bridge.prototype.update = function() {
   if (!this.isBuilding) {
      this.game.camera.unfollow(this);
      this.game.camera.follow(this.level.player.self);
   }
};

Bridge.prototype.build = function () {
   this.game.add.existing(this);
   this.game.time.events.add(1000, halt, this);
   function halt() {
      this.isBuilding = false;
   }
};

BridgeBuilder = function(level, id) {
   this.level = level;
   this.id = id;
   this.bridgegroup = [];
   // console.log("level: ", level);
   // console.log("id: ", id);
   // console.log("builder: ", this);
};

BridgeBuilder.prototype.build = function () {
   console.log("creating...");
   var b;
   for (var l in this.level.map.objects.ActionLayer) {
      var la = this.level.map.objects.ActionLayer[l];
      if (la.properties.id == this.id) {
         this.level.game.time.events.add(100, render, this, la);
         //var b = new Bridge(la.type, la.x, la.y, this.level, la.properties);
      }
   }
   function render(la) {
      b = new Bridge(la.type, la.x, la.y, this.level, la.properties);
      this.bridgegroup.push(b);
      //console.log("la: ", la)
      if (la.properties.collision == 'true') {
         this.level.ActionLayers.bridges.push(b);

      }


   }
};
