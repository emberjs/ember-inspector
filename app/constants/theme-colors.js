export const LightTheme = {
  base00: '#ffffff',
  base01: '#f3f3f3',
  base03: '#ededed',
  base05: '#dedede',
  base06: '#d1d1d1',
  base07: '#cccccc',
  base08: '#cacaca',
  base10: '#b4b4b4',
  base11: '#b3b3b3',
  base12: '#b2b2b2',
  base13: '#aaaaaa',
  base14: '#a3a3a3',
  base15: '#999999',
  base16: '#888888',
  base17: '#777777',
  base18: '#737373',
  base19: '#6e6e6e',
  base20: '#676767',
  base21: '#555555',
  base22: '#505050',
  base23: '#444444',
  base24: '#404040',
  base25: '#3d3d3d',
  base26: '#333333',
  base27: '#303030',
  base28: '#222222',
  base29: '#000000',
  base30: '#bcbcbc',
  base31: '#464646',
  base32: '#d6d6d6',
  base33: '#666666',
  base34: '#cecece',
  base35: '#f5f5f5',
  base36: '#e7e7e7',
  spec00: '#fffec2',
  spec01: '#ffffee',
  spec02: '#ff0000',
  spec03: '#f23818',
  spec04: '#990099',
  spec05: '#990000',
  spec06: '#6e68c6',
  spec07: '#4281eb',
  spec08: '#3879d9',
  spec09: '#2b7fb3',
  spec10: '#000099',
  spec11: '#3F81EE',
};

const themeKeys = Object.keys(LightTheme);

const customDarkThemeColors = {
  base00: '#242424',
  base01: '#242424',
};

export const DarkTheme = themeKeys.reduce((all, key) => {
  const color = LightTheme[key].toLowerCase();
  const customColor = customDarkThemeColors[key];

  all[key] = customColor || invertColor(color);

  return all;
}, {});

function invertColor(color) {
  const isHex = color.includes('#');
  const hex = '0123456789ABCDEF';
  const hexArray = hex.split('');
  const reversedHexArray = hexArray.map(x => x).reverse();

  if (isHex) {
    const chars = color.split('');
    let invertedColor;

    chars.shift(); //remove #
    invertedColor = chars.map(char => {
      const index = hexArray.indexOf(char.toUpperCase());

      return reversedHexArray[index];
    });

    return `#${invertedColor.join('')}`;
  } else {
    return color;
  }
}
