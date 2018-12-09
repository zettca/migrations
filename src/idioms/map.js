import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';
import lines from './lines';

export default {
  draw: drawMap,
  update: updateMap,
};

let mapSVG;
let migrationData;
let populationData;

function mouseIn() { }

function mouseOut() { }

function contextMenu(d) {
  d3.event.preventDefault();

  const selectedCountries = new Set(store.get('selectedCountries'));
  selectedCountries.delete(d.id);
  store.set('selectedCountries', Array.from(selectedCountries));

  updateMap();
}

function clicked(d) {
  const selectedCountries = new Set(store.get('selectedCountries'));
  selectedCountries.add(d.id);
  store.set('selectedCountries', Array.from(selectedCountries));

  updateMap();
}

const color = d3.scaleThreshold()
  .domain([1, 10, 100, 250, 500, 1000, 2500, 5000, 10000].map(n => n * 1000))
  .range(d3.schemeBlues[9]);

export function drawMap(id, width, height, topology, data, population) {
  mapSVG = createSVG(id, { width, height });

  migrationData = data;
  populationData = population;

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
    .data(topology.features)
    .enter().append('path')
    .attr('id', (d) => d.id)
    .attr('name', (d) => d.properties.name)
    .attr('d', path)
    .on('click', clicked)
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

  d3.selectAll('.selected').classed('selected', false);
  selectedCountries.forEach((countryID, i) => {
    d3.select('path#' + countryID)
      .style('fill', colors[i % num])
      .classed('selected', true);
  });

  const year = store.get('year') || 2010;
  const isEmigration = store.get('isEmigration');

  mapSVG.selectAll('path:not(.selected)')
    //.transition().duration(600)
    .style('fill', (d) => {
      const dataYear = migrationData[year];
      if (dataYear[d.id] === undefined) return 'black'; // no data
      const migrants = Number(isEmigration ? dataYear['WORLD'][d.id] : dataYear[d.id]['Total']);
      return color(migrants);
    });

  lines.update();
}
