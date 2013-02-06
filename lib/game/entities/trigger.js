ig.module(
	'game.entities.trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityTrigger = ig.Entity.extend({
    size: {x: 16, y: 16},
    
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(196, 255, 150, 0.7)',
    
});


});