/* eslint-disable */
'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-2.7',
          bower: {
            dependencies: {
              'ember': '2.7.0'
            },
            resolutions: {
              'ember': '2.7.0'
            }
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-native-dom-event-dispatcher': null
            }
          }
        },
        {
          name: 'ember-lts-2.8',
          bower: {
            dependencies: {
              'ember': 'components/ember#lts-2-8'
            },
            resolutions: {
              'ember': 'lts-2-8'
            }
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-native-dom-event-dispatcher': null
            }
          }
        },
        {
          name: 'ember-2.9',
          bower: {
            dependencies: {
              'ember': '2.9.0'
            },
            resolutions: {
              'ember': '2.9.0'
            }
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-native-dom-event-dispatcher': null
            }
          }
        },
        {
          name: 'ember-2.10',
          bower: {
            dependencies: {
              'ember': '2.10.0'
            },
            resolutions: {
              'ember': '2.10.0'
            }
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-native-dom-event-dispatcher': null
            }
          }
        },
        {
          name: 'ember-2.11',
          bower: {
            dependencies: {
              'ember': '2.11.0'
            },
            resolutions: {
              'ember': '2.11.0'
            }
          },
          npm: {
            devDependencies: {
              'ember-source': null,
              'ember-native-dom-event-dispatcher': null
            }
          }
        },
        {
          name: 'ember-lts-2.12',
          npm: {
            devDependencies: {
              'ember-source': '~2.12.0',
              'ember-native-dom-event-dispatcher': null
            }
          }
        },
        {
          name: 'ember-lts-2.16',
          npm: {
            devDependencies: {
              'ember-source': '~2.16.0',
              'ember-native-dom-event-dispatcher': '^0.6.4'
            }
          }
        },
        {
          name: 'ember-lts-2.18',
          npm: {
            devDependencies: {
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        }
      ]
    };
  });
};
