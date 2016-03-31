var TesterGame = TesterGame || {};

TesterGame.game = new Phaser.Game(window.width, window.height, Phaser.AUTO, '');

TesterGame.game.state.add('Boot', TesterGame.Boot);
TesterGame.game.state.add('Preload', TesterGame.Preload);
TesterGame.game.state.add('Initialize', TesterGame.Initialize);
TesterGame.game.state.add('MainMenu', TesterGame.MainMenu);
TesterGame.game.state.add('Game', TesterGame.Game);

TesterGame.game.state.start('Boot');
