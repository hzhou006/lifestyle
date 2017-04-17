var BarChart = function(container) {
    var margin = {top: 40, right: 20, bottom: 30, left: 40},
        width = $(container).width() - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(7)
        .tickFormat(d3.format("0"));

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Place traveled:</strong> <span style='color:red'>" + d.count + "</span>";
      })

    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);
    
    this.render = function(data, callback) {
        x.domain(data.map(function(d) { return d.year; }));
        y.domain([0, d3.max(data, function(d) { return d.count; })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Place traveled");

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.year); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d) {
                callback(d);
            });
    }
    
    this.grayoutAll = function() {
        svg.selectAll(".bar")
            .attr("opacity", 0.2);
    }

    this.highlightAll = function(data) {
        svg.selectAll(".bar")
            .attr("opacity", 0.7);
    }

    this.highlight = function(data) {
        svg.selectAll(".bar")
            .transition()
            .duration(1000)
            .attr("opacity", function(d) { 
                if (d.year === data.year) {
                    return 0.7;
                } else {
                    return d3.select(this).attr("opacity");
                }
            });
    }

    function type(d) {
      d.count = +d.count;
      return d;
    }
}

