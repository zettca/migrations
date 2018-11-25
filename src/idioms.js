import * as d3 from 'd3';
import { makeSVG } from './helpers';

export default {
  drawMap: drawMap,
  drawPlot: drawPlot,
  drawChord: drawChord,
  drawLines: drawLines,
};

const chordData = [
  [19, 11, 19, 14, 15, 14, 13, 17],
  [5, 9, 5, 13, 0, 16, 2, 9],
  [12, 18, 12, 2, 1, 6, 13, 8],
  [11, 12, 18, 5, 19, 6, 16, 18],
  [19, 20, 17, 7, 16, 5, 9, 12],
  [13, 18, 15, 6, 12, 14, 11, 7],
  [10, 5, 0, 19, 18, 1, 1, 5],
  [20, 10, 7, 7, 13, 6, 1, 20]];

export function drawPlot(id, width, height, data) {
  return undefined;
}

export function drawLines(id, width, height, data) {
  return undefined;
}

export function drawMap(id, width, height, data, population) {
  const svg = makeSVG(id, width, height);
  const countryPop = {};

  population.forEach((d) => countryPop[d.id] = +d.population);

  const color = d3.scaleThreshold()
    .domain([10, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1500000].map(n => n * 1000))
    .range(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b', '#03132b']);

  const projection = d3.geoEquirectangular()
    .scale(width / 3)
    .translate([width / 2, height / 1.2]);

  const path = d3.geoPath().projection(projection);

  const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .on('zoom', zoomed);

  svg.call(zoom);

  const map = svg.append('g').attr('class', 'countries');
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
    .on('contextmenu', test);

  function selected(d) {
    d3.select('.selected').classed('selected', false);
    d3.select(this).classed('selected', true);
  }

  function mouseIn(d) {

  }

  function mouseOut(d) {

  }

  function test(d) {
    console.log('right clicked...');
  }

  function zoomed() {
    map.selectAll('path')
      .attr('transform', d3.event.transform);
  }

}

export function drawChord(id, width, height, data) {
  const svg = makeSVG(id, width, height);

  function groupTicks(d, step) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(value => {
      return { value: value, angle: value * k + d.startAngle };
    });
  }

  const
    outerRadius = Math.min(width, height) * 0.5 - 30,
    innerRadius = outerRadius - 20;

  svg
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif');

  const chords = d3.chord(chordData);
  const ribbon = d3.ribbon().radius(innerRadius);

  const formatValue = d3.formatPrefix(',.0', 1e3);
  const color = d3.scaleOrdinal()
    .domain(d3.range(4))
    .range(['#000000', '#FFDD89', '#957244', '#F26223']);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const group = svg.append('g').selectAll('g').data(chords.groups).enter().append('g');

  group.append('path')
    .attr('fill', d => color(d.index))
    .attr('stroke', d => d3.rgb(color(d.index)).darker())
    .attr('d', arc);

  const groupTick = group.append('g')
    .selectAll('g')
    .data(d => groupTicks(d, 1e3))
    .enter().append('g')
    .attr('transform', d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(${outerRadius},0)`);

  groupTick.append('line')
    .attr('stroke', '#000')
    .attr('x2', 6);

  groupTick
    .filter(d => d.value % 5e3 === 0)
    .append('text')
    .attr('x', 8)
    .attr('dy', '.35em')
    .attr('transform', d => d.angle > Math.PI ? 'rotate(180) translate(-16)' : null)
    .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
    .text(d => formatValue(d.value));

  svg.append('g')
    .attr('fill-opacity', 0.67)
    .selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('d', ribbon)
    .attr('fill', d => color(d.target.index))
    .attr('stroke', d => d3.rgb(color(d.target.index)).darker());

}
