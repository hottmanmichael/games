TesterGame.MainMenu = function(){};

TesterGame.MainMenu.prototype = {
   init: function(items) {
      if (typeof points == 'undefined') {
         this.playerItems = {
            points: {
               coins: 0,
               orbs: 0,
            },
            ammo: {
               bullets: 10,
            }
         };
      } else {
         this.playerItems = {
            points: {
               coins: items.points.coins,
               orbs: items.points.orbs
            },
            ammo: {
               bullets: 10
            }
         };
      }
   },
   create: function() {

      this.game.stage.backgroundColor = '#087CA7';
      // console.log("game: ", this.game);

      //start game text
      this.menu = {};
      this.menu.buttons = {};
      //this.menu.fontStyle = { font: "30px Arial", fill: "#fff", align: "center" };



      var headerStyle = {
         font: "bold 32px Arial",
         fill: "#fff",
         boundsAlignH: "center",
         boundsAlignV: "middle"
      };
      var bar = this.game.add.graphics();
         bar.beginFill(0x000000, 0.8);
         bar.drawRect(0, 50, 800, 100);
         //  The Text is positioned at 0, 50
         text = this.game.add.text(0, 50, "Main Menu", headerStyle);
         text.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2);
         text.setTextBounds(0, 0, 800, 100);
         bar.endFill();

      this.buttons = [];
      var btnStyle = {
         text: {
            play: 'play',
         },
         font: {
            font: "bold 32px Arial",
            fill: "#fff",
            boundsAlignH: "center",
            boundsAlignV: "middle"
         },
         pos: {
            x:0,
            y:0
         }
      };
      var numBtns = 4;

      this.btn = this.game.add.sprite(100,200,'button');
         this.btn.CHOICE = 'stuff';
         this.btn.scale.x = 0.8;
         this.btn.scale.y = 0.8;
         this.btn.inputEnabled = true;
         this.btn.input.pixelPerfectOver = true;
         this.btn.events.onInputOver.add(this.handleInputOver, this);
         this.btn.events.onInputOut.add(this.handleInputOut, this);
         this.btn.events.onInputDown.add(this.handleClickDown, this);
         this.btn.events.onInputUp.add(this.handleClickUp, this);
         this.btn.input.useHandCursor = true;

         this.btn.animations.add('rest', [0,0], true);
         this.btn.animations.add('hover', [1,1], true);
         this.btn.animations.add('click', [2,2], true);


      this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      //  Stop the following space key from propagating up to the browser
      this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);


      /*
      * Logic here to handle map selection
      * --> Menu for level select
      * --> Handle next level after win
      *     --> Handle update player items
      * --> Handle same level after lose? --> can also do in Level
      */
      var rnd = Math.random();
      this.map = this.game.add.tilemap('level4');
      //(rnd > 0.5) ? this.map = this.game.add.tilemap('map2') : this.map = this.game.add.tilemap('map3');

      this.gameData = {
         items: this.playerItems,
         map: this.map
      };

      this.game.physics.arcade.gravity.y = 225;

   },
   update: function() {
      //TODO: ?
   },
   handleClickDown: function(button,pointer) {
      // console.log("this: ", this.btn);
      // console.log("button: ", button);
      this.btn.animations.play('click', 10);
   },
   handleClickUp: function(b,p) {
      this.btn.animations.play('hover', 10);
      //start(key, clearWorld, clearCache, parameter)
      this.game.state.start('Game', false, false, this.gameData);
   },
   handleInputOver: function(b,p) {
      this.btn.animations.play('hover', 10);
   },
   handleInputOut: function(b,p) {
      this.btn.animations.play('rest', 10);
   },
   //Only difference to a Button constructor is the label parameter...

};
