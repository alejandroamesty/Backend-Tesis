# TESIS BACKEND

**TEAM NOTES:**

NOT FULLY IMPLEMENTED CONTENT

**Requirements:**

- Deno: deno 2.1.4
- Recommended: Deno extension in vscode:
  https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno&ssr=false#review-details
  or install using command palette (Ctrl + P) and paste:
  ```CommandPalette
  ext install denoland.vscode-deno
  ```

**Installing:**

```bash
deno install
```

**Configuring** This backend server comes with its own database and seeders, to run them (make sure
you have all env variables) run:

```bash
deno run migrate
```

**Deploying**

- Run with Watcher

  ```bash
  deno run dev
  ```

  Run normally (deploy)
- ```bash
  deno run start
  ```
- Format the project

  ```bash
  deno fmt
  ```
  This command will format the entire project using fmt configuration inside of deno.json

**Testing**

  You can do integrations, unit and stress testing on this app, to do it, run:

  ```bash
  deno test -A --filter="{param}"
  ```
  where param can be the names of the modules, the name of the test type or the name of the routes itself. Examples:

  ```bash
  deno test -A --filter="integrations"
  deno test -A --filter="integrations: auth"
  deno test -A --filter="register"
  deno test -A --filter="stress"
  deno test -A --filter="unit"
  ```

  How it works? all of the test use a format to give them "context", the format is: {test type}: {module} - {route} - {action}
  if you want for example a route, the filter could be ": {module} - {route}" to assure the route
