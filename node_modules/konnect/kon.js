#!/usr/bin/env node
"use strict";

var program = require('commander');

//commands
var list = require('./command/list');
var add = require('./command/add');
var rename = require('./command/rename');
var del = require('./command/delete');
var run = require('./command/run');
var search = require('./command/search');

program
  .version('1.0.0')
  .description('Quick way to run frequent and long commands')
  .usage('<name>');
program
  .command('*')
  .description('kon <name>')
  .action(function(env) {
    run.run(env);
  });
program
  .command('list')
  .description('list all commands')
  .action(function(env) {
    list.list();
  });
program
  .command('search <query>')
  .description('search by a query string')
  .action(function(env) {
    search.search(program.args[0]);
  });
program
  .command('add <name> <command> [keywords...]')
  .description('add a command')
  .action(function(env) {
    add.add(program.args[0], program.args[1], program.args[2]);
  });
program
  .command('rename <oldName> <newName>')
  .description('rename a command name')
  .action(function(env) {
    rename.rename(program.args[0], program.args[1]);
  });
program
  .command('change <name> <newCommand> [keywords...]')
  .description('change values by name')
  .action(function(env) {
    add.add(program.args[0], program.args[1], program.args[2]);
  });
program
  .command('delete <name>')
  .description('delete by name')
  .action(function(env) {
    del.del(program.args[0]);
  });

program
  .parse(process.argv);

program.allowUnknownOption = function(arg) {
    this._allowUnknownOption = arguments.length === 0 || arg;
    return this;
};
