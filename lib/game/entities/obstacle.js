ig.module(
	'game.entities.obstacle'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityObstacle = ig.Entity.extend({
	
	size: {x:32,y:32},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.FIXED,
	
	 _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(196, 255, 0, 0.7)',
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
	}
});


});