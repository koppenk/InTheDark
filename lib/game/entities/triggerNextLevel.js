ig.module(
	'game.entities.triggerNextLevel'
)
.requires(
	'game.entities.trigger'
)
.defines(function(){

EntityTriggerNextLevel = EntityTrigger.extend({
    size: {x: 16, y: 16},
    target: {},
    checkAgainst: ig.Entity.TYPE.A,
    
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(0, 0, 255, 0.7)',
   
    check: function( other ) {	
			ig.game.exitLevel();
    }
    
});


});