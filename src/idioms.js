import * as d3 from 'd3';
import { makeSVG } from './helpers';

export default {
  drawMap: drawMap,
  drawPlot: drawPlot,
  drawChord: drawChord,
  drawLines: drawLines,
};

export function drawPlot(id, width, height, data) {
  const svg = makeSVG(id, width, height);
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
      .call(g => g.select('.domain').remove())
      .call(g => g.append('text')
        .attr('class', 'x-axis')
        .attr('x', width - margin.right)
        .attr('y', -4)
        .text(data.x));
  }

  function yAxis(g) {
    g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select('.domain').remove())
      .call(g => g.select('.tick:last-of-type text').clone()
        .attr('class', 'y-axis')
        .attr('x', 4)
        .text(data.y));
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

  svg.append('g').attr('class', 'axis-x').call(xAxis);
  svg.append('g').attr('class', 'axis-y').call(yAxis);

  svg.append('g')
    .attr('class', 'circles')
    .selectAll('circle')
    .data(data)
    .enter().append('circle')
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', 4);

  svg.append('g')
    .attr('class', 'text')
    .selectAll('text')
    .data(data)
    .enter().append('text')
    .attr('x', d => x(d.x))
    .attr('y', d => y(d.y))
    .text(d => d.name)
    .call(dodge);
}

export function drawLines(id, widthMain, heightMain) {
  const svg = makeSVG(id, widthMain, heightMain);

  const
    margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = widthMain - margin.left - margin.right,
    height = heightMain - margin.top - margin.bottom;

  const num = 16; // The number of datapoints

  const xScale = d3.scaleLinear()
    .domain([0, num - 1])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  const line = d3.line()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const dataset = d3.range(num).map(() => { return { 'y': d3.randomUniform(1)() }; });

  svg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .call(d3.axisLeft(yScale));

  svg.append('path')
    .datum(dataset)
    .attr('class', 'line')
    .attr('d', line);

  svg.append('g').attr('class', 'dots').selectAll()
    .data(dataset)
    .enter().append('circle')
    .attr('cx', (d, i) => xScale(i))
    .attr('cy', (d) => yScale(d.y))
    .attr('r', 5);
}

export function drawMap(id, width, height, data, population) {
  const svg = makeSVG(id, width, height);
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

  const myChord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

  const chords = myChord(data);
  const ribbon = d3.ribbon().radius(innerRadius);

  const formatValue = d3.formatPrefix(',.0', 1e3);
  const color = d3.scaleOrdinal()
    .domain(d3.range(4))
    .range(['#000000', '#FFDD89', '#957244', '#F26223']);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);


  const group = svg.append('g')
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

  svg.append('g')
    .attr('fill-opacity', 0.67)
    .selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('d', ribbon)
    .attr('fill', d => color(d.target.index))
    .attr('stroke', d => d3.rgb(color(d.target.index)).darker());

}
