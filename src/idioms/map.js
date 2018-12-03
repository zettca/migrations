import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';
import lines from './lines';

export default {
  draw: drawMap,
  update: updateMap,
};

let mapSVG;

function selected(d) {
  d3.select('.selected').classed('selected', false);
  d3.select(this).classed('selected', true);
  store.set('selectedCountry', d.id);
  lines.update();
}

export function drawMap(id, width, height, data, population) {
  mapSVG = createSVG(id, { width, height });
  const countryPop = {};

  population.forEach((d) => countryPop[d.id] = +d.population);

  const color = d3.scaleThreshold()
    .domain([10, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1500000].map(n => n * 1000))
    .range(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b', '#03132b']);

  const projection = d3.geoMercator()
    .scale(width / 4)
    .translate([width / 2, height / 1.2]);

  const path = d3.geoPath().projection(projection);
  const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .on('zoom', zoomed);

  mapSVG.call(zoom);

  const map = mapSVG.append('g').attr('class', 'countries');
  map
    .selectAll('path')
    .data(data.features)
    .enter().append('path')
    .attr('id', (d) => d.id)
    .attr('name', (d) => d.properties.name)
    .attr('d', path)
    .style('fill', (d) => color(countryPop[d.id]))
    .on('click', selected)
    .on('mouseover', mouseIn)
    .on('mouseout', mouseOut)
    .on('contextmenu', contextMenu)
    .append('title').text(d => `${d.id}: ${d.properties.name}`);

  function mouseIn() { }

  function mouseOut() { }

  function contextMenu() {
    console.log('right clicked...');
  }

  function zoomed() {
    map.selectAll('path')
      .attr('transform', d3.event.transform);
  }

}

export function updateMap(id, data) {

}
