ig.module( 
	'game.main' 
)

.requires(
	'impact.game',
	'impact.font',
	'impact.sound',
	//'impact.debug.debug',
	
	// files
	'game.entities.player',
	'game.entities.obstacle',
	'game.entities.ghost',
	
	// levels
	'game.levels.levelone',
	'game.levels.leveltwo',
	'game.levels.levelthree',
	'game.levels.levelfour',
	'game.levels.levelfive',
	'game.levels.levelsix',
	'game.levels.levelseven',
	
	// plugins
	'plugins.lights',
	'plugins.screen-fader'
)

// TODO LIST
// 1. Tweak Volume
// 2. Clean Up Code
// 3. Clock should have limited activated angles
// 4. Ghost detection code hacked together - can detect ghosts behind cupboards
// 5. Scene for mum hugging child
// 8. Reduce HitBox Size for ghost and kid
// 7. Heartbeat sound not looping well
// 8. Toys collision buggy
// 9. Temp disabled heartbeat and collision for toys

.defines(function(){

MyGame = ig.Game.extend({
	gameState: {
		START_SCREEN: 0,
		INTRO: 1,
		GAME_OVER: 2,
		ENDING: 3,
		GAME: 4,
	},
	currentState: 0,
	timer: false,
	enterPressed: false,

	lightManager: false,
	screenFaderOut: false,
	screenFaderIn: false,

	
	hints: ["(Hint) The longer you shine your light on them,\nthe longer you would keep them still.",
			"(Hint) Running makes you faster, \nbut you can'tuse your torch and bounce away from obstacles.",
			"(Hint) The longer they start chasing you, the faster then get.\nStop them with your light."],
	endingText: ["Child: Mommy!! There are monsters chasing me!", 
				 "Mother: Aw, you're having a nightmare?", 
				 "Child: No, Mommy, No!!! Don't open the door!", "The End"],
	hintNum: 0,
	endingNum: 0,
	drawFinalImage: false,

	// Load a font
	titleFont: new ig.Font('media/title.font.png'),
	bodyFont: new ig.Font('media/body2.font.png'),
	promptFont: new ig.Font('media/body.font.png'),

	ending: new ig.Image('media/ending.png', 1024, 546),

	levels: [],
	currentLevel: 0,
	loadingLevel: false,
	gameEnabled: false,
		
	_ambientLight: '0.92',
	_ambientLightNum: 0.92,
	hideShadow: false,
	hadLightning: false,
	usingEditor: false,
	hardMode: false,

	fadeSpeed: 2,

	
	toySounds: [
		new ig.Sound("media/sounds/newToy/FogyLakeEdit.*"),
		new ig.Sound("media/sounds/newToy/InTheClosetEdit1.*"),
		new ig.Sound("media/sounds/newToy/InTheClosetEdit2.*"),
		new ig.Sound("media/sounds/newToy/LostItEdit.*"),
		new ig.Sound("media/sounds/newToy/TheMarsesEdit1.*"),
		new ig.Sound("media/sounds/newToy/TheMarsesEdit2.*"),
		new ig.Sound("media/sounds/newToy/TheMarsesEdit3.*")],
	toySoundsPlaying: [],intromusic: new ig.Sound("media/sounds/Rainandthunder.*"),
	doorOpen: new ig.Sound("media/sounds/Door open.*"),
	doorClose: new ig.Sound("media/sounds/Door close.*"),

	init: function() {
		this.lightManager = new ig.LightManager('rgba(0, 0, 0, ' + this._ambientLight + ')', [0,0,0, this._ambientLightNum * 255]);
		this.timer = new ig.Timer();

		this.resetToySounds();

		// Bind keys
		ig.input.bind(ig.KEY.UP_ARROW,'up');
		ig.input.bind(ig.KEY.LEFT_ARROW,'left');
		ig.input.bind(ig.KEY.DOWN_ARROW,'down');
		ig.input.bind(ig.KEY.RIGHT_ARROW,'right');
		
		// debug keys
		ig.input.bind(ig.KEY.Q,'light');
		ig.input.bind(ig.KEY.O, "skipLevel");
		ig.input.bind(ig.KEY.P, "godMode");
		ig.input.bind(ig.KEY.I, "win");
		
		ig.input.bind(ig.KEY.ENTER, 'start');
		ig.input.bind(ig.KEY.SHIFT, 'run');

		// Randomize Levels	
		this.randomizeLevels();
		this.loadLevelByNumber(this.currentLevel);
		this.screenFaderOut = new ig.ScreenFader( { fade: 'out', speed: this.fadeSpeed, callback: this.gameReadyCallback } );
	},

	resetToySounds: function() {
		for (var i = 0; i < this.toySounds.length; i++) {
			this.toySoundsPlaying[i] = 0;
		}
	},

	randomizeLevels: function() {
		var start = [LevelLevelone];
		var tempLevel = [LevelLeveltwo, LevelLevelthree, LevelLevelfour, LevelLevelfive, LevelLevelsix];
		var end = [LevelLevelseven];

		// Modern Fisher-Yates to shuffle levels
		for (var i = tempLevel.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
	        var tmp = tempLevel[i];
	        tempLevel[i] = tempLevel[j];
	        tempLevel[j] = tmp;
	    }
	    
		this.levels = start.concat(tempLevel, end);
	},

	loadLevelByNumber: function (number) {
		this.lightManager.removeAllLights();
		this.loadLevel(this.levels[this.currentLevel]);
	},
	
	loadLevel: function( data ) {
		this.parent( data );
		for( var i = 0; i < this.backgroundMaps.length; i++ ) {
			this.backgroundMaps[i].preRender = true;
		}
	},

	gameReadyCallback: function() {
		//ig.log("done fading");
		this.gameEnabled = true;
    	this.screenFaderOut = false;

    	if (this.currentLevel != 0)
    		this.doorClose.play();
	},

	gameOverCallback: function() {
		//ig.log("done fading for game over");
		
		// only is hardmode is progress-reset
		if (this.hardMode)
			this.currentLevel = 0;
    	this.screenFaderIn = false;
    	this.hintNum = Math.floor(Math.random() * 3);
    	this.currentState = this.gameState.GAME_OVER;
    	this.timer.reset();
	},

	exitLevelCallback: function() {
		//ig.log("done fading into black");
    	this.screenFaderIn = false;
    	this.nextLevel();
	},

	gameOver: function() {
		// fade screen out first, then continues gameover with call back function
		this.screenFaderIn = new ig.ScreenFader( { fade: 'in', speed: this.fadeSpeed * 0.4, color: {r: 100, g: 0, b: 0, a:1}, callback: this.gameOverCallback} );
		this.gameEnabled = false;
	},

	exitLevel: function() {
		this.screenFaderIn = new ig.ScreenFader( { fade: 'in', speed: this.fadeSpeed, callback: this.exitLevelCallback } );
		this.doorOpen.play();
		this.gameEnabled = false;
	},

	winGame: function() {
		this.currentState = this.gameState.ENDING;
		this.screenFaderOut = new ig.ScreenFader( { fade: 'out', speed: this.fadeSpeed} );
			this.timer.reset();
	},

	nextLevel: function() {
		//this.screenFaderIn = new ig.ScreenFader( { fade: 'in', speed: 0.5 } );	

		this.currentLevel++;
		if (this.currentLevel >= this.levels.length) {
			this.winGame();	
		}
		else {
			this.screenFaderOut = new ig.ScreenFader( { fade: 'out', speed: this.fadeSpeed, callback: this.gameReadyCallback} );
			this.loadLevelByNumber(this.currentLevel);
		}

	},
	
	update: function() {
		if (ig.input.state("win")) {
			this.winGame();
		}

		switch (this.currentState) {
			case (this.gameState.START_SCREEN): {
				this.promptFont.alpha = Math.abs(Math.sin(this.timer.delta() * 1.5));

				if (ig.input.state('start') && !this.enterPressed) {
					this.enterPressed = true;
					this.timer.reset();
					this.promptFont.alpha = 0;
					this.currentState = this.gameState.INTRO;
					this.intromusic.play();
				}
			}
			break;

			case (this.gameState.ENDING): {
				//ig.log(this.endingNum);
				if (this.endingNum > 2) {
					this.drawFinalImage = true;
					this.promptFont.alpha = 1;
					// draw image
					//and the end
				} else if (this.timer.delta() < Math.PI) {
					this.promptFont.alpha = Math.abs(Math.sin(this.timer.delta())) ;
				} else {
					this.timer.reset();
					this.endingNum++;
				}
			}
			break;			

			case (this.gameState.INTRO): {
				if (!ig.input.state('start') && this.enterPressed) {
					this.enterPressed = false;
				}

				if (this.timer.delta() > Math.PI || (ig.input.state('start') && !this.enterPressed)) {
					this.timer.reset();
					this.currentState = this.gameState.GAME;
				} else {
					this.promptFont.alpha = Math.abs(Math.sin(this.timer.delta()));
				}	
			}
			break;

			case (this.gameState.GAME_OVER): {
				this.titleFont.alpha = (this.titleFont.alpha < 0.95) ? Math.abs(Math.sin(this.timer.delta() * 0.6)) : 1;
				this.bodyFont.alpha = (this.titleFont.alpha < 0.95) ? Math.abs(Math.sin(this.timer.delta() * 0.6)) : 1;

				this.promptFont.alpha = Math.abs(Math.sin(this.timer.delta() * 1.5));

				if (ig.input.state('start') && !this.enterPressed) {
					this.intromusic.stop();
					
					// only in hardmode is order re-randomized
					if (this.hardMode)
						this.randomizeLevels();
					
					this.enterPressed = true;
					this.timer.reset();
					this.promptFont.alpha = 0;
					this.titleFont.alpha = 1;
					this.bodyFont.alpha = 1;
					this.currentState = this.gameState.INTRO;
					this.intromusic.play();
					this.loadLevelByNumber(this.currentLevel);
					this.screenFaderOut = new ig.ScreenFader( { fade: 'out', speed: this.fadeSpeed, callback: this.gameReadyCallback } );
				}
			}
			break;

			case (this.gameState.GAME): {
				// One-Time Trigger Buttons
				if (ig.input.state('skipLevel') && !this.loadingLevel) {
					this.loadingLevel = true;
					this.nextLevel();	
				}

				if (!ig.input.state('skipLevel') && this.loadingLevel) {
					this.loadingLevel = false;
				}


				if (ig.input.state('godMode') && !this.settingGodMode) {
					this.settingGodMode = true;
					this.player.godMode();	
				}

				if (!ig.input.state('godMode') && this.settingGodMode) {
					this.settingGodMode = false;
				}
				
				/*
				if (ig.input.state('light') && !this.hadLightning) {
					this.hadLightning = true;
					this.hideShadow = !this.hideShadow;
				}
				
				if (!ig.input.state('light') && this.hadLightning) {
					this.hadLightning = false;
				}
				*/

				
				// update our shadowmap/lightmap state
				this.lightManager.update();			

				if (this.gameEnabled) {
					this.parent();
				} else {
					this.player.update();
				}


	
				
			}
			break;
		}

		
		
	},
	
	draw: function(){
		if( this.clearColor ) {
			ig.system.clear( this.clearColor );
		}
		
		
		switch (this.currentState) {
			case (this.gameState.START_SCREEN): {
				var bodyText = "\n Use the ARROW KEYS to run away.\n Hold the SHIFT KEY to run.\n Shine your light on objects to keep them still.";

				this.titleFont.draw("IN THE DARK", 1024 / 2, 768 / 3, ig.Font.ALIGN.CENTER);
				this.bodyFont.draw(bodyText, 1024 / 2, 768 / 2, ig.Font.ALIGN.CENTER);
				this.promptFont.draw("Hit the ENTER KEY to start game", 1024 / 2, 768 / 7 * 5, ig.Font.ALIGN.CENTER);

			}
			break;

			case (this.gameState.ENDING): {
				if (this.drawFinalImage) {
					this.ending.draw(0, 110);
					this.promptFont.draw(this.endingText[this.endingNum], 1024 / 2, 768 / 9 * 8, ig.Font.ALIGN.CENTER);

					if (this.screenFaderOut) {
				       this.screenFaderOut.draw();
				    }
				} else {
					this.promptFont.draw(this.endingText[this.endingNum], 1024 / 2, 768 / 2, ig.Font.ALIGN.CENTER);	
				}
			}
			break;

			case (this.gameState.GAME_OVER): {
				this.titleFont.draw("Do They Really Exist?", 1024 / 2, 768 / 3, ig.Font.ALIGN.CENTER);
				this.bodyFont.draw(this.hints[this.hintNum], 1024 / 2, 768 / 2, ig.Font.ALIGN.CENTER);
				this.promptFont.draw("Hit the ENTER KEY to try again", 1024 / 2, 768 / 7 * 5, ig.Font.ALIGN.CENTER);
			}
			break;
			
			case (this.gameState.INTRO): {
				this.promptFont.draw("Child: .....Mummy.....?", 1024 / 2, 768 / 2, ig.Font.ALIGN.CENTER);
			}
			break;

			case (this.gameState.GAME): {
				// This is a bit of a circle jerk. Entities reference game._rscreen 
				// instead of game.screen when drawing themselfs in order to be 
				// "synchronized" to the rounded(?) screen position
				// screen follows the player
				var player = this.getEntitiesByType( EntityPlayer )[0];
				if (player) {
					this.screen.x = player.pos.x - ig.system.width/2;
					this.screen.y = player.pos.y - ig.system.height/2;
				}

					this._rscreen.x = ig.system.getDrawPos(this.screen.x)/ig.system.scale;
				this._rscreen.y = ig.system.getDrawPos(this.screen.y)/ig.system.scale;

				var mapIndex;
				for( mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
					var map = this.backgroundMaps[mapIndex];
					if( map.foreground ) {
						// All foreground layers are drawn after the entities
						break;
					}
					map.setScreenPos( this.screen.x, this.screen.y );
					map.draw();
				}
				
				var ghosts = this.getEntitiesByType("EntityGhost");

				// draw toys
				for (var i = 0; i < ghosts.length; i++ ) {
					var ghost = ghosts[i];
					if (ghost.currentState <= ghost.ghostStates.PASSIVE_LIGHT)
					{
						ghosts[i].draw();
					}
				}

				// draw light
				this.lightManager.drawLightMap();
				
				if (!this.hideShadow) {
					this.lightManager.drawShadowMap();
				}
				
				// draw player/ghost
				for (var i = 0; i < ghosts.length; i++ ) {
					var ghost = ghosts[i];
					if (ghost.currentState > ghost.ghostStates.PASSIVE_LIGHT)
					{
						ghosts[i].draw();
					}
				}

				if (this.player)
					this.player.draw();

				
				for (mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
					var map = this.backgroundMaps[mapIndex];
					map.setScreenPos( this.screen.x, this.screen.y );
					map.draw();
				}

				if (this.screenFaderOut) {
			       this.screenFaderOut.draw();
			    }

				if (this.screenFaderIn) {
			       this.screenFaderIn.draw();
			    }
			    
			}
		}

		

		
	},
	
});

	ig.main('#canvas', MyGame, 60, 1024, 768, 1);
});
