ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
	//'impact.debug.debug'
)

.defines(function(){

EntityPlayer = ig.Entity.extend({
	size: {x: 61, y: 60},
	offset: {x: 2, y: 1},
	health: 10,
	animSheet: new ig.AnimationSheet( 'media/boySprite_sheet.png', 64, 64),
	
	ghosts: false,
	farDist: 300,
	midDist: 150,
	currentPhase: -1,
	
	// movement related
	accelValue: 800,
	runAccel: 800,
	walkAccel: 600,
	friction: {x: 800, y: 800},
	runFriction: {x: 800, y: 800},
	walkFriction: {x: 800, y: 800},
	runVel: {x: 400, y: 400},
	walkVel: {x: 200, y: 200},
	bounciness: 0.4,
	runBounciness: 0.8,
	walkBounciness: 0,
	// 8 Direction movement variables
	lastDirection: 0,
	
	// Light Related
	hasLight: false,
	torchlight: false,
	playerLight: false,

	isGodMode: false,

	playRunningSound: false,
    sound: new ig.Sound("media/sounds/Running Track.*"),
    
	// Collision Variables
	type: ig.Entity.TYPE.A, // Player friendly group
	checkAgainst: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.ACTIVE,
	
	animSheet: new ig.AnimationSheet( 'media/boySprite_sheet.png', 64, 64 ),
	
	
	//public properties
	_detectDistance: 240,
	_detectAngle: 40,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		ig.game.player = this;

		this.addAnim('main', 0.1, [6, 3, 0, 2, 7, 4, 1, 5]);

		if (!ig.game.usingEditor)
			this.initLight();
	},
	
	initLight: function () {
		this.torchlight = ig.game.lightManager.addLight(this, {
			angle: this.direction * 45	,	
			angleSpread: this._detectAngle * 2,	
			radius: this._detectDistance,			
			color:'rgba(255,255,255,0)',	// there is an extra shadowColor option
			useGradients: false,	// false will use color/ shadowColor
			shadowGradientStart: 'rgba(0,0,0,0)',			// 2-stop radial gradient at 0.0 and 1.0
			shadowGradientStop: 'rgba(0,0,0,0)',
			lightGradientStart: 'rgba(255,255,255,0)',	// 2-stop radial gradient at 0.0 and 1.0
			lightGradientStop: 'rgba(0,0,0,' + ig.game._ambientLight + ')',
			pulseFactor: 0.01,
			lightOffset: {x:-3,y:-1}		// lightsource offset from the middle of the entity
		});
	},
	
	goToAndPlayTrack: function(int) {
		ig.music.stop();
		this.currentPhase = int;
		ig.music.currentIndex = this.currentPhase;
		ig.music.currentTrack = ig.music.tracks[this.currentPhase];
		ig.music.play();
	},
	
	update: function() {
		// hearbeat sound
		/*
		if (!this.ghosts) {
			this.ghosts = ig.game.getEntitiesByType("EntityGhost");
		}

		var nearestGhostDist = 1500;

		for (var i = 0; i < this.ghosts.length; i++ ) {
			var ghost = this.ghosts[i];
			var dist = this.distanceTo(ghost);
			if (dist < nearestGhostDist) {
				nearestGhostDist = dist;
			}
		}
		
		if (nearestGhostDist > this.farDist) {
			if (this.currentPhase != 0 || this.currentPhase == -1) {
				this.goToAndPlayTrack(0);
			}
		} else if (nearestGhostDist > this.midDist) {
			if (this.currentPhase != 1 || this.currentPhase == -1) {
				this.goToAndPlayTrack(1);
			}
		} else {
			ig.log(ig.music.currentIndex + " " + this.currentPhase + " " + nearestGhostDist);
			if (this.currentPhase != 2 || this.currentPhase == -1) {
				this.goToAndPlayTrack(2);
			}
		}
		*/



		// update animation
		this.currentAnim.gotoFrame(this.direction);
		
		// vary properties depending on run or walk
		if (ig.input.state('run'))
		{
			if (!this.playRunningSound){
				this.playRunningSound = true;
				this.sound.play();
			}
			this.bounciness = this.runBounciness;
			this.maxVel = this.runVel;
			this.accelValue = this.runAccel;
			this.torchlight.enabled = false;
		}
		else
		{
			if (this.playRunningSound) {
				this.playRunningSound = false;
				this.sound.stop();
			}

			this.bounciness = this.walkBounciness;
			this.maxVel = this.walkVel;
			this.accelValue = this.walkAccel;			
			this.torchlight.enabled = true;
		}

		// iterate through keyboard states to set direction
		if (ig.game.gameEnabled)
			if (ig.input.state('right') && !ig.input.state('up') && !ig.input.state('left') && !ig.input.state('down')) {
				this.direction = 0;
			} else if (ig.input.state('right') && !ig.input.state('up') && !ig.input.state('left') && ig.input.state('down')) { 
				this.direction = 1;
			} else if (!ig.input.state('right') && !ig.input.state('up') && !ig.input.state('left') && ig.input.state('down')) { 
				this.direction = 2;
			} else if (!ig.input.state('right') && !ig.input.state('up') && ig.input.state('left') && ig.input.state('down')) { 
				this.direction = 3;
			} else if (!ig.input.state('right') && !ig.input.state('up') && ig.input.state('left') && !ig.input.state('down')) { 
				this.direction = 4;
			} else if (!ig.input.state('right') && ig.input.state('up') && ig.input.state('left') && !ig.input.state('down')) { 
				this.direction = 5;
			} else if (!ig.input.state('right') && ig.input.state('up') && !ig.input.state('left') && !ig.input.state('down')) { 
				this.direction = 6;
			} else if (ig.input.state('right') && ig.input.state('up') && !ig.input.state('left') && !ig.input.state('down')) { 
				this.direction = 7;
			} else {
				// no movement for all other keyboard states
				this.stop(true);
				return;
			}
		else {
			this.stop(true);
			return;
		}

		// set light direction
		this.torchlight.angle = this.direction * 45;
		
		// resets movement if direction changes
		if (this.lastDirection != this.direction) {
			this.stop(false);
		} 
		
		// sets x y acceleration values
		if (this.direction == 7 || this.direction == 0 || this.direction == 1) this.accel.x = this.accelValue;
		if (this.direction == 1 || this.direction == 2 || this.direction == 3) this.accel.y = this.accelValue;
		if (this.direction == 3 || this.direction == 4 || this.direction == 5) this.accel.x = -this.accelValue;
		if (this.direction == 5 || this.direction == 6 || this.direction == 7) this.accel.y = -this.accelValue;
		
		// saves last direction
		this.lastDirection = this.direction;

		this.parent();
	},

	stop: function(stopCompletely ) {
		if (stopCompletely) {
			this.vel.x = 0;
			this.vel.y = 0;
		}
		this.accel.x = 0;
		this.accel.y = 0;
	},

	godMode: function() {
		this.isGodMode = !this.isGodMode;
	},

	kill: function() {
		if (!this.isGodMode) {
			//this.removeLight();
			this.parent();
			ig.game.gameOver();
			ig.music.stop();
		}	
	}
});

});