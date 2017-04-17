var  ForceLayout = function (containerId, containerWidth, containerHeight) {
    var width = containerWidth;
    var height = containerHeight;
    var color = ["#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a"];
    var svg = null;
    var force = null;
    var nodes = null;
    var centerNodeColor = "#777";
    var textColor = "#363636";
    var centerNodeRadius = 70;
    var hobbyNodeRadius = 45;
    
    this.init = function() {
        svg = d3.select(containerId).append("svg")
            .attr("width", width)
            .attr("height", height);

        force = d3.layout.force();
        nodes = force.nodes();

        // initially, there's only one node located in the middle
        nodes.push({name: "Heyi Zhou", value: 0, remove: false, fixed: true, x: width /2, y: height / 2, type: 0});
        
        // add my profile pic
        var clip = svg.append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:circle")
            .attr('cx', nodes[0].x)
            .attr('cy', nodes[0].y)
            .attr('r', centerNodeRadius - 5);

        var image = svg.append("svg:image")
            .attr("id", "hobby-profile-img")
            .attr("xlink:href", "photos/profile.jpg")
            .attr("width", centerNodeRadius * 2 + 20)
            .attr("height", centerNodeRadius * 2 + 20)
            .attr("clip-path", function(d,i) { return "url(#clip)"; })
            .attr('x', nodes[0].x - centerNodeRadius - 10)
            .attr('y', nodes[0].y - centerNodeRadius - 10);
    }
	

    // find node's ref by name
    function findNode(name) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].name === name) {
                return nodes[i];
            }
        }
        return null;
    }

    // update nodes based on the current hobbies list
    this.update = function(hobbies) {
        // first, suppose all the nodes are going to be removed from the nodes array
        for (var i = 1; i < nodes.length; i++) {
            nodes[i].remove = true;
        }
        // second, if a node is still in the current hobbies list,
        // then it's not going to be remove
        // also update its value by the new one
        // if a hobby is new to the exsisting nodes array,
        // then add it to nodes
        for (var i = 0; i < hobbies.length; i++) {
            var node = findNode(hobbies[i].name);
            // hobby needs update
            if (node != null) {
                node.value = hobbies[i].value;
                node.remove = false;

            // new hobby
            } else{
                var newNode = {name: hobbies[i].name, value: hobbies[i].value, type: 1};
                nodes.push(newNode);
            }
        }

        // after the above procedure, remove the nodes that are still marked removed
        while (true) {
            var idx = -1;
            for (var i = 1; i < nodes.length; i++) {
                if (nodes[i].remove === true) { 
                    idx = i;
                    break;
                }
            }

            if (idx === -1) {
                break;
            }

            nodes.splice(idx, 1);
        }
        
        // restart the force simulation
        force.size([width, height])
            .charge(-500)
            .gravity(0.1)
            //.friction(0.67)
            //.theta(0.1)
            //.alpha(0.1)
            .stop()
            .start();

        this.render();
    }

    this.clear = function() {
        nodes.splice(1, nodes.length);
        this.render();
    }

    this.render = function() {

        var updatedNodes = svg.selectAll(".node")
            .data(nodes, function(d) { return d.name; });

        updatedNodes.exit()
            .transition()
            .attr("opacity", 0)
            .remove();

        updatedNodes.enter()
            .append("circle")
            .attr("class", "node")
            .attr("opacity", 0) 
            .style("stroke", function(d) { return "#ddd"; })
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", function(d) {
                if (d.type === 0) {
                    return centerNodeRadius;
                }else {
                    return hobbyNodeRadius;
                }
            })
            .style("fill", function(d) { 
                if (d.type === 0) {
                    return centerNodeColor;
                }
                else {
                    return color[d.value]; 
                }
             })
            .call(force.drag);

        // add a transition to make new added nodes appear smoothly
        updatedNodes.transition()
            .duration(1000)
            .style("fill", function(d) { 
                if (d.type === 0) {
                    return centerNodeColor;
                }
                else {
                    return color[d.value]; 
                }
             })
            .attr("opacity", function(d) {
                if (d.type === 0) {
                    return 0.2;
                }
                else {
                    return 0.6;
                }
            });

        var updatedTexts = svg.selectAll(".hobby-name")
            .data(nodes, function(d) { return d.name; });

        updatedTexts.exit()
            .transition()
            .attr("opacity", 0)
            .remove();

        updatedTexts.enter()
            .append("text")
            .attr("class", "hobby-name")
            .text(function(d) { return d.name; })
            .attr("text-anchor", "middle")
            .attr("fill", textColor)
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });

        updatedTexts.transition()
            .duration(1000)
            .attr("opacity", 1);
            
        force.on("tick", function() {
            var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;

            while (++i < n) q.visit(collide(nodes[i]));
            svg.selectAll(".node")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d) {
                    if (d.type === 0) {
                        return centerNodeRadius;
                    }else {
                        return hobbyNodeRadius;
                    }
                });

            svg.selectAll(".hobby-name")
                .attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
        });
    }

    // resolve collision, codes by Mike
    function collide(node) {
      var r = node.radius + 16,
          nx1 = node.x - r,
          nx2 = node.x + r,
          ny1 = node.y - r,
          ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = node.radius + quad.point.radius;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      };
    }
};

