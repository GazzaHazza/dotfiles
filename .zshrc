# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH=/Users/gbgadaha/.oh-my-zsh

HISTFILE=~/.zsh_history
# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ssh-add -K ~/.ssh/id_rsa
# Would you like to use another custom folder than $ZSH/custom?
ZSH_CUSTOM=~/.oh-my-zsh/custom

source $ZSH/oh-my-zsh.sh


alias 'zshconfig'="code ~/.zshrc"
alias 'legs'="cd ~/Dev/lego/lego-shop"
alias 'lego'="~/Dev/lego/dev-env/lego"
alias 'octan'="~/Dev/lego/octan"
alias 'moonbase'="~/Dev/lego/moonbase"

source ~/antigen.zsh

# Load the oh-my-zsh's library.
antigen use oh-my-zsh

# Bundles from the default repo (robbyrussell's oh-my-zsh).
antigen bundle git
antigen bundle yarn
antigen bundle xcp


# Syntax highlighting bundle.
antigen bundle zsh-users/zsh-syntax-highlighting
antigen bundle zsh-users/zsh-autosuggestions
antigen bundle zsh-completions
antigen bundle colorize

# Load the theme.
antigen theme denysdovhan/spaceship-prompt

# Tell Antigen that you're done.
antigen apply