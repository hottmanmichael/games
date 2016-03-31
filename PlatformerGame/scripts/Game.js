var TesterGame = TesterGame || {};

TesterGame.Game = function(){};

TesterGame.Game.prototype = {
   init: function(data) {
      this.playerItems = {
         points: {
            coins: data.items.points.coins,
            orbs: data.items.points.orbs
         },
         ammo: {
            bullets: data.items.ammo.bullets
         }
      };
      this.map = data.map;
   },

   create: function() {

      this.game.world.setBounds(0, 0, 900, 900);
      this.world.alpha = 0;

      var fadeIn = this.game.add.tween(this.world).to(
         {alpha: 1}, 200, Phaser.Easing.Quadratic.In, true
      );
      fadeIn.onComplete.add(function(a, b) {
         //do anything?
      }, this);

      this.map.addTilesetImage('generic_1_21x21_0m_2s', 'all_map_pieces');
      this.layer = this.map.createLayer('background');
      this.layer.resizeWorld();
      this.scenery = this.map.createLayer('scenery');

      //set collision indexes as all tiles in generic tileset
         //map tileset
         var tileset = [];
         for (var i = 0; i < 1000; i++) {
            tileset.push(i);
         }

      this.collisionLayer = this.map.createLayer('collisionLayer');
      this.map.setCollision(tileset, true, this.collisionLayer, true);

      this.dangerLayer = this.map.createLayer('dangerLayer');
      this.map.setCollision(tileset, true, this.dangerLayer);

      this.ActionLayers = {};
         this.ActionLayers.boulders = [];
         this.ActionLayers.bridges = [];

      for (var al in this.map.objects.ActionLayer) {
         var layer = this.map.objects.ActionLayer[al];
         var _layerX = layer.x;
         var _layerY = layer.y;
         if (layer.type == 'boulder') {
            var b = new Boulder(this.game, _layerX, _layerY, 'boulder', this.map);
            this.game.add.existing(b);
            this.ActionLayers.boulders.push(b);
            //console.log("b: ", b)
         }
      }
      //console.log("Boulders: ", this.ActionLayers);

      this.ActionObjects = {};
         this.ActionObjects.springs = {};
         this.ActionObjects.springs.mushrooms = [];
         this.ActionObjects.ladders = [];
         this.ActionObjects.boxes = [];

      for (var o in this.map.objects.ActionObject) {
         var ob = this.map.objects.ActionObject[o];
         var _obX = ob.x;
         var _obY = ob.y;
         if (ob.type == 'spring') {
            var s = new Spring(this.game, _obX, _obY, 'spring_mush', this.map);
            this.game.add.existing(s);
            this.ActionObjects.springs.mushrooms.push(s);
         } else if (ob.type == 'ladder') {
            var l = new Ladder(this.game, _obX, _obY, 'ladder_chain', this.map);
            this.game.add.existing(l);
            this.ActionObjects.ladders.push(l);
         } else if (ob.type == 'keybox') {
            console.log("ob: ", ob);
            var kb = new Keybox('keybox', ob.x, ob.y, this, ob.properties);
            this.game.add.existing(kb);
            this.ActionObjects.boxes.push(kb);
         }
      }
      //console.log("objs: ", this.ActionObjects);


      this.player = new TesterGame.Player(this, this.playerItems);
      this.playerGroup = this.player.group;
      this.bullets = this.player.bullets.children;


      // //create coins from map
      // this.coins = new TesterGame.Collectables('Coin', this);
      // this.coinsChildren = this.coins.group.children;

      this.collectables = {};

         this.collectables.coins = [];
         this.collectables.ammo = [];
         this.collectables.orbs = [];
         this.collectables.keys = [];
         for (var c in this.map.objects.Collectable) {
            var co = this.map.objects.Collectable[c];
            if (co.type == 'coin') {
               var coin = new Coin('point_coin', co.x, co.y, this);
               this.game.add.existing(coin);
               this.collectables.coins.push(coin);
            } else if (co.type == 'ammo') {
               var ammo = new Ammo('bullet', co.x, co.y, this);
               this.game.add.existing(ammo);
               this.collectables.ammo.push(ammo);
            } else if (co.type == 'key') {
               var key = new Key('key', co.x, co.y, this, co.properties);
               this.game.add.existing(key);
               this.collectables.keys.push(key);
            }
         }

         console.log("collectables: ", this.collectables);

      // this.ammoRefiller = new TesterGame.Collectables('AmmoRefiller', this);
      // this.ammoRefillerChildren = this.ammoRefiller.group.children;


      this.enemies = {};
         this.enemies.crabs = [];
         this.enemies.birds = [];
         this.enemies.drones = [];
         for (var e in this.map.objects.Enemy) {
            var enemy = this.map.objects.Enemy[e];
            // console.log("enemy: ", enemy);
            // console.log("objs: ", this.map.objects)
            var _enemyX = enemy.x;
            var _enemyY = enemy.y;
            if (enemy.name == 'Crab') {
               var crab = new Crab(this.game, _enemyX, _enemyY, 'ground_crab', this.map);
               this.game.add.existing(crab);
               this.enemies.crabs.push(crab);
            } else if (enemy.name == 'Bird') {
               var bird = new Bird(this.game, _enemyX, _enemyY, 'air_bird', this.map);
               this.game.add.existing(bird);
               this.enemies.birds.push(bird);
            } else if (enemy.name == 'Drone') {
               var drone = new Drone(this.game, _enemyX, _enemyY, 'air_drone', this.map);
               this.game.add.existing(drone);
               this.enemies.drones.push(drone);
            }
         }


      this.coverLayer = this.map.createLayer('coverScenery');
      this.map.setCollision(tileset, true, this.coverLayer);
      this.coverLayer.alpha = 0.8;

      this.buildGameInfo();

   },
   update: function() {
   //player collisions
      //player with collision layer
      this.game.physics.arcade.collide(this.player.self, this.collisionLayer);
      //player with danger layer
      this.game.physics.arcade.collide(
         this.player.self, this.dangerLayer,
         this.player.handleDanger, null, this
      );
      //tween alpha to 0 if overlapping cover layer
      this.game.physics.arcade.overlap(
         this.player.self, this.coverLayer,
         this.coverLayerReveal, null, this
      );
   //Collectables collision
      //coins
         //this.game.physics.arcade.collide(this.coinsChildren, this.collisionLayer);
      if (this.collectables.coins.length > 0) {
         this.game.physics.arcade.overlap(
            this.player.self, this.collectables.coins,
            this.collectables.coins[0].handleCollect, null, this
         );
      }
      //ammo
         //this.game.physics.arcade.collide(this.ammoRefillerChildren, this.collisionLayer);
      if (this.collectables.ammo.length > 0) {
         this.game.physics.arcade.overlap(
            this.player.self, this.collectables.ammo,
            this.collectables.ammo[0].handleCollect, null, this
         );
      }
      if (this.collectables.keys.length > 0) {
         this.game.physics.arcade.overlap(
            this.player.self, this.collectables.keys,
            this.collectables.keys[0].handleCollect, null, this
         );
      }

   //Enemies
      //crab enemies collision
      if (this.enemies.crabs.length > 0) {
         //player
         this.game.physics.arcade.collide(this.enemies.crabs, this.collisionLayer);
         this.game.physics.arcade.overlap(
            this.player.self, this.enemies.crabs,
            this.player.handleDanger, null, this
         );
         //weapons - bullets
         this.game.physics.arcade.overlap(
            this.bullets, this.enemies.crabs,
            this.enemies.crabs[0].handleWeaponCollide, null, this
         );
      }

      if (this.enemies.birds.length > 0) {
         //bird enemies collision
         this.game.physics.arcade.collide(this.enemies.birds, this.collisionLayer);
         this.game.physics.arcade.overlap(
            this.player.self, this.enemies.birds,
            this.player.handleDanger, null, this
         );
         //bullet collides with bird
         this.game.physics.arcade.overlap(
            this.bullets, this.enemies.drones,
            this.enemies.drones[0].handleWeaponCollide, null, this
         );

      }

      if (this.enemies.drones.length > 0) {
         //drone enemies collision
         this.game.physics.arcade.collide(this.enemies.drones, this.collisionLayer);
         this.game.physics.arcade.overlap(
            this.player.self, this.enemies.drones,
            this.player.handleDanger, null, this
         );
         //bullet collides with drone
         this.game.physics.arcade.overlap(
            this.bullets, this.enemies.drones,
            this.enemies.drones[0].handleWeaponCollide, null, this
         );
      }

      //Action Objects collision
         //spring collisions
         if (this.ActionObjects.springs.mushrooms.length > 0) {
               this.game.physics.arcade.collide(this.ActionObjects.springs.mushrooms, this.collisionLayer);
               this.game.physics.arcade.collide(
                  this.player.self, this.ActionObjects.springs.mushrooms,
                  this.ActionObjects.springs.mushrooms[0].handleSpring, null, this
               );
         }
         //ladder overlapping
         if (this.ActionObjects.ladders.length > 0) {
            this.player.isClimbing = this.game.physics.arcade.overlap(
               this.player.self, this.ActionObjects.ladders,
               this.player.handleClimb, null, this.player
            );
         }
         //keyboxes
         if (this.ActionObjects.boxes.length > 0) {
            this.game.physics.arcade.overlap(
               this.player.self, this.ActionObjects.boxes,
               this.ActionObjects.boxes[0].handleKey, null, this
            );
         }
      //Action Layers collision
         //boulder collisions
         if (this.ActionLayers.boulders.length > 0) {
            this.game.physics.arcade.collide(
               this.ActionLayers.boulders, this.collisionLayer,
               this.ActionLayers.boulders[0].handleSmash, null, this
            );
            this.game.physics.arcade.collide(
               this.player.self, this.ActionLayers.boulders,
               this.ActionLayers.boulders[0].handleFall, null, this
            );
         }
         //bridges collision
         if (this.ActionLayers.bridges.length > 0) {
            this.game.physics.arcade.collide(this.player.self, this.ActionLayers.bridges);
         }

      this.player.handlePlayerMovement();

   },
   coverLayerReveal: function(player, layer) {
      if (layer.collides) {
         this.game.add.tween(this.coverLayer).to( { alpha: 0.5}, 100, Phaser.Easing.Linear.None, true);
      } else
         this.game.add.tween(this.coverLayer).to( { alpha: 0.8}, 100, Phaser.Easing.Linear.None, true);
   },
   buildGameInfo: function() {
      //score text
      var style = { font: "20px Arial", fill: "#111", align: "center" };
      this.SLcoinImage = this.game.add.sprite(45, 50, 'point_coin', 0);
      this.scoreLabel = this.game.add.text(85, 50, this.player.items.points.coins, style);

      var blt = this.game.add.sprite(50, 30, 'bullet', 0);
      this.numBullets = this.game.add.text(80, 20, this.playerItems.ammo.bullets, style);

      //ensures items stay fixed to the camera view, not the map
      this.scoreLabel.fixedToCamera = true;
      this.numBullets.fixedToCamera = true;
      this.SLcoinImage.fixedToCamera = true;
      blt.fixedToCamera = true;
   },
};
