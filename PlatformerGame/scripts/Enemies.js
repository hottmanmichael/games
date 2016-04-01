
Crab = function (game, x, y, type, map) {

   this.game = game;
   this.map = map;

   y -= 32;//account for positioning error in map. Crab height = 32px

   Phaser.Sprite.call(this, game, x, y, 'all_enemies', 0);
   this.DANGER_TYPE = 'enemy';
   this.STATE = {
      alive: true
   };
   this.MOVEMENT = {
      speed: 100,
      fps: 10,
      animate: {
         walk: [0,1,2,3,4]
      }
   };

   game.physics.enable(this);
   this.body.collideWorldBounds = true;

   this.speed = this.MOVEMENT.speed;
   this.speed = (game.rnd.realInRange(0,1) < 0.50) ? (-this.speed) : (this.speed);

   this.animations.add('walk', this.MOVEMENT.animate.walk, true);
};

Crab.prototype = Object.create(Phaser.Sprite.prototype);
Crab.prototype.constructor = Crab;
/**
 * Automatically called by World.update
 */
Crab.prototype.update = function() {

   this.game.physics.arcade.collide(this, this.collisionLayer);

   //dont allow enemy to fall off edges
   this.checkEdges();

   //bounce if collied with left or right wall
   if (this.body.onFloor()) {
      this.animations.play('walk', this.MOVEMENT.fps);
      if (!this.body.blocked.left && !this.body.blocked.right) {
         this.body.velocity.x = this.speed;
      }
      if (this.body.blocked.left || this.body.blocked.right) {
         this.speed = -this.speed;
         this.body.velocity.x = this.speed;
      }
   }
};

Crab.prototype.checkEdges = function () {
   var bodyL = this.body.right - 32; //x coord
   var bodyR = this.body.right; //x coord
   var bodyBtm = this.body.bottom; //y coord
   var tileLeftFloor = this.map.getTileWorldXY(bodyL, bodyBtm, 21, 21, 'collisionLayer', true);
   var tileRightFloor = this.map.getTileWorldXY(bodyR, bodyBtm, 21,21,'collisionLayer', true);

   if (tileLeftFloor != 'null') {
      if (tileLeftFloor.index == -1 || tileRightFloor.index == -1) {
         this.speed = -this.speed;
         this.body.velocity.x = this.speed;
      }
   }
};
Crab.prototype.handleWeaponCollide = function (weapon, enemy) {
   //console.log("anims: ", enemy);
   enemy.animations.stop(false, false);
   enemy.STATE.alive = false;
   enemy.body.enableBody = false;
   enemy.body.enable = false;
   enemy.speed = 0;
   enemy.body.velocity.y = 100;
   enemy.body.allowGravity = true;
   var s = 100;
   var alpha = this.game.add.tween(enemy).to( { alpha: 0 }, s, Phaser.Easing.Elastic.EaseOut, true, 0, 3);
   alpha.onRepeat.add(speedUpTweenFlash, this);
   alpha.onComplete.add(removeEnemy, this);
   //this.game.time.events.add(1000, enemy.removeEnemy, enemy);
   //this.kill(enemy);
   if (weapon.key == 'bullet') {
      weapon.destroy();
   }
   function speedUpTweenFlash(target, tween) {
      tween.timeline[0].duration *= 1.3;
   }
   function removeEnemy(target, tween) {
      target.destroy();
   }
};
Crab.prototype.removeEnemy = function () {
   this.destroy();
};


Bird = function (game, x, y, type, map) {

   this.game = game;
   this.map = map;

   y -= 32;//account for positioning error in map. Bird height = 32px

   Phaser.Sprite.call(this, game, x, y, 'all_enemies', 40);
   this.DANGER_TYPE = 'enemy';
   game.physics.enable(this);
   this.body.allowGravity = false;
   this.body.collideWorldBounds = true;
   this.STATE = {
      alive: true
   };
   this.MOVEMENT = {
      speed: 50,
      fps: 10,
      startY: this.body.position.y,
      deltaPosYMax: 100,
      animate: {
         flyUp: [40,41,42,43,44],
         flyDown:
            [42,43,42,41,41,41,41,41,41,
               41,42,43,44,43,42,41,42,43,
               44,43,42,41,41,41,41,41,42,
               43,44,43,42,43,42,41,41,41],
         kill: [58,58,58]
      }
   };

   //randomizes direction
   this.speed = this.MOVEMENT.speed;
   this.speed = (game.rnd.realInRange(0,1) < 0.50) ? (-this.speed) : (this.speed);

   this.animations.add('flyUp', this.MOVEMENT.animate.flyUp, true);
   this.animations.add('flyDown', this.MOVEMENT.animate.flyDown, true);
   this.animations.add('kill', this.MOVEMENT.animate.kill, true);
};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;
/**
 * Automatically called by World.update
 */
