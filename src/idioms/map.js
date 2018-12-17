import * as d3 from 'd3';
import store from 'store';
import {
  tooltip, selection, stateEmitter, createSVG, colors, countryName, getMigration
} from '../util';

export default {
  draw: drawMap,
  update: updateMap,
};

let mapSVG;
let migrationData, populationData;

stateEmitter.on('yearChanged', () => updateMap());
stateEmitter.on('countriesChanged', () => updateMap());
stateEmitter.on('migrationChanged', () => updateMap());

function clickRight(d) {
  d3.event.preventDefault();
  selection.remCountry(d.id);
}

function clickLeft(d) {
  const forbidden = ['UNK', 'TWN', 'ATA'];
  if (forbidden.includes(d.id)) return;
  selection.addCountry(d.id);
}

export function drawMap(id, topology, data, population) {
  const el = document.querySelector(id);
  const [width, height] = [el.clientWidth, el.clientHeight];

  mapSVG = createSVG(id, { width, height });

  migrationData = data;
  populationData = population;

  const projection = d3.geoEquirectangular()
    .scale(width / 5)
    .translate([width / 2, height / 0.8]);

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
    .on('click', clickLeft)
    .on('contextmenu', clickRight)
    .on('mouseover', tooltip.mouseover)
    .on('mouseout', tooltip.mouseout)
    .on('mousemove', tooltip.mousemove);

  function zoomed() {
    map.selectAll('path')
      .attr('transform', d3.event.transform);
  }

  updateMap();
}

export function updateMap() {
  console.log('updating map...');

  const selectedCountries = store.get('selectedCountries') || [];
  const year = store.get('year') || 2010;
  const dataYear = migrationData[year];

  function getMigrants(d) {
    if (dataYear[d.id] === undefined) return 0; // no data
    const migrants = getMigration(dataYear, d.id);
    const pop = populationData[d.id][year];

    return migrants / pop || 0;
  }

  const color = d3.scaleThreshold()
    .domain([-20, -10, -5, -2.5, 0, 2.5, 5, 10, 20])
    .range(colors.map);

  mapSVG.selectAll('path')
    // .transition().duration(600)
    .style('fill', (d) => color(getMigrants(d)))
    .on('mouseover', (d) => tooltip.mouseover(
      `<strong>${countryName(d.id)}</strong> (${year})<br/>
      <big>${d3.format('.1f')(getMigrants(d))}</big> migrants<br/>
      <small>/1000 population</small>`
    ));

  d3.selectAll('.selected').classed('selected', false);
  selectedCountries.forEach((countryID, i) => {
    d3.select('path#' + countryID)
      .style('fill', colors.selection[i % colors.selection.length])
      .classed('selected', true);
  });
}
