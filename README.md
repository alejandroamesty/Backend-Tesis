# TESIS BACKEND

**TEAM NOTES:**

NOT FULLY IMPLEMENTED CONTENT

**Requirements:**

- Deno: deno 2.1.2
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
