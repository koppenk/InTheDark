ig.module(
	'game.entities.ghost'
)
.requires(
	'impact.entity'//,
	//'impact.debug.debug'	
)
.defines(function(){
EntityGhost = ig.Entity.extend({
	ghostStates: {
		DORMANT: 0,
		PASSIVE_LIGHT: 1,
		PASSIVE: 2,
		ACTIVE: 3,
		FIERCE: 4,
		AGGRESIVE: 5,
	},
	/*
	stateNames: {
		DORMANT: "Dormant",
		PASSIVE_LIGHT: "Passive Light",
		PASSIVE: "Passive",
		ACTIVE: "Active",
		FIERCE: "Fierce",
		AGGRESIVE: "Aggresive",
	}, //for debug
	*/
	currentState: 0,
	charge: 0,
	maxCharge: -7,
	fierceCharge: 5,
	aggresiveCharge: 8,

	chaseTimer: false,
	chargeTime: 0.55,
	dechargeTime: 0.5,

	size: {x: 60, y: 60},
	offset: {x: 1, y: 1},
	health: 1,
	animSheet: new ig.AnimationSheet( 'media/monsterSprite_sheet.png', 64, 64 ),

	// Movement related
	activeVel: {x: 200, y: 200},
	fierceVel: {x: 300, y: 300},
	aggresiveVel: {x: 500, y: 500},
	currentAccel: 100,
	activeAccel: 100,
	fierceAccel: 200,
	aggresiveAccel: 400,

	bounciness: 0.8,
	
	// Light Related
	hasLight: false,
	torchlight: false,
	playerLight: false,
	
	// Collision related
	type: ig.Entity.TYPE.B, // Evil enemy group
	checkAgainst: ig.Entity.TYPE.A, // Check against friendly
	collides: ig.Entity.COLLIDES.PASSIVE,//FIXED,
	collidesToy: ig.Entity.COLLIDES.PASSIVE,//FIXED,
	collidesGhost: ig.Entity.COLLIDES.NEVER,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		var type = Math.floor((Math.random()*3) + 3);
		this.addAnim('monster', 0.1, [type, type, type, 0, 1, 2]);
	},
	
	toPassiveTransition: function() {

		//ig.log("Ghost " + this.id + " : " + this.stateNames[this.currentState] + " > PASSIVE");
		//ig.log("Ghost " + this.id + " : PASSIVE WITH CHARGE 0");
		this.currentState = this.ghostStates.PASSIVE;
		this.collides = this.collidesToy;

		this.vel.x = 0;
		this.vel.y = 0;
		this.charge = (this.charge > 0) ? 0 : this.charge;
		this.chaseTimer = new ig.Timer(this.chargeTime);
	},

	chase: function() {
		// get angle and check within current light angle
		var angle = -(ig.game.player.angleTo(this) - Math.PI);

		this.vel.x = this.currentAccel * Math.cos(angle);
		this.vel.y = -this.currentAccel * Math.sin(angle);
	},
	
	update: function() {
		ig.log(this.collides);

		this.currentAnim.gotoFrame(this.currentState);

		// KNOWN ISSUE: light can shine through

		// check for light
		var spotted = false;

		// first do broad sweep using distance
		if (this.distanceTo(ig.game.player) < ig.game.player._detectDistance + 20) {
			// get angle and check within current light angle
			var angle = ig.game.player.angleTo(this).toDeg();
			if (angle < 0)
				angle += 360;
			
			angle = Math.abs(ig.game.player.direction * 45 - angle);

			
			if (angle < ig.game.player._detectAngle || angle > 300) {
				spotted = true;
			}
		}

		
		switch (this.currentState)
		{
			case this.ghostStates.DORMANT:
				{
					// Ghost will be activated for the first time
					if (spotted)
					{
						var sound = Math.floor((Math.random() * ig.game.toySounds.length));
						while (ig.game.toySoundsPlaying[sound] == 1) {
							var sound = Math.floor((Math.random() * ig.game.toySounds.length));	
						}

						ig.game.toySounds[sound].stop();
						ig.game.toySounds[sound].play();
						this.toPassiveTransition();
					}
				}
				break;

			case this.ghostStates.PASSIVE:
			{
				// Ghost is passive due to being spotted by light
				if (spotted)
				{
					if (this.charge > this.maxCharge)
					{
						if (this.chaseTimer.delta() > 0)
						{
							this.charge--;
							this.chaseTimer.reset();
							//ig.log("Ghost " + this.id + " : CHARGING " + this.charge + " Timer: " + this.chaseTimer.delta());
						}
					}
					else 
					{
						this.chaseTimer.pause();
					}
				}

				// With no light, ghost will start chasing once light reaches 0
				else
				{
						//ig.log("Ghost " + this.id + " : PASSIVE > PASSIVE WITH LIGHT");
						//ig.log("Ghost " + this.id + " : PASSIVE WITH LIGHT WITH CHARGE " + this.charge);
						this.currentState = this.ghostStates.PASSIVE_LIGHT;
						this.chaseTimer.set(this.dechargeTime);
				}
			}
			break;
			
			case this.ghostStates.PASSIVE_LIGHT:
			{
				if (spotted)
				{
					this.toPassiveTransition();
				}
				else
				{
					if (this.charge < 0)
					{
						if (this.chaseTimer.delta() > 0)
						{
							this.charge++;
							this.chaseTimer.reset();
							//ig.log("Ghost " + this.id + " : CHARGING " + this.charge + " Timer: " + this.chaseTimer.delta());
						}
					}
					else
					{
						//ig.log("Ghost " + this.id + " : PASSIVE WITH LIGHT > ACTIVE");
						//ig.log("Ghost " + this.id + " : ACTIVE WITH CHARGE " + this.charge);
						this.currentState = this.ghostStates.ACTIVE;
						this.collides = this.collidesGhost;
						this.currentAccel = this.activeAccel
						this.maxVel = this.activeVel;
					}
				}
			}
			break;

			case this.ghostStates.ACTIVE:
			{
				if (spotted)
				{
					this.toPassiveTransition();
				}
				else
				{
					if (this.charge >= 0)
					{
						this.chase();
					}

					if (this.charge > this.fierceCharge)
					{
						//ig.log("Ghost " + this.id + " : ACTIVE > FIERCE");
						//ig.log("Ghost " + this.id + " : FIERCE WITH CHARGE " + this.charge);
						this.currentState = this.ghostStates.FIERCE;
						this.currentAccel = this.fierceAccel;
						this.maxVel = this.fierceVel;
					}

					if (this.chaseTimer.delta() > 0)
					{
						this.charge++;
						this.chaseTimer.reset();
						//ig.log("Ghost " + this.id + " : CHARGING " + this.charge + " Timer: " + this.chaseTimer.delta());
					}
				}
			}
			break;
				
			case this.ghostStates.FIERCE:
			{
				if (spotted)
				{
					this.toPassiveTransition();
				}
				else
				{
					this.chase();
					
					if (this.charge > this.aggresiveCharge)
					{
						//ig.log("Ghost " + this.id + " : FIERCE > AGGRESIVE");
						//ig.log("Ghost " + this.id + " : AGGRESIVE WITH CHARGE " + this.charge);
						this.currentState = this.ghostStates.AGGRESIVE;
						this.currentAccel = this.aggresiveAccel;
						this.maxVel = this.aggresiveVel;
					}

					if (this.chaseTimer.delta() > 0)
					{
						this.charge++;
						this.chaseTimer.reset();
						//ig.log("Ghost " + this.id + " : CHARGING " + this.charge + " Timer: " + this.chaseTimer.delta());
					}
				}

			}
			break;
				
			case this.ghostStates.AGGRESIVE:
			{
				if (spotted)
				{
					this.toPassiveTransition();
				}
				else
				{
					this.chase();
				}
			}
			break;
		}
		
		this.parent();
	},

	check: function(other){
		if (this.currentState > this.ghostStates.PASSIVE)
		{
			if (this.distanceTo(other) < 59)
			{
				other.kill();	
			}
		}
	},
	
});

});