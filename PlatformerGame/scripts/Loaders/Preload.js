var TesterGame = TesterGame || {};

TesterGame.Preload = function(){};

TesterGame.Preload.prototype = {
   preload: function() {

      //"preloadBar" was defined in Boot.js line 9
      this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadbar');
      this.preloadBar.anchor.setTo(0.5);

      this.load.setPreloadSprite(this.preloadBar);

      //load json tile map (built in Tiled)
      this.game.load.tilemap('map1', 'assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('map2', 'assets/map2.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('map3', 'assets/map3.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('level3', 'assets/level3.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('level4', 'assets/level4.json', null, Phaser.Tilemap.TILED_JSON);

      //load png sheets
      this.game.load.spritesheet('all_map_pieces', 'assets/generic_1_21x21_0m_2s.png', 21, 21);
      this.game.load.spritesheet('player', 'assets/dude+.png', 32, 48);
      this.game.load.spritesheet('all_enemies', 'assets/EnemySprites32x32.png', 32, 32, 80);

      this.game.load.spritesheet('point_coin', 'assets/SImple_Coin_Sheet (1).png', 21, 21);
      this.game.load.image('bullet', 'assets/bullet.png');
      this.game.load.image('refiller_ammo', 'assets/bullet.png');
      this.game.load.spritesheet('mushroom', 'assets/mushroom.png', 26, 34);
      this.game.load.spritesheet('boulder', 'assets/boulder.png', 21, 21);
      this.game.load.image('ladder_chain', 'assets/ladder_chain.png');
      this.game.load.image('point_orb_ender', 'assets/Orbs/yellow_ball.png');
      this.game.load.image('key', 'assets/Key.png');
      this.game.load.image('keybox', 'assets/KeyBox.png');
      this.game.load.spritesheet('bridge', 'assets/Bridges.png', 21, 21);

      this.game.load.image('coin_particle', 'assets/coin_particle.png');

      //coin "ping" sound
      this.load.audio('collect', 'assets/audio/collect.ogg');

      //buttons
      this.game.load.spritesheet('button', 'assets/buttonHM.png', 250,150);


   },
   create: function() {
      this.state.start('MainMenu');
   }
};
