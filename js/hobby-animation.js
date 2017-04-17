// this class handles all the animation about my hobby
// idea: each tick along the animation update the hobbies on the force layout
// enlarge the year on the brush control
var HobbyAnimation = function(container) {
    var hobbyByYear = null; 
    var years = [];
    var forceLayout = null;
    var brushControl = null;
    var idx = 0; 
    // start and end year mark the animation range
    var startYear = 0; 
    var endYear = 0; 
    var initialized = $.Deferred();
    var ticking = null;

    function tick() {
        // at each tick, update the force layout
        forceLayout.update(hobbyByYear[idx].hobbies);
        brushControl.blink(hobbyByYear[idx].year);
        idx += 1;
        // need to make sure the animation happens with in user selected range
        if ((idx < hobbyByYear.length) 
            && (hobbyByYear[idx].year >= startYear) 
            && (hobbyByYear[idx].year <= endYear)) {
            ticking = setTimeout(tick, 2000); 
        }
    }
    
    this.animate = function() {
        // animation can only be triggered when the module is fully initialized
        initialized.done(function() {
            // clear timeout func first
            if (ticking) {
                window.clearTimeout(ticking);
            }
           
            // clear the forcelayout
            forceLayout.clear();

            // calculate the start point
            idx = 0;
            for (idx = 0; idx < hobbyByYear.length; idx++) {
                if (hobbyByYear[idx].year === startYear) {
                    break;
                }
            }

            // then start ticking
            tick();
        });
    }

    this.init = function() {
        
        var html = 
            '<div class="page-header box">' +
            '    <h2>KEEP MINDS OPEN</h2>' +
            '</div>' +
            '<div class="row"><div class="col-xs-12" id="hobby-force-layout"></div></div>' + 
            '<div class="row">' +
            '    <div class="col-xs-12" id="brush-control"></div>' +
            '</div>' +
			'<div class="row" id="overlay">' +
            '    <div class="col-xs-6">' + 
            '        <div class="bs-callout">' +            
            '             <h4>MY HOBBIES</h4>' +
            '             <p>This visualization shows how my hobbies change over time. The darker the color is, the better I love that hobby :)</p>' +
            '             <p>I am always curious about everthing. Life is short, try as many different things as possible! </p>' +	
            '        </div>' + 
            '    </div>' +
            '    <div class="col-xs-8"></div>' +
            '</div>';
        $(container).append(html);
         // init the force layout
        var width = $(container).width();
        var height = 550;

       
 

        // init the force layout
        forceLayout = new ForceLayout("#hobby-force-layout", width, height);
        forceLayout.init(); 
        
        // create the brush control set its callback
        brushControl = new BrushControl("#brush-control", width,  50, function(selected) {
            if (selected.length > 0) {
                startYear = selected[0]; 
                endYear = selected[selected.length - 1]; 
                this.animate();
            }
        }.bind(this));

        LifeVizApi.getHobbyByYear(function(data) {
            if (data.length > 0) {
                hobbyByYear = data;
                startYear = hobbyByYear[0].year;
                endYear = hobbyByYear[hobbyByYear.length - 1].year;
                for (var i = 0; i < hobbyByYear.length; i++) {
                    years.push(hobbyByYear[i].year);
                }
                brushControl.render(years);
            }
            initialized.resolve("");
        }.bind(this));
    }
};