Bird.prototype.update = function() {

   //this.game.physics.arcade.collide(this, this.collisionLayer);

   //float bird up and down
   // if (this.body.)
   // console.log("body: ", this.body);
   // throw new Error('')

   //bounce if collied with left or right wall
   if (!this.body.blocked.up && !this.body.blocked.down) {
      if (this.speed > 0)
         this.animations.play('flyDown', this.MOVEMENT.fps);
      else
         this.animations.play('flyUp', this.MOVEMENT.fps);

      if (Math.abs(this.MOVEMENT.startY - this.body.position.y) > this.MOVEMENT.deltaPosYMax) {
         this.speed = -this.speed;
         this.body.velocity.y = this.speed;
      } else {
         this.body.velocity.y = this.speed;
      }
   }
   if (this.body.blocked.up || this.body.blocked.down) {
      this.speed = -this.speed;
      this.body.velocity.y = this.speed;
   }
   if (this.speed === 0) {
      this.animations.play('kill', this.MOVEMENT.fps);
   }

};

Bird.prototype.handleWeaponCollide = function (weapon, enemy) {
   enemy.animations.stop(false, false);
   enemy.STATE.alive = false;
   enemy.body.enableBody = false;
   enemy.body.enable = false;
   enemy.speed = 0;
   enemy.body.velocity.y = 100;
   enemy.body.allowGravity = true;
   var s = 100;
   var alpha = this.game.add.tween(enemy).to( { alpha: 0 }, s, Phaser.Easing.Elastic.EaseOut, true, 0, 3);
   alpha.onRepeat.add(speedUpTweenFlash, this);
   alpha.onComplete.add(removeEnemy, this);
   //this.game.time.events.add(1000, enemy.removeEnemy, enemy);
   //this.kill(enemy);
   if (weapon.key == 'bullet') {
      weapon.destroy();
   }
   function speedUpTweenFlash(target, tween) {
      tween.timeline[0].duration *= 1.3;
   }
   function removeEnemy(target, tween) {
      target.destroy();
   }
};
Bird.prototype.removeEnemy = function () {
   //console.log("this: ", this);
   this.destroy();
};


Drone = function (game, x, y, type, map) {

   this.game = game;
   this.map = map;

   y -= 32;//account for positioning error in map. Bird height = 32px

   Phaser.Sprite.call(this, game, x, y, 'all_enemies', 73);
   this.DANGER_TYPE = 'enemy';
   game.physics.enable(this);
   this.body.allowGravity = false;
   this.body.collideWorldBounds = true;
   this.STATE = {
      alive: true,
   };
   this.MOVEMENT = {
      speed: 50,
      fps: 10,
      startX: this.body.position.x,
      deltaPosXMax: 100,
      animate: {
         flyLeft: [74],
         flyRight: [73],
         kill: [72,74]
      }
   };

   //randomizes direction
   this.speed = this.MOVEMENT.speed;
   this.speed = (game.rnd.realInRange(0,1) < 0.50) ? (-this.speed) : (this.speed);

   this.animations.add('flyLeft', this.MOVEMENT.animate.flyLeft, true);
   this.animations.add('flyRight', this.MOVEMENT.animate.flyRight, true);
   this.animations.add('kill', this.MOVEMENT.animate.kill, true);
};

Drone.prototype = Object.create(Phaser.Sprite.prototype);
Drone.prototype.constructor = Drone;
/**
 * Automatically called by World.update
 */
Drone.prototype.update = function() {

   //this.game.physics.arcade.collide(this, this.collisionLayer);

   //float bird up and down
   // if (this.body.)
   // console.log("body: ", this.body);
   // throw new Error('')

   //bounce if collied with left or right wall
   if (!this.body.blocked.left && !this.body.blocked.right) {
      if (this.speed > 0)
         this.animations.play('flyDown', this.MOVEMENT.fps);
      else
         this.animations.play('flyUp', this.MOVEMENT.fps);

      if (Math.abs(this.MOVEMENT.startX - this.body.position.x) > this.MOVEMENT.deltaPosXMax) {
         this.speed = -this.speed;
         this.body.velocity.x = this.speed;
      } else {
         this.body.velocity.x = this.speed;
      }
   }
   if (this.body.blocked.left || this.body.blocked.right) {
      this.speed = -this.speed;
      this.body.velocity.x = this.speed;
   }
   if (this.speed === 0) {
      this.animations.play('kill', this.MOVEMENT.fps);
   }

};
Drone.prototype.handleWeaponCollide = function (weapon, enemy) {
   enemy.animations.stop(false, false);
   enemy.STATE.alive = false;
   enemy.body.enableBody = false;
   enemy.body.enable = false;
   enemy.speed = 0;
   enemy.body.velocity.y = 100;
   enemy.body.allowGravity = true;
   var s = 100;
   var alpha = this.game.add.tween(enemy).to( { alpha: 0 }, s, Phaser.Easing.Elastic.EaseOut, true, 0, 3);
   alpha.onRepeat.add(speedUpTweenFlash, this);
   alpha.onComplete.add(removeEnemy, this);

   if (weapon.key == 'bullet') {
      weapon.destroy();
   }
   function speedUpTweenFlash(target, tween) {
      tween.timeline[0].duration *= 1.3;
   }
   function removeEnemy(target, tween) {
      target.destroy();
   }
};
Drone.prototype.removeEnemy = function () {
   //console.log("this: ", this);
   this.destroy();
};




















