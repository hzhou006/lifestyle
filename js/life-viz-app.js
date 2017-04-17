var lifeVizApp = (function() {
    function init() {
        
        var hobbyAnimation = new HobbyAnimation("#hobby-animation");
        hobbyAnimation.init();
        hobbyAnimation.animate();

    }
    init();
}());