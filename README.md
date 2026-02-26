diff --git a/README.md b/README.md
index 70b7c82ad5fc3a2674f8af6ebd0861f5c4d90185..08af0fa8490bb3aa0f4fd6add59fcac27b26e3a3 100644
--- a/README.md
+++ b/README.md
@@ -49,25 +49,42 @@ npm run dev
 - Select the "Codespaces" tab.
 - Click on "New codespace" to launch a new Codespace environment.
 - Edit files directly within the Codespace and commit and push your changes once you're done.
 
 ## What technologies are used for this project?
 
 This project is built with:
 
 - Vite
 - TypeScript
 - React
 - shadcn-ui
 - Tailwind CSS
 
 ## How can I deploy this project?
 
 
 
 Yes, you can!
 
 
+
+## Judge0 setup for running code snippets
+
+The `Run Code` button in snippet cards uses Judge0.
+
+Optional environment variables:
+
+```sh
+# direct Judge0 CE endpoint (default already used in code)
+VITE_JUDGE0_BASE_URL="https://ce.judge0.com"
+
+# only needed when using Judge0 via RapidAPI
+VITE_JUDGE0_RAPIDAPI_KEY="<your-rapidapi-key>"
+VITE_JUDGE0_RAPIDAPI_HOST="judge0-ce.p.rapidapi.com"
+```
+
+If your provider requires API headers and these values are missing, running code will show an explanatory error in the snippet output panel.
