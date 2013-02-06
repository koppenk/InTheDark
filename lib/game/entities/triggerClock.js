ig.module(
	'game.entities.triggerClock'
)
.requires(
	'game.entities.trigger'
    //'impact.debug.debug'
)
.defines(function(){

EntityTriggerClock = EntityTrigger.extend({
    size: {x: 16, y: 16},
    target: {},
    sound: new ig.Sound("media/sounds/Ticking Clock.*", false),
    startedSound: false,
    spotted: false,
    
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 255, 0, 0.7)',
	
    update: function() {
        if (!this.startedSound && this.spotted) {
            ig.log("play");
            this.sound.play();
            this.startedSound = true;
        } else {
            // first do broad sweep using distance
            if (this.distanceTo(ig.game.player) < ig.game.player._detectDistance + 20) {
                // get angle and check within current light angle
                var angle = ig.game.player.angleTo(this).toDeg();
                if (angle < 0)
                    angle += 360;
                
                angle = Math.abs(ig.game.player.direction * 45 - angle);
                
                if (angle < ig.game.player._detectAngle || angle > 300) {
                    this.spotted = true;
                }
            }
        }
    }
});

});