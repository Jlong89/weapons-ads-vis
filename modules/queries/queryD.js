var queryBodyD = {
    size:0,
    query:{
        range : {
            sellerStartDate : {
                gte: "2011-01-01 00:00:00", 
                lte: "now"
            }
        }
    },
    
    aggs : {
        sellers_over_time : {
            date_histogram : {
                field : "sellerStartDate",
                interval : "week"
            }
        }
    }
  };


  var requestD = function($scope, client) {
    client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: queryBodyD
        }).then(function (data) {
            $scope.isBusy = false;
            $scope.errorMessage = '';
            if (data.aggregations != null && data.aggregations != undefined) {
                var sellerDates = data.aggregations.sellers_over_time.buckets;
                for(var i=0; i<sellerDates.length; i++){
                    var newObj = {};
                    newObj["date"] = sellerDates[i]["key_as_string"];
                    newObj["size"] = sellerDates[i]["doc_count"];
                    listD.push(newObj);
                }
            }else{
                $scope.errorMessage = 'No data aggregations found';
            }

            chartD();
        }, function (err) {
                $scope.isBusy=false;
                $scope.session = '';
                console.trace(err.message);
        });
}


var chartD = function($scope, client) {
    d3.select("#chartD svg").remove();
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var parseDate = function (dateStr) {
        dateStr = dateStr.split(" ")[0];
        return d3.time.format("%Y-%m-%d").parse(dateStr);  
    } 

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.size); });

    var svg = d3.select("#chartD").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = listD;

    data.forEach(function(d) {
        d.date = parseDate(d.date);
      });

      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([0, d3.max(data, function(d) { return d.size; })]);

      svg.append("path")
          .datum(data)
          .attr("class", "area")
          .attr("d", area);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .append("text")
          .attr("y", 20)
          .attr("dy", ".71em")
          .text("seller signup dates");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Ads count");

    d3.select("#chartD svg").style("height", 500 + "px");       

};
