# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH=/Users/gbgadaha/.oh-my-zsh
source "/Users/gbgadaha/.oh-my-zsh/custom/themes/spaceship.zsh-theme"

HISTFILE=~/.zsh_history
# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="spaceship"
ssh-add -K ~/.ssh/id_rsa
# Would you like to use another custom folder than $ZSH/custom?
ZSH_CUSTOM=~/.oh-my-zsh/custom

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(cp yarn git zsh-completions colorize zsh-autosuggestions)
autoload -U compinit && compinit

source $ZSH/oh-my-zsh.sh

alias 'stree'='open -a SourceTree'
alias 'zshconfig'="code ~/.zshrc"
alias 'hyperconfig'="code ~/.hyper.js"
alias 'legs'="cd ~/Dev/lego/lego-shop"
alias 'lego'="~/Dev/lego/dev-env/lego"
alias 'octan'="~/Dev/lego/octan"
alias 'moonbase'="~/Dev/lego/moonbase"
eval $(thefuck --alias)

# alias ohmyzsh="mate ~/.oh-my-zsh"
###-begin-pm2-completion-###
### credits to npm for the completion file model
#
# Installation: pm2 completion >> ~/.bashrc  (or ~/.zshrc)
#

COMP_WORDBREAKS=${COMP_WORDBREAKS/=/}
COMP_WORDBREAKS=${COMP_WORDBREAKS/@/}
export COMP_WORDBREAKS

if type complete &>/dev/null; then
  _pm2_completion () {
    local si="$IFS"
    IFS=$'\n' COMPREPLY=($(COMP_CWORD="$COMP_CWORD" \
                           COMP_LINE="$COMP_LINE" \
                           COMP_POINT="$COMP_POINT" \
                           pm2 completion -- "${COMP_WORDS[@]}" \
                           2>/dev/null)) || return $?
    IFS="$si"
  }
  complete -o default -F _pm2_completion pm2
elif type compctl &>/dev/null; then
  _pm2_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    let cword-=1
    read -l line
    read -ln point
    si="$IFS"
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       pm2 completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K _pm2_completion + -f + pm2
fi
###-end-pm2-completion-###

# tabtab source for serverless package
# uninstall by removing these lines or running `tabtab uninstall serverless`
[[ -f /Users/gbgadaha/.config/yarn/global/node_modules/tabtab/.completions/serverless.zsh ]] && . /Users/gbgadaha/.config/yarn/global/node_modules/tabtab/.completions/serverless.zsh
# tabtab source for sls package
# uninstall by removing these lines or running `tabtab uninstall sls`
[[ -f /Users/gbgadaha/.config/yarn/global/node_modules/tabtab/.completions/sls.zsh ]] && . /Users/gbgadaha/.config/yarn/global/node_modules/tabtab/.completions/sls.zsh
# tabtab source for slss package
# uninstall by removing these lines or running `tabtab uninstall slss`
[[ -f /Users/gbgadaha/.config/yarn/global/node_modules/tabtab/.completions/slss.zsh ]] && . /Users/gbgadaha/.config/yarn/global/node_modules/tabtab/.completions/slss.zsh