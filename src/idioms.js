import * as d3 from 'd3';
import { makeSVG } from './helpers';

export default {
  drawMap: drawMap,
  drawPlot: drawPlot,
  drawChord: drawChord,
  drawLines: drawLines,
};

let plotSVG, linesSVG, mapSVG, chordSVG;

let selectedCountry = 'SWE';
let dataYears = null;

function selected(d) {
  d3.select('.selected').classed('selected', false);
  d3.select(this).classed('selected', true);
  selectedCountry = d.id;
  updateLines();
}

export function drawPlot(id, width, height, data) {
  plotSVG = makeSVG(id, width, height);
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.x)).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.y)).nice()
    .range([height - margin.bottom, margin.top]);

  function xAxis(g) {
    g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call(g => g.select('.domain').remove());
  }

  function yAxis(g) {
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('.tick:last-of-type text').clone());
  }

  function dodge(text, iterations = 300) {
    const nodes = text.nodes();
    const left = text => text.attr('text-anchor', 'start').attr('dy', '0.32em');
    const right = text => text.attr('text-anchor', 'end').attr('dy', '0.32em');
    const top = text => text.attr('text-anchor', 'middle').attr('dy', '0.0em');
    const bottom = text => text.attr('text-anchor', 'middle').attr('dy', '0.8em');
    const points = nodes.map(node => ({ fx: +node.getAttribute('x'), fy: +node.getAttribute('y') }));
    const labels = points.map(({ fx, fy }) => ({ x: fx, y: fy }));
    const links = points.map((source, i) => ({ source, target: labels[i] }));

    const simulation = d3.forceSimulation(points.concat(labels))
      .force('charge', d3.forceManyBody().distanceMax(80))
      .force('link', d3.forceLink(links).distance(4).iterations(4))
      .stop();

    for (let i = 0; i < iterations; ++i) simulation.tick();

    text
      .attr('x', (_, i) => labels[i].x)
      .attr('y', (_, i) => labels[i].y)
      .each(function (_, i) {
        const a = Math.atan2(labels[i].y - points[i].fy, labels[i].x - points[i].fx);
        d3.select(this).call(
          a > Math.PI / 4 && a <= Math.PI * 3 / 4 ? bottom
            : a > -Math.PI / 4 && a <= Math.PI / 4 ? left
              : a > -Math.PI * 3 / 4 && a <= Math.PI * 3 / 4 ? top
                : right);
      });
  }

  plotSVG.append('g').attr('class', 'axis-x').call(xAxis);
  plotSVG.append('g').attr('class', 'axis-y').call(yAxis);

  plotSVG.append('g')
    .attr('class', 'circles')
    .selectAll('circle')
    .data(data)
    .enter().append('circle')
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', 4);

  plotSVG.append('g')
    .attr('class', 'text')
    .selectAll('text')
    .data(data)
    .enter().append('text')
    .attr('x', d => x(d.x))
    .attr('y', d => y(d.y))
    .text(d => d.name)
    .call(dodge);
}

function updateLines() {
  const group = linesSVG.selectAll('g');

  const
    margin = { top: 50, right: 50, bottom: 50, left: 100 },
    width = linesSVG.attr('width') - margin.left - margin.right,
    height = linesSVG.attr('height') - margin.top - margin.bottom;

  let dataset = [];
  if (selectedCountry) {
    for (let year in dataYears) {
      const yearData = dataYears[year]['WORLD'][selectedCountry];
      dataset.push({ year: new Date(year), value: Number(yearData) });
    }
  }
  console.log(dataset);

  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)]).nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.value), d3.max(dataset, d => d.value)]).nice()
    .range([height, 0]);

  group.select('.y-axis').call(d3.axisLeft(yScale));

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  group.select('.line')
    .datum(dataset)
    .transition().duration(1000)
    .attr('d', line);

  group.selectAll('.dots circle').data(dataset)
    .transition().duration(1000)
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.value))
    .attr('r', 5);
}

export function drawLines(id, widthMain, heightMain, data) {
  linesSVG = makeSVG(id, widthMain, heightMain);

  const
    margin = { top: 50, right: 50, bottom: 50, left: 100 },
    width = widthMain - margin.left - margin.right,
    height = heightMain - margin.top - margin.bottom;

  const group = linesSVG
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  dataYears = data;

  let dataset = [];
  if (selectedCountry) {
    for (let year in dataYears) {
      const yearData = dataYears[year]['WORLD'][selectedCountry];
      dataset.push({ year: new Date(year), value: Number(yearData) });
    }
  }
  console.log(dataset);

  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)]).nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.value), d3.max(dataset, d => d.value)]).nice()
    .range([height, 0]);

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  group.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')));

  group.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  group.append('path')
    .datum(dataset)
    .attr('class', 'line')
    .attr('d', line);

  group.append('g').attr('class', 'dots').selectAll()
    .data(dataset)
    .enter().append('circle')
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.value))
    .attr('r', 5);
}

export function drawMap(id, width, height, data, population) {
  mapSVG = makeSVG(id, width, height);
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
    .on('contextmenu', contextMenu);

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

export function drawChord(id, width, height, data) {
  chordSVG = makeSVG(id, width, height);

  function groupTicks(d, step) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(value => {
      return { value: value, angle: value * k + d.startAngle };
    });
  }

  const
    outerRadius = Math.min(width, height) * 0.5 - 30,
    innerRadius = outerRadius - 20;

  chordSVG
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif');

  const myChord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

  const chords = myChord(data);
  const ribbon = d3.ribbon().radius(innerRadius);

  const formatValue = d3.formatPrefix(',.0', 1e3);
  const color = d3.scaleOrdinal()
    .domain(d3.range(4))
    .range(['#c6dbef', '#6baed6', '#2171b5', '#08306b']);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);


  const group = chordSVG.append('g')
    .selectAll('g')
    .data(chords.groups)
    .enter().append('g');

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

  chordSVG.append('g')
    .attr('fill-opacity', 0.67)
    .selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('d', ribbon)
    .attr('fill', d => color(d.target.index))
    .attr('stroke', d => d3.rgb(color(d.target.index)).darker());

}
