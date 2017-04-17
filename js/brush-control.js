// this class let use to select the range of the given data
// and trigger the event when user selected the range
var BrushControl = function(container, containerWidth, containerHeight, brushedCallback){
   
    var data = null;
    var svg = null;
    var brush = null; 
    var x;

    // when brush ends, enlarge the selected data
    // trigger the callback
    var brushend = function() {
        var selected = [];
        var extent = brush.extent();
        for (var i = 0; i < data.length; i++) {
            var d = x(data[i]);
            if ((extent[0] <= d) && (d <= extent[1])) {
                selected.push(data[i]);
            }
        }

        svg.selectAll(".ele").transition()
            .attr("fill", "#777")
            .attr("font-size", function(d) {
                if ((extent[0] <= x(d)) && (x(d) <= extent[1])) {
                    return 12;
                }
                else {
                    return 10;
                }
            });
        if (brushedCallback) {
            brushedCallback(selected);
        }
    }.bind(this);
   
    this.reset = function() {
        d3.selectAll(".ele")
            .transition()
            .duration(500)
            .attr("fill", function(d) { return "#777"; })
            .attr("font-size", function(d) { return 12; });

    }
    
    // blink the target data
    this.blink = function(target) {
        d3.selectAll(".ele")
            .transition()
            .duration(500)
            .attr("fill", function(d) {
                if (d === target) {
                    return "#000";
                } else{
                    return "#777";
                }
            })
            .attr("font-size", function(d) {
                if (d === target) {
                    return 22;
                } else{
                    return 12;
                }
            });
    }

    this.render = function(d) {
        data = d;
        var margin = {top: 0, right: 0, bottom: 10, left: 0},
            width = containerWidth - margin.right - margin.left,
            height = containerHeight - margin.top - margin.bottom;

        x = d3.scale.ordinal()
            .domain(data)
            .rangePoints([0, width], 1);

        brush = d3.svg.brush().x(x)
            .on("brushend", brushend);

        svg = d3.select(container).append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        svg.append("g").selectAll(".ele")
            .data(data)
            .enter().append("text")
            .attr("class", "ele")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "translate(" + x(d) + "," + (height / 2) + ")"; })
            .text(function(d) { return d; })
            .attr("fill", "#777");

        svg.append("g")
            .attr("class", "brush")
            .call(brush)
          .selectAll("rect")
            .attr("height", height);
    }
};
