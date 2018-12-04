import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';
import lines from './lines';

export default {
  draw: drawMap,
  update: updateMap,
};

let mapSVG;

function mouseIn() { }

function mouseOut() { }

function contextMenu() {
  console.log('right clicked...');
}

function selected(d) {
  const selectedCountries = new Set(store.get('selectedCountries'));
  selectedCountries.add(d.id);
  store.set('selectedCountries', Array.from(selectedCountries));

  updateMap();
}

export function drawMap(id, width, height, data, population) {
  mapSVG = createSVG(id, { width, height });
  const countryPop = {};

  population.forEach((d) => countryPop[d.id] = +d.population);

  const color = d3.scaleThreshold()
    .domain([10, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000].map(n => n * 1000))
    .range(d3.schemeBlues[9]);

  const projection = d3.geoEquirectangular()
    .scale(width / 4)
    .translate([width / 2, height / 1.2]);

  const path = d3.geoPath().projection(projection);
  const zoom = d3.zoom()
    .scaleExtent([0.6, 7])
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

  function zoomed() {
    map.selectAll('path')
      .attr('transform', d3.event.transform);
  }

  updateMap();
}

export function updateMap() {
  const selectedCountries = store.get('selectedCountries') || [];
  const num = 6;
  const colors = d3.schemeRdYlGn[num];

  d3.select('.selected').classed('selected', false);
  selectedCountries.forEach((countryID, i) => {
    d3.select('path#' + countryID)
      .style('fill', colors[i % num])
      .classed('selected', true);
  });

  lines.update();
}
