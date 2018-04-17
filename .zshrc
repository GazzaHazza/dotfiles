# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH=/Users/garyhanks/.oh-my-zsh
export DOCKER_PASSWD_PATH=~/passwd

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="spaceship"

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion. Case
# sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"
HISTFILE=~/.zsh_history
# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git zsh-completions zsh-autosuggestions)
 autoload -U compinit && compinit

source $ZSH/oh-my-zsh.sh

# User configuration

source "/Users/garyhanks/.zsh-nvm/zsh-nvm.plugin.zsh"
source "/Users/garyhanks/.oh-my-zsh/custom/themes/spaceship.zsh-theme"
export HS_USER="garyhanks"
export EVERYTHING=/Users/garyhanks/Dev/everything
export PATH=/Users/garyhanks/bin:$PATH
# export PATH=$EVERYTHING/infrastructure/docker/bin:$PATH/

alias 'rake'='noglob rake'
alias 'ecd'='cd ~/Dev/everything'
alias 'ss'='ecd && cd apps/sites/supplier'
alias 'cs'='ecd && cd apps/sites/client'
alias 'su'='ecd && cd apps/sites/signup'
alias 'hrc'='ecd && cd packages/js/react-components'
alias 'hsw'='ecd && cd packages/js/webpack-config'
alias 'hsr'='ecd && cd packages/js/redux'
alias 'fe'='ecd && cd packages/js'
alias 'dcd'='ecd && cd deploy'
alias 'icd'='ecd && cd infrastructure'
alias 'ccd'='icd && cd chef'
alias 'tcd'='icd && cd terraform'
alias 'vcd'='icd && cd vagrant/apps'
alias 'legacy-up'='vcd && vagrant up legacy_site'
alias 'legacy-down'='vcd && vagrant halt legacy_site'
alias 'legacy-destroy'='vcd && vagrant destroy legacy_site'
alias 'legacy-ssh'='legacy-up && vagrant ssh legacy_site'
alias 'market-up'='vcd && vagrant up marketing_site'
alias 'market-down'='vcd && vagrant halt marketing_site'
alias 'market-destroy'='vcd && vagrant destroy marketing_site'
alias 'market-ssh'='market-up && vagrant ssh marketing_site'
alias 'stree'='open -a SourceTree'
alias 'zshconfig'="code ~/.zshrc"
alias 'hyperconfig'="code ~/.hyper.js"
alias 'hsp'="cd ~/Dev/hs-playground"
alias 'who-has-sandbox'='ssh -q legacy-site-01.apps.sandbox.hs tail -1 /srv/apps/sites/legacy/master/revisions.log'

SPACESHIP_PROMPT_ORDER=(user dir git exec_time jobs)
# USER
SPACESHIP_USER_PREFIX="" # remove `with` before username
SPACESHIP_USER_SUFFIX=":" # remove space before host
SPACESHIP_HOST_PREFIX="@:("
SPACESHIP_HOST_SUFFIX=") "
ssh-add

