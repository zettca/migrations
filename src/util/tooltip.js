import * as d3 from 'd3';
import './tooltip.css';

const tooltip = d3.select('body').append('div')
  .attr('id', 'tooltip')
  .style('visibility', 'hidden');

function mouseover(html = 'tooltip') {
  tooltip.style('visibility', 'visible');

  tooltip.html(html)
    .style('left', d3.event.pageX + 'px')
    .style('top', d3.event.pageY - 28 + 'px');
}

function mouseout() {
  tooltip.style('visibility', 'hidden');
}

function mousemove() {
  tooltip
    .style('left', d3.event.pageX + 10 + 'px')
    .style('top', d3.event.pageY + 'px');
}

export default {
  mouseover,
  mouseout,
  mousemove,
  tooltip,
};
