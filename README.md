Weapon-ads-visualization
========================
USC cs572 fall 2015 project, last in a series to crawl, index and visualize ads and posts of firearms on the internet.
Inspired by the DARPA Memex effort to improve domain specific search, this project allows us to get insight into how guns are sold and bought
online.

This AngularJS app that helps us interact and visualize an Elasticsearch stored and indexed dataset about ads of firearms on the internet. 
D3 and Kibana are used for the visualizations and OKFN Facetview is used to provide facet and free text search on the index. The dataset includes
151,677 indexed ads from online gun marketplaces, most by private sellers. 

The index mapping of the indexed documents looks like the following:

```
weapon_doc: {
  properties: {
    availableDate: {type: "date", format: "yyyy-MM-dd HH:mm:ss || yyyy-MM-dd"},
    coord: {type: "geo_point"},
    description: {type: "string"},
    itemCategory: {type: "string", index: "not_analyzed"},
    itemKeywords: {type: "string"},
    itemManufacturer: {type: "string", index: "not_analyzed"},
    location: {type: "string", index: "not_analyzed"},
    orgName: {type: "string", index: "not_analyzed"},
    postUrl: {type: "string",index: "not_analyzed"},
    price: {type: "double"},
    publisherName: {type: "string",index: "not_analyzed"},
    sellerDesc: {type: "string",index: "not_analyzed"},
    sellerStartDate: {type: "date", format: "yyyy-MM-dd HH:mm:ss || yyyy-MM-dd"},
    state: {type: "string", index: "not_analyzed"},
    title: {type: "string", index: "not_analyzed"}
  }
}
```

This project provided great practice with querying Elasticsearch, AngularJS and D3. Check out the result on aws!

http://weapon-ads-datavis.s3-website-us-west-2.amazonaws.com
