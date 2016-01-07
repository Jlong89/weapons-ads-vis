'use strict'

var getQueryBody = function(weaponType) {
    var queryBodyC = {
     size: 0,
    aggs: {
        group_by_date: {
            terms: {
                field: "availableDate"
            },
            aggs: {
                group_by_type: {
                    terms: {
                        field: "itemCategory"
                    },
                    aggs: {
                        group_by_manufacturer: {
                            terms:{
                                field: "itemManufacturer"
                            } 
                        }
                    }     
                }
            }
        }
    }
};

var queryCByType = {
    size:0,
   query: {
            match: {
                itemCategory : weaponType
            }
        },
        aggs:{
            group_by_date: {
                terms: {
                    field: "availableDate"
                },
                aggs: {
                    group_by_manufacturer: {
                        terms:{
                            field: "itemManufacturer"
                        } 
                    }
                }
            }
        }
  };

  return (weaponType == undefined) ? queryBodyC:queryCByType;
}


var getWeaponTypes = function($scope, client) {
    if(weaponsTypeList!=undefined && weaponsTypeList.length!=0) return;
    client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: queryGetWeaponTypes()
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
                for(var i=0; i<weaponsTypeList.length; i++) {
                    $("#typesDrop").append("<li style='margin-top:15px'><a>"+weaponsTypeList[i]+"</a></li>");
                }
                 $('#typesDrop').on('click', 'li', function() {
                    $("#typesDropButton").text($(this).text());
                    $("#typesDropButton").append("<span class='caret'></span>")
                    requestC($scope, client, ($(this).text() == 'All Types') ? undefined : $(this).text());
                });
            }
            $("#typesDrop").append("<li style='margin-top:15px'><a>All Types</a></li>");
            
        }, function (err) {
                $scope.isBusy=false;
                $scope.session = '';
                console.trace(err.message);
        });
}



var requestC =function($scope, client, type) {
        client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: getQueryBody(type)
        }).then(function (data) {
            var response = data;
            $scope.isBusy = false;
                $scope.errorMessage = '';
                if (data.aggregations != null && data.aggregations != undefined) {
                    listC["name"] = "dates"
                    listC["children"] = [];
                    var dateBuckets = data.aggregations.group_by_date.buckets;
                    var listCDateChildren = listC["children"];
                    for(var i=0; i<dateBuckets.length; i++) {
                        var dateObj = {};
                        dateObj["name"]=dateBuckets[i]["key_as_string"];
                        dateObj["children"] = [];
                        if(dateBuckets[i]["group_by_type"] != undefined) {
                            var typeBuckets = dateBuckets[i].group_by_type.buckets;
                            var typeChildren = dateObj["children"];
                            for(var j=0; j<typeBuckets.length; j++) {
                                var typeObj = {};
                                typeObj["name"]=typeBuckets[j]["key"];
                                typeObj["children"]=[];
                                var manuBuckets  = typeBuckets[j].group_by_manufacturer.buckets;
                                var manuChildren = typeObj["children"];
                                for(var k=0; k<manuBuckets.length; k++) {
                                    var manuObj = {};
                                    manuObj["name"]=manuBuckets[k]["key"];
                                    manuObj["size"]=manuBuckets[k]["doc_count"];
                                    manuChildren.push(manuObj);
                                }
                                typeChildren.push(typeObj);
                            }
                            listCDateChildren.push(dateObj);
                        } else {
                                var manuBuckets  = dateBuckets[i].group_by_manufacturer.buckets;
                                for(var k=0; k<manuBuckets.length; k++) {
                                    var manuObj = {};
                                    manuObj["name"]=manuBuckets[k]["key"];
                                    manuObj["size"]=manuBuckets[k]["doc_count"];
                                    dateObj["children"].push(manuObj);
                                }
                            listCDateChildren.push(dateObj);
                        }
                    }   
                    //var test = listC;
                    chartC();
                } else {
                    $scope.errorMessage = 'No data (aggregations) found!';
                }
        }, function (err) {
            $scope.isBusy = false;
            $scope.session = '';
            console.trace(err.message);
        });
    };

var chartC = function($scope, client) {
    d3.select("#chartC svg").remove();
    var diameter = 960,
    format = d3.format(",d");

    var pack = d3.layout.pack()
        .size([diameter - 4, diameter - 4])
        .value(function(d) { return d.size; });

    var svg = d3.select("#chartC").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
      .append("g")
        .attr("transform", "translate(2,2)");

    var root=listC; 
      //if (error) throw error;

      var node = svg.datum(root).selectAll(".node")
          .data(pack.nodes)
        .enter().append("g")
          .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("title")
          .text(function(d) { return d.name + (d.children ? "" : ": " + format(d.size)); });

      node.append("circle")
          .attr("r", function(d) { return d.r; });

      node.filter(function(d) { return !d.children; }).append("text")
          .attr("dy", ".3em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.name.substring(0, d.r / 3); });
    

    d3.select("#chartC svg").style("height", diameter + "px");        
    }

