/*
    Javascript file that utilizes d3.js to draw a regression line on
    a set of points contained in data_array
    
    Author: Sohail Khan
*/


var data_array = []
var margins = {top: 20, right: 20, bottom: 30, left: 60};


// functions for calculating regression line

function rVal() {
    mean_x = d3.mean(data_array, d=>d.x);
    mean_y = d3.mean(data_array, d=>d.y);

    stddev_x = d3.deviation(data_array, d=>d.x);
    stddev_y = d3.deviation(data_array, d=>d.y);


    r_val = data_array.map(d=>(((d.x-mean_x)/stddev_x) * (d.y-mean_y)/stddev_y))
                    .reduce((x,y)=>x+y) / (data_array.length - 1)

    return r_val;

}

function slope() {
    return rVal() * (d3.deviation(data_array, d=>d.y)/d3.deviation(data_array, d=>d.x));
}

function intercept() {
    return (d3.mean(data_array, d=>d.y) - slope()*d3.mean(data_array, d=>d.x));
}


function line_func(x) {
    return slope()*x + intercept();
}

function Coordinate(x,y) {
    this.x=x;
    this.y=y;
}


function initializeDataArray(n, max, min) {
    min = min == undefined ? 0:min;
    max = max == undefined ? 100:max;
    for (var i = 0; i < n; i++) {
        x = Math.random()* (max-min)
        y = Math.random()* (max-min)
        data_array.push(new Coordinate(x,y))
    }

}



function clearDataArray() {
    data_array.length = 0;
}

function mousemove(cursor) {
    // This translates the height into appropriate cartesian coords
    // relative to the chart
    function mousemove_(){

        cursor.attr("transform", "translate(" + d3.mouse(this) +")");
    }
    return mousemove_;
}

// takes in d3.mouse(this) value and returns a coordinate
function makeCoords(coords) {
    var x = coords[0] - margins.left;
    var y = $("svg").height() - coords[1] - margins.bottom;
    return new Coordinate(x,y);
}

function mousedown(cursor) {

    function mousedown_() {
        // choose first g group from svg
        new_coord = makeCoords(d3.mouse(this));
        data_array.push(new_coord);
        console.log(new_coord);
        updateChart();
        
        
    }
    
    return mousedown_;
}


