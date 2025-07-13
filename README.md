# Interactive Linked List Animator

An interactive, educational web application for visualizing Singly and Doubly Linked List operations. This tool is designed to help students of "010153523 Algorithms and Data Structures" at KMUTNB understand data structures in a more intuitive way.

**[Live Demo](https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/)** (Replace with your GitHub Pages URL after deployment)

## Features

- **Dual List Types**: Switch seamlessly between Singly and Doubly Linked Lists.
- **Visual Animation**: Watch nodes and pointers move with step-by-step animations for each operation.
- **Manual Controls**: Step forward, backward, or finish the animation at your own pace.
- **Textbook-Aligned Code**: View textbook-style Java code that highlights in sync with the visual animation.
- **AI-Powered Explanations**: Get clear, concise explanations for each operation, powered by the Google Gemini API.
- **Responsive Design**: Works on both desktop and mobile devices.

## Operations Supported

- `addFirst(value)`
- `addLast(value)`
- `removeFirst()`
- `removeLast()`
- `search(value)`

## Deployment to GitHub Pages

This project is configured for automated deployment to GitHub Pages using GitHub Actions.

1.  **Create a Repository**: Create a new public repository on your GitHub account.
2.  **Push Code**: Add your files (including the `.github/workflows/deploy.yml` file) and push them to the `main` branch of your new repository.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git # Replace with your repo URL
    git push -u origin main
    ```
3.  **Configure GitHub Pages**:
    - In your repository, go to **Settings** > **Pages**.
    - Under "Build and deployment", set the **Source** to **GitHub Actions**.
4.  **Done!**: The workflow will now run automatically on every push to `main`. Wait a few minutes for the first deployment to complete. Your live site will be available at the URL shown in the Pages settings. Remember to update the "Live Demo" link in this README!

## Local Development

1.  Clone the repository.
2.  Make sure you have a `process.env.API_KEY` set up for the Gemini API. For a simple local test without a build process, you can use a live server extension in your editor (like VS Code's Live Server) and temporarily replace `process.env.API_KEY` in `services/geminiService.ts` with your actual key for testing purposes. **Do not commit your API key to your repository.**