'use strict'

var queryBodyA = {
    size: 0,
    query: {
        simple_query_string: {
            query: "looking to buy",
            fields: ["description"],
            default_operator: "and"
        }
    },
    aggs: {
        group_by_date: {
            terms: {
                field: "availableDate"
            },
            aggs: {
                group_by_area: {
                    terms: {
                        field: "location"
                    }
                }
            }
        }
    }
};

var requestA =function($scope, client) {
        client.search({
          index: 'json_weapons_index',
          type: 'weapon_doc',
          body: queryBodyA
        }).then(function (data) {
            $scope.isBusy = false;
                $scope.errorMessage = '';
                if (data.aggregations != null && data.aggregations != undefined) {
                    var timeList = [];
                    for (var i = 0; i < data.aggregations.group_by_date.buckets.length; i++) {//
                        var dateObj = data.aggregations.group_by_date.buckets[i];
                        if (dateObj.key < 0) continue;
                        if (!(dateObj.key in timeList)) {
                            timeList.push(dateObj.key);
                        }
                        for (var j = 0; j < dateObj.group_by_area.buckets.length; j++) {
                            var areaObj = dateObj.group_by_area.buckets[j];
                            var flag = false;
                            var k = 0;
                            for (k = 0; k < listA.length; k++) {
                                if (listA[k].key === areaObj.key) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (flag) listA[k].values.push([dateObj.key, areaObj.doc_count]);
                            else {
                                var newObj = {
                                    key: areaObj.key,
                                    values: [[dateObj.key, areaObj.doc_count]]
                                }
                                listA.push(newObj);
                            }
                        }
                    }
                    
                    chartA();
                } else {
                    $scope.errorMessage = 'No data (aggregations) found!';
                }
        }, function (err) {
            $scope.isBusy = false;
            $scope.session = '';
            console.trace(err.message);
        });
    }


var chartA = function() {
    nv.addGraph(function () {
        var chart = nv.models.multiBarChart()
            .x(function (d) {
                return d[0]
            })
            .y(function (d) {
                return d[1]
            })  
          .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
          .rotateLabels(0)      //Angle to rotate x-axis labels.
          .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
          .groupSpacing(0.1)    //Distance between each group of bars.
        ;

        chart.xAxis
            .showMaxMin(false)
            .tickFormat(function (d) {
                return d3.time.format('%x')(new Date(d))
            });

        chart.yAxis
            .tickFormat(d3.format(',.2f'));

        d3.select('#chartA svg')
            .datum(listA)
            .transition().duration(500).call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
}