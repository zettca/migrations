import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';

export default class CountrySelect extends React.PureComponent {
  render() {
    const { countries } = this.props;
    const options = countries.sort((a, b) => a.label < b.label ? -1 : 1);

    return (
      <Select isMulti
        placeholder={'Select countries...'}
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
