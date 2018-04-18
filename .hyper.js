module.exports = {
  config: {
    fontSize: 13,
    fontFamily: '"Fira Mono for Powerline", "Roboto Mono for Powerline" , monospace',
    hypercwd: {
      initialWorkingDirectory: '~/Dev'
    }
  },
  
  plugins: [
    'hyper-statusline',
    'hyper-blink',
    'hyperterm-cursor',
    'hypercwd',
    'hyperterm-paste',
    'hyperterm-dibdabs',
    'hyper-chesterish',
    'hyper-tabs-enhanced',
    'hyper-dark-scrollbar'
  ]
};