// var TesterGame = TesterGame || {};
//
//
// TesterGame.EnemyGroup = function(type, Level) {
//    this.map = Level.map;
//    this.game = Level.game;
//    this.type = type;
//
//    this.gid = getGID();
//    //console.log("this: gid: ", this.gid)
//
//    this.groupType = type;
//    this.group = Level.game.add.group();
//       this.group.enableBody = true;
//       this.group.physicsBodyType = Phaser.Physics.ARCADE;
//    this.properties = [];
//
//    this.createEnemies();
//
//    console.log("that: ", Level);
//    console.log("this: ", this);
//
//    function getGID() {
//       var enemies = Level.map.objects.Enemy;
//       console.log("enemies: ", enemies);
//       for (var i in enemies) {
//          if (type.substring(0, type.indexOf('_')) == enemies[i].properties.type) {
//             if (type.substring(type.indexOf('_') + 1, type.length) == enemies[i].properties.subtype) {
//                return enemies[i].gid;
//             }
//          }
//       }
//    }
// };
//
// TesterGame.EnemyGroup.prototype = {
//    createEnemies: function() {
//       switch (this.type) {
//          case 'ground_crab':
//             this.map.createFromObjects(
//                'Enemy', this.gid, 'all_enemies', 0, true, false, this.group
//             );
//             //console.log("GROUP: ", this.group);
//             this.setUpEnemies_Crab();
//             break;
//          default: throw new Error('Incorrect group type. Cannot find group of :'+this.type);
//
//       }
//    },
//    setUpEnemies_Crab() {
//       console.log("enemies: ", this.group);
//       for (var enemy in this.group.children) {
//          var c = new TesterGame.Crab(this.group.children[enemy]);
//          this.game.physics.enable(c.self);
//          console.log("c: ", c);
//          this.properties.push(c);
//       }
//       console.log("group: ", this.enemiesGroup);
//    },
// };
// //
// // TesterGame.GroundEnemy = function(self) {
// //    this.self = self;
// // };
// //
// // TesterGame.GroundEnemy.prototype = {
// //
// // };
// //
// // TesterGame.Crab = function(self) {
// //    TesterGame.GroundEnemy.apply(this, arguments);
// //
// // };
// //
// //
// //
// //
// // TesterGame.Crab.prototype = TesterGame.GroundEnemy.prototype;
// // TesterGame.Crab.prototype.constructor = TesterGame.Crab;

//
// var TesterGame = TesterGame || {};
// TesterGame.EnemyGroup = function(type, Level) {
//    this.map = Level.map;
//    this.game = Level.game;
//
//    this.type = type;
//
//    this.gid = getGID();
//    //console.log("this: gid: ", this.gid)
//
//    this.groupType = type;
//    this.group = Level.game.add.group();
//       this.group.enableBody = true;
//       this.group.physicsBodyType = Phaser.Physics.ARCADE;
//
//    this.createEnemies();
//
//    // console.log("that: ", Level);
//    // console.log("this: ", this);
//
//    function getGID() {
//       var enemies = Level.map.objects.Enemy;
//       //console.log("enemies: ", enemies);
//       for (var i in enemies) {
//          if (type.substring(0, type.indexOf('_')) == enemies[i].properties.type) {
//             if (type.substring(type.indexOf('_') + 1, type.length) == enemies[i].properties.subtype) {
//                return enemies[i].gid;
//             }
//          }
//       }
//    }
// };
//
// TesterGame.EnemyGroup.prototype = {
//    createEnemies: function() {
//       switch (this.type) {
//          case 'ground_crab':
//
//             for (var enemy in this.map.objects.Enemy) {
//                if (this.map.objects.Enemy[enemy].name == 'Crab') {
//                   var e = this.map.objects.Enemy[enemy];
//                   // this.group.create(e.x+100, e.y+100, null, 0);
//                   //console.log("this.group: ", this.group);
//                }
//             }
//             this.setUpEnemies_Crab();
//             break;
//          default: throw new Error('Incorrect group type. Cannot find group of :'+this.type);
//       }
//    },
//    setUpEnemies_Crab: function() {
//
//       for (var enemy in this.group.children) {
//          console.log("enemy: ", this.group.children[enemy])
//          // this.game.physics.arcade.enable(gp.children[enemy])
//          var _enemyX = this.group.children[enemy].position.x;
//          var _enemyY = this.group.children[enemy].position.y;
//          //new Crab(this.game, 300, 600, 'ground_crab', this.map);
//          var c = new Crab(this.game, _enemyX, _enemyY, this.type, this.map);
//             this.game.physics.enable(c);
//             c.body.collideWorldBounds = true;
//             this.frameName = 'collisionLayer';
//          this.group.children[enemy] = c;
//       }
//       console.log("this.group.children: ", this.group.children);
//    },
// };