function drawCoords(xMap, yMap) {

    var chart_area = d3.select("svg").select("g");

    chart_area.selectAll(".point")
        .data(data_array)
      .enter().append("circle")
        .attr("class", "point")
        .attr("r", 2.9)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .on("mouseover", function(d) {
            var tooltip = d3.select(".tooltip");
            tooltip
                .transition()
                .duration(200)
                .style("opacity", .9);
            tooltip
              .html("("+d.x+", "+d.y+")")
                .style("left", (d3.event.pageX +5)+"px")
                .style("top", (d3.event.pageY -28)+"px");
        })
        .on("mouseout", function(d) {
            var tooltip = d3.select(".tooltip");
            tooltip
                .transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function initChart() {
    // initialize mouse pointer

    var chart = d3.select(".chart")
                .append("svg");

    var width = $(".chart").width() - margins.left - margins.right,
        height = 500 - margins.top - margins.bottom;

    if ($(".chart").css("display") === "inline") {
        width = $(window).width() - margins.left - margins.right;
    }

    var cursor = chart.append("circle").attr("r", 8)
          .attr("class", "cursor")
          .attr("transform", "translate(-100, -100)")
          .attr("class", "cursor");


    /* bind the mouse handlers to the svg */
    chart.attr("height", height+margins.top+margins.bottom)
         .attr("width", width+margins.left+margins.right)
         .on("mousemove", mousemove(cursor))
         .on("mousedown", mousedown(cursor));

    // setup the offsets for all points in the chart
    chart = chart.append("g")
        .attr("transform", "translate(" + margins.left
              + ", "+margins.top+")");


    // make axis
    // xaxis and scale
    xVal = d=>d.x,
    xScale = d3.scale.linear().range([0, width]),
    xMap   = d=>xScale(xVal(d)),
    xAxis  = d3.svg.axis().scale(xScale).orient("bottom");


    // yaxis and scale
    yVal = d=>d.y,
    yScale = d3.scale.linear().range([height, 0]),
    yMap   = d=>yScale(yVal(d)),
    yAxis  = d3.svg.axis().scale(yScale).orient("left");



    // setup tooltip area
    var tooltip = d3.select(".main-content").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);    


    // initial array should have already been set, if not set it
//    if (data_array.length == 0) {
  //     initializeDataArray(10); 
 //   }


    // setup domain for scales
    //xScale.domain([d3.min(data_array, xVal)-1, d3.max(data_array, xVal)+1]);
    //yScale.domain([d3.min(data_array, yVal)-1, d3.max(data_array, yVal)+1]);

    xScale.domain([0, width]);
    yScale.domain([0, height]);

    // create the axis
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,"+height+")")
        .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("X");

    // y-axis
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Y");
    
    drawCoords(xMap, yMap);
    
}



function updateChart() {
    var height = 500 - margins.top - margins.bottom;
    var width  = $('.chart').width() - margins.right - margins.left;

    var chart = d3.select("svg");

    // in bootstrap, element gets attribute of inline once it is blocked?
    if ($(".chart").css("display") === "inline") {
        width = $(window).width()- margins.right - margins.left;
    }
    chart.attr("height", height+ margins.top+ margins.bottom)
         .attr("width", width  +margins.right+ margins.left);

    // xaxis and scale
    xVal = d=>d.x,
    xScale = d3.scale.linear().range([0, width]),
    xMap   = d=>xScale(xVal(d)),
    xAxis  = d3.svg.axis().scale(xScale).orient("bottom");


    // yaxis and scale
    yVal = d=>d.y,
    yScale = d3.scale.linear().range([height, 0]),
    yMap   = d=>yScale(yVal(d)),
    yAxis  = d3.svg.axis().scale(yScale).orient("left");

    // domains need some tweaking
  //  xScale.domain([d3.min(data_array, xVal)-1, d3.max(data_array, xVal)+1]);
   // yScale.domain([d3.min(data_array, yVal)-1, d3.max(data_array, yVal)+1]);

    xScale.domain([0, width]);
    yScale.domain([0, height]);

    // update the axis
    chart.select(".x")
        .attr("transform", "translate(0,"+height+")")
        .call(xAxis)

    chart.select(".y")
        .call(yAxis);

    console.log("updating chart");
    clearChart();
    drawCoords(xMap, yMap);
        
}


function clearChart() {
    $(".point").remove();

}

function drawRegLine(xMap, yMap) {
    d3.select(".reg-line").remove();

    var chart =  d3.select("svg").select("g");
    var height = $("svg").height();
    var width = $("svg").width();
    console.log(height, width);

    max_x = d3.max(data_array, d=>d.x);

    // for some reason the line is offset by 50
    // so i hardcoded the translate
    var line= chart.append("line")
      .attr("transform", "translate(0, -50)")
        .attr("x1", 0)
        .attr("y1", height-line_func(0))
        .attr("x2", max_x)
        .attr("y2", height-line_func(max_x))
        .attr("stroke-width", 2)
        .attr("stroke", "blue")
        .attr("class", "reg-line");

}

function clearRegLine() {
    d3.select(".reg-line").remove();
}

        

$(document).ready(function () {
    // main
    initializeDataArray(10, 500);
    initChart();
    $(window).on('resize', updateChart);

    $("#clear-chart").click(function() {
        clearChart();
        clearRegLine();
        clearDataArray();
        
    });

    $("#line-draw").click(function() {
        drawRegLine();
    });

    $("#line-clear").click(function() {
        clearRegLine();
    });
});
