var TesterGame = TesterGame || {};

//    new TesterGame.Collectables('type', level, layer);
/* Collectable Types
*     point: {
         coin,
         coin10X
      }
*     goal: {
         counter,
         ender
      }
*/


TesterGame.Collectables = function(type, that, layer) {
   this.game = that.game;
   this.map = that.map;
   this.Level = that;
   if (typeof layer == 'undefined') {
      this.layer = null;
   } else this.layer = layer;
   //console.log("map objects: ", this.map.objects, type);

   this.type = type;

   switch (type) {
      case 'Coin':
         if (this.map.objects.Coin.length > 0) {
            this.gid = this.map.objects.Coin[0].gid;
         } else this.gid = null;
         break;
      case 'AmmoRefiller':
         if (this.map.objects.AmmoRefiller.length > 0) {
            this.gid = this.map.objects.AmmoRefiller[0].gid;
         } else this.gid = null;
         break;
      case 'Coin_Hidden':
         this.gid = null; //Will generate coin as sprite, not from map
         // this.
         break;
      default: throw new Error('Missing GID. Unknown Collectables type.');
   }
   //console.log("this.game: ", this.game)
   this.itemGravity = this.game.physics.arcade.gravity.y;

   this.init();
   this.group = this.getGroup();

   this.collect = function(player, item) {
      if (!item.isCollected) {
         // this.collectSound.play();
         item.isCollected = true;
         console.log("item: ", item);
         var item_type_data = setData_Type(item.key);
         handleCollect(item, item_type_data);
      }
   };
   function handleCollect(item, data) {
      //console.log("data: ", data)
      that.game.add.tween(item).to( { alpha: 0, y:item.position.y - 50 }, 500, Phaser.Easing.Linear.None, true);
      switch (data.type) {
         case 'point':
            if (data.subtype == 'coin') {
               emitter = that.game.add.emitter(item.body.center.x, item.body.center.y, 100);
               emitter.makeParticles('coin_particle');
               emitter.gravity = 0;
               emitter.start(true, 2000, null, 10);
               that.game.time.events.add(500, killItem, item);
               that.player.items.points.coins++;
               that.scoreLabel.text = that.player.items.points.coins;
            }
            break;
         case 'goal':

            break;
         case 'refiller':
            if (data.subtype == 'ammo') {
               //console.log("this: ", that);
               var _refillAmt = 10;
               that.game.time.events.add(500, killItem, item);
               that.player.items.ammo.bullets+=_refillAmt;
               that.numBullets.text = that.player.items.ammo.bullets;
               refillAmmo(_refillAmt);
            }
            break;
         default:
            console.error("Item: ", item);
            console.error("Data: ", data);
            throw new Error('Invalid item type or subtype. Item: ', item);
      }
   }
   function killItem() {
      this.kill();
   }
   function setData_Type(type) {
      var type_data;
      var _type;
      var _subtype;

      if (type == '__missing')
         throw new Error('Missing or invalid sprite key.');
      var _count = 0;
      for (var i=0; i<type.length; i++) {
         _chr = type[i];
         if (_chr == "_") {
            _count++;
         }
      }
      if (_count > 0) {
         if (_count === 2) {
            _type = type.substring(0, type.indexOf('_'));
            _subtype = type.substring(type.indexOf('_') + 1, type.lastIndexOf('_'));
         } else {
            _type = type.substring(0, type.indexOf('_'));
            _subtype = type.substring(type.indexOf('_') + 1, type.length);
         }
         type_data = {
            type: _type,
            subtype: _subtype
         };
         return type_data;
      }
      throw new Error('Invalid sprite key.');
   }
   function refillAmmo(amt) {
      //console.log("player: ", that.player);
      that.player.stockBullets(amt);
   }
};

TesterGame.Collectables.prototype = {
   init: function() {
      var group = this.game.add.group();
      group.enableBody = true;
      group.physicsBodyType = Phaser.Physics.ARCADE;

      if (this.type == 'Coin') {
         this.map.createFromObjects('Coin', this.gid, 'point_coin', 7, true, false, group);
         this.createCoins(group);
      } else if (this.type == 'Orb') {
         //TODO: orb things
      } else if (this.type == 'AmmoRefiller') {
         this.map.createFromObjects('AmmoRefiller', this.gid, 'refiller_ammo', 0, true, false, group);
         this.createAmmoRefiller(group);
      } else if (this.type == 'Coin_Hidden') {
         var c = this.Level.game.add.sprite(this.layer.worldX, this.layer.worldY-21, 'point_coin');
         this.createCoins(group);
         this.Level.coins.group.add(c, false);
      }

      this.group = group;

   },
   createCoins: function(group) {
      var coins = group.children;
      for (var coin in coins) {
         this.game.physics.enable(coins[coin]);
         coins[coin].animations.add('spin');
         coins[coin].animations.play('spin', 10, true);
         coins[coin].body.bounce.y = 0.2;
         coins[coin].body.linearDamping = 1;
         coins[coin].body.allowGravity = false;
         coins[coin].isCollected = false;
      }
   },
   createAmmoRefiller: function(group) {
      var ammo = group.children;
      //console.log("group children: ", group.children)
      for (var a in ammo) {
         this.game.physics.enable(ammo[a]);
         ammo[a].scale.x = 1.5;
         ammo[a].scale.y = 1.5;
         ammo[a].body.bounce.y = 0.2;
         ammo[a].body.linearDamping = 1;
         ammo[a].body.allowGravity = false; //holds in place
         ammo[a].isCollected = false;
         var t = this.game.add.tween(ammo[a]).to( {alpha: 0.7}, 100, Phaser.Easing.Circular.In, true, false, -1, true);
         var tw = this.game.add.tween(ammo[a]).to( {y: ammo[a].y + 3}, 500, Phaser.Easing.Quadratic.InOut, true, false, -1, true);
         t.chain(tw);
      }
   },
   getGroup: function() {
      return this.group;
   },

};
