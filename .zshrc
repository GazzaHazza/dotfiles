HISTFILE=~/.zsh_history
export ZSH=/Users/gary.hanks/.oh-my-zsh
# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ssh-add -K ~/.ssh/id_rsa
# Would you like to use another custom folder than $ZSH/custom?
export ZSH_CUSTOM=~/.oh-my-zsh/custom

source $ZSH/oh-my-zsh.sh
export PATH="$PATH:/Users/gary.hanks/code/hs/router/bin"
export PATH="$PATH:/Users/gary.hanks/code/hs/legacy-site/bin"
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export NPM_TOKEN=d03d421b7d8eab0cd9a613d2fb13243c7ede87f0

export HS_EVERYTHING_PATH="$HOME/code/hs/everything"


alias 'zshconfig'="code ~/.zshrc"
alias 'DOBR'="git remote prune origin && git branch -vv | grep 'origin/.*: gone]' | awk '{print $1}' | xargs git branch -d"

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
# antigen bundle gretzky/n.zsh
antigen bundle Seinh/git-prune
antigen bundle psprint/zsh-navigation-tools
antigen bundle desyncr/auto-ls

# Load the theme.
antigen theme denysdovhan/spaceship-prompt

# Tell Antigen that you're done.
antigen apply 
