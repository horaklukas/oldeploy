# Old fashion Deploy

## Why

Because i still need deploy some projects over (s)ftp as simple as possible.

## Need it, let's install

```
npm i -g git+ssh://github.com/horaklukas/oldeploy.git
```

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

  Example of how could `.ftpconfig` look like

  ```
  {
     "localRoot": "/dist",
     "remoteRoot": "/domain/web/",
     "host": "my.server.cz"
  }

  ```

And now, **execute `oldeploy` at project root to start deploying**!