ig.module(
	'game.entities.triggerLamp'
)
.requires(
	'game.entities.trigger'
)
.defines(function(){

EntityTriggerLamp = EntityTrigger.extend({
    size: {x: 16, y: 16},
    light: false,

    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 0, 255, 0.7)',

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        
        if (!ig.game.usingEditor)
            this.initLight();
    },

    initLight: function () {
        this.light = ig.game.lightManager.addLight(this, {
            angle: 0  ,   
            angleSpread: 370, 
            radius: 40,           
            color:'rgba(200,200,200,0)',    // there is an extra shadowColor option
            useGradients: false,    // false will use color/ shadowColor
            pulseFactor: 0.01,
            lightOffset: {x:0, y:0}        // lightsource offset from the middle of the entity
        });
    },
});


});