import * as d3 from 'd3';
import { createSVG } from '../helpers';

export default {
  draw: drawPlot,
  update: updatePlot,
};

let plotSVG;

export function drawPlot(id, width, height, data) {
  plotSVG = createSVG(id, { width, height });
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

export function updatePlot(id, data) {

}
