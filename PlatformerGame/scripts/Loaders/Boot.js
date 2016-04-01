var TesterGame = TesterGame || {};

TesterGame.Boot = function(){};

//setting game configuration and loading the assets for the loading screen
TesterGame.Boot.prototype = {
  preload: function() {
  	//assets used in the loading screen
    this.load.image('preloadbar', 'assets/preloader-bar.png');
  },
  create: function() {

    //scaling options
	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	this.scale.minWidth = 240;
	this.scale.minHeight = 170;
	this.scale.maxWidth = 2880;
	this.scale.maxHeight = 1920;

	//have the game centered horizontally
	this.scale.pageAlignHorizontally = true;

	//physics system for movement
	this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.state.start('Preload');
  }
};
