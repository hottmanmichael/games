var TesterGame = TesterGame || {};

TesterGame.Enemy = function(Level, type) {

   this.Level = Level;
   this.game = Level.game;
   this.map = Level.map;
   this.type = type;

   this.gid = setGID();
   this.groupByType();
   this.group = this.getGroup();

   function setGID() {
      var enemies = Level.map.objects.Enemy;
      console.log("enemies: ", enemies)
      for (var i in enemies) {
         if (type == enemies[i].properties.type) {
            return enemies[i].gid;
         }
      }
   }

}

TesterGame.Enemy.prototype = {
   // init: function() {
   //
   //    this.group = this.groupByType();
   //    //console.log("this.group: ", this.group)
   //
   // },
   groupByType: function() {
      this.group = this.game.add.group();
      this.group.enableBody = true;
      this.group.physicsBodyType = Phaser.Physics.ARCADE;
      //console.log("type: ", this.type);
      if (this.gid == 'undefined')
         throw new Error('GID is incorrect.')
      switch (this.type) {
         case 'crab':
            this.map.createFromObjects('Enemy', this.gid, 'all_enemies', 0, true, false, this.group);


            //group =
            // console.log("this.group: ", this.group)
            this.setUpMovement(this.group);
            // console.log("THIS GROUP : ", this);
            //console.log("THIS: ",this)
            break;
         default: throw new Error('Type property is missing in Tiled.')
      }
   },

   setGroup: function(group) {
      this.group = group;
   },
   getGroup: function() {
      return this.group;
   },
   setUpMovement: function(enemies){
      for (var enemy in enemies.children) {
         this.game.physics.enable(enemies.children[enemy]);
      }
      this.group = enemies;
      console.log("ENEMIES: ", enemies);
      console.log("THIS: ", this)
   },
   handleDanger: function(player, enemy) {},
   handleMovement: function(enemies){},

   animate: function() {},
   updateMotion: function(body) {
      this.animate(body);
   }
}
// TesterGame.Enemy.prototype.setUpMovement = function(enemies){
//    console.log("THIS: ", this);
//
//
// };

TesterGame.GroundEnemy = function(Level, type) {
   TesterGame.Enemy.apply(this, arguments);
   this.type = type;
   //console.log("enemy: ", this);

   //this.direction = (this.Level.rnd.realInRange(0,1) < 0.50) ? 'left' : 'right';

   this.handleDanger = function(player, enemy) {
      // console.log("player: ", player);
      // console.log("enemy: ", enemy);
      console.log("danger...")
   }



   //this.handleMovement = function(enemies) {};
   // this.handleCrabMovement = function(enemies) {
   //    for (var crab in group) {
   //       this.game.physics.enable(enemies[crab]);
   //       //enemies[crab].body.velocity.x
   //    }
   //    console.log("ENEMIES: ", enemies)
   //    return enemies;
   // }
}


TesterGame.GroundEnemy.Crab = function(Level, type) {
   TesterGame.GroundEnemy.apply(this, arguments);
   this.direction = (Level.rnd.realInRange(0,1) < 0.50) ? 'left' : 'right';
   //console.log("this: ", this);

}



// TesterGame.AirEnemy = function(that) {
//    TesterGame.Enemy.apply(this);
//    this.extra = 'extra';
// }




TesterGame.GroundEnemy.prototype = TesterGame.Enemy.prototype;
TesterGame.GroundEnemy.prototype.constructor = TesterGame.GroundEnemy;


//
// TesterGame.AirEnemy.prototype = TesterGame.Enemy.prototype;
// TesterGame.AirEnemy.prototype.constructor = TesterGame.AirEnemy;
