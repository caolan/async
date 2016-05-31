#!/usr/bin/env bash

# Slightly modified version of xyz that publishes from the build directory,
# rather than the root.

set -e

usage="
Usage: xyz [options]

Publish a new version of the npm package in the current working directory.
This involves updating the version number in package.json, committing this
change (along with any staged changes), tagging the commit, pushing to the
remote git repository, and finally publishing to the public npm registry.

Options:

-b --branch <name>
        Specify the branch from which new versions must be published.
        xyz aborts if run from any other branch to prevent accidental
        publication of feature branches. 'master' is assumed if this
        option is omitted.

-i --increment <level>
        Specify the level of the current version number to increment.
        Valid levels: 'major', 'minor', 'patch', 'premajor', 'preminor',
        'prepatch', and 'prerelease'. 'patch' is assumed if this option
        is omitted.

-m --message <template>
        Specify the format of the commit (and tag) message.
        'X.Y.Z' acts as a placeholder for the version number.
        'Version X.Y.Z' is assumed if this option is omitted.

-r --repo <repository>
        Specify the remote repository to which to 'git push'.
        The value must be either a URL or the name of a remote.
        The latter is not recommended: it relies on local state.
        'origin' is assumed if this option is omitted.

-s --script <path>
        Specify a script to be run after the confirmation prompt.
        It is passed VERSION and PREVIOUS_VERSION as environment
        variables. xyz aborts if the script's exit code is not 0.

-t --tag <template>
        Specify the format of the tag name. As with --message,
        'X.Y.Z' acts as a placeholder for the version number.
        'vX.Y.Z' is assumed if this option is omitted.

--dry-run
        Print the commands without evaluating them.

-v --version
        Print xyz's version number and exit.
"

# http://stackoverflow.com/a/246128/312785
path="${BASH_SOURCE[0]}"
while [ -h "$path" ] ; do
  dir="$(cd -P "$(dirname "$path")" && pwd)"
  path="$(readlink "$path")"
  [[ $path == /* ]] || path="$dir/$path"
done
dir="$(cd -P "$(dirname "$path")" && pwd)"

branch=master
increment=patch
message_template='Version X.Y.Z'
repo=origin
declare -a scripts
tag_template=vX.Y.Z
dry_run=false

while (($# > 0)) ; do
  option="$1"
  shift

  case "$option" in
    -h|--help)
      echo "$usage"
      exit
      ;;
    -v|--version)
      node -p "require('$dir/../package.json').version"
      exit
      ;;
    -b|--branch)    branch="$1"           ; shift ;;
    -i|--increment) increment="$1"        ; shift ;;
    -m|--message)   message_template="$1" ; shift ;;
    -r|--repo)      repo="$1"             ; shift ;;
    -s|--script)    scripts+=("$1")       ; shift ;;
    -t|--tag)       tag_template="$1"     ; shift ;;
    --dry-run)      dry_run=true          ;;
    *)
      echo "Unrecognized option $option" >&2
      exit 1
  esac
done

case "$increment" in
  major|minor|patch|premajor|preminor|prepatch|prerelease) ;;
  *) echo "Invalid --increment" >&2 ; exit 1 ;;
esac

[[ $(git rev-parse --abbrev-ref HEAD) == $branch ]] ||
  (echo "Current branch does not match specified --branch" >&2 ; exit 1)

git diff-files --quiet ||
  (echo "Working directory contains unstaged changes" >&2 ; exit 1)

name=$(node -p "require('./package.json').name" 2>/dev/null) ||
  (echo "Cannot read package name" >&2 ; exit 1)

version=$(node -p "require('./package.json').version" 2>/dev/null) ||
  (echo "Cannot read package version" >&2 ; exit 1)

next_version=$("$dir/../node_modules/.bin/semver" -i "$increment" "$version") ||
  (echo "Cannot increment version number" >&2 ; exit 1)

message="${message_template//X.Y.Z/$next_version}"
tag="${tag_template//X.Y.Z/$next_version}"

bold=$(tput bold)
reset=$(tput sgr0)
printf "Current version is ${bold}${version}${reset}. "
printf "Press [enter] to publish ${bold}${name}@${next_version}${reset}."
read -s # suppress user input
echo    # output \n since [enter] output was suppressed

run() {
  echo "$1"
  if [[ $dry_run == false ]] ; then
    eval "$1"
  fi
}

# Prune before running tests to catch dependencies that have been
# installed but not specified in the project's `package.json` file.

run "npm prune"
run "npm test"

for script in "${scripts[@]}" ; do
  [[ $script == /* ]] || script="$(pwd)/$script"
  run "VERSION=$next_version PREVIOUS_VERSION=$version '$script'"
done

inc() {
  if [[ -f "$1" ]] ; then
    run "node -e '$(echo "
      var o = require('./$1'); o.version = '$next_version';
      require('fs').writeFileSync('./$1', JSON.stringify(o, null, 2) + '\n');
    " | tr "'" '"' | tr -d "\n" | tr -s " " | sed -e "s/^ *//" -e "s/ *$//")'"
    run "git add '$1'"
  fi
}

inc package.json

run "git add --force *.json"

run "git commit --message '$message'"
run "git tag --annotate '$tag' --message '$message'"
run "git push '$repo' 'refs/heads/$branch' 'refs/tags/$tag'"

# npm publish is managed by the Makefile
