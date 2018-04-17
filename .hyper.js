module.exports = {
  config: {
    fontSize: 13,
    fontFamily: '"Fira Mono for Powerline", "Roboto Mono for Powerline" , monospace',
    hypercwd: {
      initialWorkingDirectory: '~/Dev'
    }
  },
  
  plugins: [
    'hyper-blink',
    'hyperterm-cursor',
    'hypercwd',
    'hyperterm-paste',
    'hyperterm-dibdabs',
    'hyperterm-tabs',
    'hypermaterial-vibrancy'
  ]
};
