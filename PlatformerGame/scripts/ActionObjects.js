
Spring = function(game, x, y, type, map) {
   this.game = game;
   this.map = map;

   y -= 34;//account for positioning error in map. Spring height = 34px

   Phaser.Sprite.call(this, game, x, y, 'mushroom', 0);
   this.TYPE = 'spring_mushroom';
   this.PROPERTIES = {
      foo: 'bar'
   };
   game.physics.enable(this);
   this.body.collideWorldBounds = true;
   this.body.immovable = true;
};

Spring.prototype = Object.create(Phaser.Sprite.prototype);
Spring.prototype.constructor = Spring;

Spring.prototype.update = function() {
   //console.log("here?")

};

Spring.prototype.handleSpring = function (player, spring) {
   //only spring player if hits top of spring
   //console.log("here?")
   if (spring.body.overlapY > 0) {
      player.body.velocity.y = -250;
      //COOL: Makes the spring fall below the collsion layer after 2 bounces
      //spring.body.position.y = spring.body.position.y + (spring.body.overlapY*5);
   }
};











Ladder = function(game, x, y, type, map) {
   this.game = game;
   this.map = map;

   y -= 21;//account for positioning error in map. Ladder height = 21px

   Phaser.Sprite.call(this, game, x, y, 'ladder_chain', 0);
   this.TYPE = 'ladder_chain';
   this.PROPERTIES = {
      foo: 'bar'
   };
   game.physics.enable(this);
   this.body.allowGravity = false;
   this.body.immovable = true;
   // this.body.enableBody = false;
};

Ladder.prototype = Object.create(Phaser.Sprite.prototype);
Ladder.prototype.constructor = Ladder;
//
// Ladder.prototype.update = function() {
//    //console.log("here?")
//
// };
