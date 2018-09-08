# Old fashion Deploy

## Why

Because i still need deploy some projects over (s)ftp as simple as possible.

## Need it, let's install

There two options:

* install it globally using one the commands below

    `npm i -g horaklukas/oldeploy`

    `npm i -g git+ssh://github.com/horaklukas/oldeploy.git`

    and execute it with `oldeploy` command

* or install it locally, using the same commands as above **but without `-g`** argument,
then add script definition to similar to below into `package.json`

    ```
    {
      "scripts": {
        "deploy": "oldeploy"
      }
    }
    ```
  and execute it with `npm run deploy` command.


## How to use it

Two JSON configuration files (usually presented at project root) are required

  * First is `.ftpauth`, which should be ignored
  for versioning since it contains sensitive information: **username** and **password** for
  connect to ftp of remote server.

  Content of `.ftpauth` should be similar to snippet below

  ```
  {
      "username": "user",
      "password": "my-pass"
  }

  ```

  * Second is `.ftpconfig`, it understands few configuration params

    * These are mandatory

      `host` - sftp server address.

      `remoteRoot` - server path for deploying, relative to server root.

      `localRoot` - folder containing content to deploy, relative to project root.


    * These are optional:

      `port` - sftp connection port, default value is `21`.
      
      `exclude` - List of file patterns to exclude from deploying, eg. `['*.less', 'node_modules/']`.

  Example of how could `.ftpconfig` look like

  ```
  {
     "localRoot": "/dist",
     "remoteRoot": "/domain/web/",
     "host": "my.server.cz"
  }

  ```

And now, **execute `oldeploy` at project root to start deploying**!