

var queryGetWeaponTypes = function(_state) {

  var query1 = { 
    size:0,
   query: {
            
            match: {
                state : _state
            }
            
        },
        aggs: {
                weapon_types: {
                    terms: {
                        field: "itemCategory"
                    }
                }
            }
    };

    var query2 = {
        size:0,
        aggs: {
                weapon_types: {
                    terms: {
                        field: "itemCategory"
                    }
                }
            }
        };
    return (_state==undefined)?query2 : query1;
    };


var getDataforType = function(weaponType, _state) {

    var queryBodyB2 = {
        query: {
            bool: {
              must: [
                { match: { itemCategory:  weaponType }},
                { match: { state: _state   }}
              ]
            }
        },
        aggs: {
                group_by_location: {
                    terms: {
                        field: "location"
                    },
                    aggs: {
                        group_by_date: {
                            terms: {
                                field: "availableDate"
                            }
                        }
                    }
                }
            }   
    };
    var queryBodyB1 = {
        query: {
            
                match: {
                    "itemCategory" : weaponType
                }
              
        },
        aggs: {
                group_by_location: {
                    terms: {
                        field: "location"
                    },
                    aggs: {
                        group_by_date: {
                            terms: {
                                field: "availableDate"
                            }
                        }
                    }
                }
            }   
    };
    return (_state == undefined)? queryBodyB1:queryBodyB2;
}

var getStatesQuery = {
    size: 0,
    aggs : {
      states : { 
            terms : {field : "state"} 
        }
    }
};

var getStates = function($scope, client) {
    if(statesList!=undefined && statesList.length!=0) return;
    client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: getStatesQuery
        }).then(function (data) {
            if (data.aggregations != null && data.aggregations != undefined) {
                var states = data.aggregations.states.buckets;
                for(var i=0; i<states.length; i++){
                    statesList.push(states[i]["key"]);
                }
            }else{
                $scope.errorMessage = 'No data aggregations found';
            }

            if(statesList.length != 0) {
                for(var i=0; i<statesList.length; i++) {
                    $("#statesDrop").append("<li style='margin-top:15px'><a>"+statesList[i]+"</a></li>");
                }
                 $('#statesDrop').on('click', 'li', function() {
                    $("#stateDropBttn").text($(this).text());
                    $("#stateDropBttn").append("<span class='caret'></span>")
                    doQueryB($scope, client, ($(this).text() == 'All') ? undefined : $(this).text());
                });
            }
            $("#statesDrop").append("<li style='margin-top:15px'><a>All</a></li>");
            
        }, function (err) {
                $scope.isBusy=false;
                $scope.session = '';
                console.trace(err.message);
        });
}

var indexClosure = (function() {

})

  

//Retrieves weapon types from weapon ads data
var doQueryB = function($scope, client, state) {
    
    var weaponsTypeList =[];

    client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: queryGetWeaponTypes(state)
        }).then(function (data) {
            if (data.aggregations != null && data.aggregations != undefined) {
                var types = data.aggregations.weapon_types.buckets;
                for(var i=0; i<types.length; i++){
                    weaponsTypeList.push(types[i]["key"]);
                }
            }else{
                $scope.errorMessage = 'No data aggregations found';
            }

            if(weaponsTypeList.length != 0) {
                d3.selectAll("#chartB div").remove();
                for(var k=0; k<weaponsTypeList.length; k++) {
                    var type = weaponsTypeList[k];
                    requestB($scope, client, type, state);
                }
                //var type = weaponsTypeList[0];
                //requestB($scope, client, type);
            }

        }, function (err) {
                $scope.isBusy=false;
                $scope.session = '';
                console.trace(err.message);
        });
}




