import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';

export default class EventSelect extends React.PureComponent {
  render() {
    const options = [
      { value: "VIET", label: "Vietnam War" },
      { value: "UKRW", label: "Ukraine War" },
    ];

    return (
      <Select
        placeholder={'Select an event...'}
        components={makeAnimated}
        onBlurResetsInput={false}
        onSelectResetsInput={false}
        onCloseResetsInput={false}
        options={options}
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            neutral0: '#333',
            neutral5: 'orange',
            neutral10: '#666',
            neutral20: '#666',
            primary25: '#666',
            neutral50: '#eee',
            neutral80: 'white'
          }
        })}
        {...this.props}
      />);
  }
}
