ig.module(
	'game.entities.triggerCreak'
)
.requires(
	'game.entities.trigger'
)
.defines(function(){

EntityTriggerCreak = EntityTrigger.extend({
    size: {x: 16, y: 16},
    target: {},
    checkAgainst: ig.Entity.TYPE.A,
    sound: new ig.Sound("media/sounds/Creaking floor.*", false),
    startedSound: false,

    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 0, 0, 0.7)',
	


    check: function( other ) {
        if (!this.startedSound) {
            this.sound.play();
            this.startedSound = true;    
        }
    }
    
});


});