var requestB = function($scope, client, weaponType, state) {
        if (listB.length != 0)listB = [];
        var newTypeData = [];

        client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: getDataforType(weaponType, state)
        }).then(function (data) {
            $scope.isBusy = false;
                $scope.errorMessage = '';
                if (data.aggregations != null && data.aggregations != undefined) {
                    for(var i=0; i < data.aggregations.group_by_location.buckets.length; i++){
                        var locationObj = data.aggregations.group_by_location.buckets[i];
                        var newObj = {};
                        newObj["location"]=locationObj["key"];
                        newObj["dateCounts"]=[];
                        var dateBuckets = data.aggregations.group_by_location.buckets[i].group_by_date.buckets;
                        for(var j=0; j < dateBuckets.length; j++){
                            var newDate = dateBuckets[j]["key_as_string"];
                            var dateCount = dateBuckets[j]["doc_count"];
                            newObj["dateCounts"].push([newDate, dateCount]);
                        }        
                        //listB.push(JSON.stringify(newObj)); 
                        newTypeData.push(newObj); 
                        listB.push(newTypeData);
                    }   
                    //console.log(listB_handguns);

                    chartB(weaponType);
                } else {
                    $scope.errorMessage = 'No data (aggregations) found!';
                }
            }, function (err) {
                $scope.isBusy=false;
                $scope.session = '';
                console.trace(err.message);
        });
    }


//chart function for queryB
var chartB = function(weaponType) {

        function truncate(str, maxLength, suffix) {
            if(str.length > maxLength) {
                str = str.substring(0, maxLength + 1); 
                str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
                str = str + suffix;
            }
            return str;
        }
        var chartNo = listB.length-1;
        var data = listB[chartNo];


        var margin = {top: 20, right: 200, bottom: 0, left: 20},
            width = 1000,
            height = 850;

        var parseDate = function (dateStr) {
            dateStr = dateStr.split(" ")[0];
            return d3.time.format("%Y-%m-%d").parse(dateStr);  
        } 

    
        var min_date = d3.min(data, function(d) { 
                return d3.min(d['dateCounts'], function(nested_d) {
                    var test = nested_d[0];
                    return parseDate(nested_d[0]);
                }) 
            }),
            max_date = d3.max(data, function(d, i) { 
                return d3.max(d['dateCounts'], function(nested_d) {
                   return parseDate(nested_d[0]); 
                })
            });
        

        var c = d3.scale.category20c();

        var x = d3.time.scale()
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("top");

        var formatDates = d3.time.format("%Y-%m-%d");
        xAxis.tickFormat(formatDates);

        
        var newChartDiv = d3.select("#chartB").append("div");

        newChartDiv.attr("id", "chartDiv"+chartNo);
        var temp = $("#chartDiv"+chartNo);
        temp.append("<h2>"+weaponType+"</h2>");

        var svg = newChartDiv.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("margin-left", margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        x.domain([min_date, max_date]);
        var xScale = d3.time.scale()
            .domain([min_date, max_date])
            .range([0, width]);
        
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(xAxis);

        var maxRadius=d3.max(data, function(d) {
            return d3.max(d['dateCounts'], function(nested_d) {
                return nested_d[1];
            })
        });
        
        for (var j = 0; j < data.length; j++) {
            
            var g = svg.append("g").attr("class","location");

            var test = data[j];


            var circles = g.selectAll("circle")
                .data(data[j]['dateCounts'])
                .enter()
                .append("circle");

            var text = g.selectAll("text")
                .data(data[j]["dateCounts"])
                .enter()
                .append("text");

            var rScale = d3.scale.linear()
                .domain([0, maxRadius])
                .range([1, 15]);

            circles
                .attr("cx", function(d, i) { 
                    return xScale(parseDate(d[0])); })
                .attr("cy", j*32+32)
                .attr("r", function(d) { return rScale(d[1]); })
                .style("fill", function(d) { return c(j); });

            text
                .attr("y", j*32+32)
                .attr("x",function(d, i) { return xScale(parseDate(d[0]))-5; })
                .attr("class","value")
                .text(function(d){ return d[1]; })
                .style("fill", function(d) { return c(j); })
                .style("display","none");

            g.append("text")
                .attr("y", j*32+32)
                .attr("x",width+20)
                .attr("class","label")
                .text(truncate(data[j]['location'],50,"..."))
                .style("fill", function(d) { return c(j); })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        }

        function mouseover(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("circle").style("display","none");
            d3.select(g).selectAll("text.value").style("display","block");
        }

        function mouseout(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("circle").style("display","block");
            d3.select(g).selectAll("text.value").style("display","none");
        }
    }