
{exec} = require 'child_process'

task 'build', ->
  exec 'coffee -o lib -c src/*.coffee'

task 'clean', ->
  exec 'rm -r node_modules lib/*.js'

