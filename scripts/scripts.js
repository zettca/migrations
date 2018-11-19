const K = 1000, M = 1000000;

const tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html((d) => '<p>lul</p>');

const
  margin = { top: 20, right: 20, bottom: 30, left: 30 },
  width = 1200 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

const color = d3.scale.threshold()
  .domain([10 * K, 100 * K, 500 * K, 1 * M, 5 * M, 10 * M, 50 * M, 100 * M, 500 * M, 1500 * M])

const svg = d3.selectAll('#choropleth')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map');

const projection = d3.geo.mercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

const path = d3.geo.path().projection(projection);

svg.call(tip);

queue()
  .defer(d3.json, 'world_countries.json')
  .defer(d3.tsv, '../data/population.tsv')
  .await(ready);

function ready(error, data, population) {
  var populationById = {};

  population.forEach(function (d) { populationById[d.id] = +d.population; });


  svg.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(data.features)
    .enter().append('path')
    .attr('d', path)
    .style('fill', function (d) { return color(populationById[d.id]); })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style('opacity', 0.8)
    // tooltips
    .style('stroke', 'white')
    .style('stroke-width', 0.3)
    .on('mouseover', function (d) {
      tip.show(d);

      d3.select(this)
        .style('opacity', 1)
        .style('stroke', 'white')
        .style('stroke-width', 3);
    })
    .on('mouseout', function (d) {
      tip.hide(d);

      d3.select(this)
        .style('opacity', 0.8)
        .style('stroke', 'white')
        .style('stroke-width', 0.3);
    });

  svg.append('path')
    .datum(topojson.mesh(data.features, function (a, b) { return a.id !== b.id; }))
    // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
    .attr('class', 'names')
    .attr('d', path);
}