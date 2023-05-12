# Konnect
Quick way to run frequent and long linux or OSX commands.

**Problem:** Things like SSH may have domain name or IP address with location to key, are difficult to remember and long to type.

**Solution:** Store them under a simple name and run them frequently using **Konnect**.  

##Install
```bash
$ npm install konnect -g
```

##Options
```bash
  Usage: kon <name>


  Commands:

    *                                   kon <name>
    add <name> <command> [keywords...]  add a command
    list                                list all commands
    search <query>                      search by a query string
    rename <oldName> <newName>          rename a command name
    change <name> <newCommand> [keywords...]      change values by name
    delete <name>                       delete by name

  Quick way to run frequent and long commands

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

##Usage

###Run
```bash
$ kon BD
```

###Add
Add a command

```bash
$ kon add BD "ssh -tti /path/to/key.pem ubuntu@xx.xx.xx.xx" shh api server aws

Result:
Command successfully added
```

###List
List all names, commands and keywords

```bash
$ kon list

Result:

Name			Command												                    Keywords

BD				ssh -tti /path/to/key.pem ubuntu@xx.xx.xx.xx			shh,api,server,aws
LD				ssh -tti /path/to/key.pem ubuntu@xx.xx.xx.xx			shh,admin,server,aws

```

###Search
Search with a word

```bash
$ kon search api

Result:

Name			Command												                    Keywords

BD				ssh -tti /path/to/key.pem ubuntu@xx.xx.xx.xx			shh,api,server,aws

```

###Rename

```bash
$ kon rename BD GB

Result:

BD successfully renamed to GB

```

###Change
Change values by name

```bash
$ kon change BD "ssh -tti /path/to/key.pem ubuntu@xx.xx.xx.xx" shh api server aws

Result:

Command successfully added

```

###Delete
Delete an item by name

```bash
$ kon delete BD

Result:

BD successfully deleted

```
