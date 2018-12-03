import React from 'react';

export default class SVG extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { width, height } = this.props;
    const margin = this.props.margin || { left: 0, top: 0 };

    return (
      <svg {...this.props} width={width} height={height}>
        <g transform={`translate(${margin.left, margin.top})`}>
          {this.props.children}
        </g>
      </svg>
    );
  }
}
