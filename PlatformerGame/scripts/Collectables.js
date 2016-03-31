

Collectable = function(obj) {
   if (typeof obj == 'undefined') {
      return;
   }

   var data = {
      type: obj[0],
      x: obj[1],
      y: obj[2],
      level: obj[3],
      props: obj[4]
   };
   this.data = data;

   this.isCollected = false;

   // if (data.type == 'key') {
   //    Phaser.Sprite.call(this, data.level.game, data.x, data.y, 'key', 0);

   Phaser.Sprite.call(this, data.level.game, data.x, data.y, data.type, 0);
   this.game.physics.enable(this);
};

Collectable.prototype = Object.create(Phaser.Sprite.prototype);
Collectable.prototype.constructor = Collectable;

Collectable.prototype.handleCollect = function(player, collectable) {
   if (!collectable.isCollected) {
      collectable.isCollected = true;
      this.game.add.tween(collectable).to( { alpha: 0, y:collectable.position.y - 50 }, 500, Phaser.Easing.Linear.None, true);
      collectable.collect(collectable);
   }
      //console.log("collectable collected: ", player, obj);
};


Coin = function(type, x, y, level) {
   y -= 21; //account for positioning error in map. Coin height = 21px

   Collectable.call(this, arguments);

   this.level = this.data.level;

   this.body.bounce.y = 0.2;
   this.body.linearDamping = 1;
   this.body.allowGravity = false;
   this.animations.add('spin');
   this.animations.play('spin', 10, true);
};

Coin.prototype = new Collectable();
Coin.prototype.constructor = Coin;


Coin.prototype.collect = function (coin) {
   emitter = this.game.add.emitter(coin.body.center.x, coin.body.center.y, 100);
   emitter.makeParticles('coin_particle');
   emitter.gravity = -300;
   emitter.start(true, 600, null, 6);
   this.game.time.events.add(600, coin.kill, coin);
   this.data.level.player.items.points.coins++;
   this.data.level.scoreLabel.text = this.data.level.player.items.points.coins;
};


Ammo = function(type, x, y, level) {
   y -= 17; //account for positioning error in map. Ammo height = 17px

   Collectable.call(this, arguments);

   // console.log("this: ", this);

   this.scale.x = 1.5;
   this.scale.y = 1.5;
   this.body.bounce.y = 0.2;
   this.body.linearDamping = 1;
   this.body.allowGravity = false;
   this.isCollected = false;
   var t = this.game.add.tween(this).to( {alpha: 0.7}, 100, Phaser.Easing.Circular.In, true, false, -1, true);
   var tw = this.game.add.tween(this).to( {y: this.y + 3}, 500, Phaser.Easing.Quadratic.InOut, true, false, -1, true);
   t.chain(tw);
};

Ammo.prototype = new Collectable();
Ammo.prototype.constructor = Ammo;

Ammo.prototype.collect = function (ammo) {
   this.game.time.events.add(600, ammo.kill, ammo);
   this.data.level.player.items.ammo.bullets += 10;
   this.data.level.numBullets.text = this.data.level.player.items.ammo.bullets;
   this.data.level.player.stockBullets(10);
};

Key = function(type, x, y, level) {
   y -= 21; //account for positioning error in map. Key height = 17px

   Collectable.call(this, arguments);

   // console.log("this: ", this);

   this.body.bounce.y = 0.2;
   this.body.linearDamping = 1;
   this.body.allowGravity = false;
   this.isCollected = false;
   var t = this.game.add.tween(this).to( {alpha: 0.7}, 100, Phaser.Easing.Circular.In, true, false, -1, true);
   var tw = this.game.add.tween(this).to( {y: this.y + 3}, 500, Phaser.Easing.Quadratic.InOut, true, false, -1, true);
   t.chain(tw);
};

Key.prototype = new Collectable();
Key.prototype.constructor = Key;

Key.prototype.collect = function (key) {
   //console.log("collected: ", collected);
   if (typeof this.data.level.player.items.keys == 'undefined') {
      this.data.level.player.items.keys = 0;
   }
   if (typeof this.data.level.player.keys == 'undefined') {
      this.data.level.player.keys = [];
   }
   this.data.level.player.keys.push(key);
   this.game.time.events.add(500, key.kill, key);
   this.data.level.player.items.keys++;
};


Keybox = function(type, x, y, level) {
   y -= 21; //account for positioning error in map. Keybox height = 17px

   Collectable.call(this, arguments);

   console.log("THIS BOX: ", this);

   // this.scale.x = 1.5;
   // this.scale.y = 1.5;
   this.body.bounce.y = 0.2;
   this.body.linearDamping = 1;
   this.body.allowGravity = false;
   this.isCollected = false;
   this.isRedeemed = false;
   // var t = this.game.add.tween(this).to( {alpha: 0.7}, 100, Phaser.Easing.Circular.In, true, false, -1, true);
   // var tw = this.game.add.tween(this).to( {y: this.y + 3}, 500, Phaser.Easing.Quadratic.InOut, true, false, -1, true);
   // t.chain(tw);
};

Keybox.prototype = new Collectable();
Keybox.prototype.constructor = Keybox;

Keybox.prototype.collect = function (ammo) {
   // this.game.time.events.add(600, ammo.kill, ammo);
   // this.data.level.player.items.ammo.bullets += 10;
   // this.data.level.numBullets.text = this.data.level.player.items.ammo.bullets;
   // this.data.level.player.stockBullets(10);
};

Keybox.prototype.handleKey = function (player, box) {
   var boxID = box.data.props.id;
   var keys = this.player.keys;
   for (var k in keys) {
      if (keys[k].data.props.id == boxID && !keys[k].isRedeemed) {
         keys[k].isRedeemed = true;
         box.handleKeyFound(boxID, box, this);
      }
   }
};

Keybox.prototype.handleKeyFound = function (id, box, level) {
   console.log("level: ", level);
   if (box.data.props.type == 'bridge') {
      new BridgeBuilder(level, id).build();
      //var time = box.game.time.add(1000, this.kill, this);
   }

};
