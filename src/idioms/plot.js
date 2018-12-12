import * as d3 from 'd3';
import { createSVG } from '../helpers';

export default {
  draw: drawPlot,
  update: updatePlot,
};

const margin = { top: 10, right: 20, bottom: 20, left: 40 };

let plotSVG;
let svgDims;
let compareData;

export function drawPlot(id, width, height, data) {
  svgDims = { width, height };
  plotSVG = createSVG(id, { width, height }, margin);

  compareData = data;

  updatePlot();
}

export function updatePlot() {
  console.log('updating plot...');

  const
    width = svgDims.width - margin.left - margin.right,
    height = svgDims.height - margin.top - margin.bottom;

  const flatData = compareData.reduce((acc, d) => acc.concat(d), []);
  const getDomain = (dataset, fn) => [d3.min(dataset, fn), d3.max(dataset, fn)];

  const xScale = d3.scaleLinear()
    .domain(getDomain(flatData, d => d.x)).nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(getDomain(flatData, d => d.y)).nice()
    .range([height, 0]);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('~s'));

  // CLEAR OLD ELEMENTS

  plotSVG.selectAll('.circle').remove();

  // CREATE NEW ELEMENTS

  plotSVG.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  plotSVG.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  plotSVG.append('g')
    .attr('class', 'circles')
    .selectAll('circle')
    .data(compareData)
    .enter().append('circle')
    .attr('class', 'circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 4);

}
