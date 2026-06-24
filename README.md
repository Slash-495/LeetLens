<div align="center">
  <img src="public/icon128.png" alt="LeetLens Logo" width="128" />
  <h1>LeetLens</h1>
  <p><strong>Your AI-Powered Coding Assistant for LeetCode</strong></p>
</div>

LeetLens is a powerful Chrome Extension that integrates directly into LeetCode. It acts as your personal AI mentor, helping you understand complex algorithms, visualize execution traces, review your code, and intelligently compare your approach with optimal solutions.

## ✨ Features

- **Solution Review Engine**: Get instant, senior-engineer-level code reviews. Analyzes your solution for correctness, time/space complexity, edge cases, and provides suggestions for improvement.
- **Execution Trace Visualizer**: Watch your algorithm run step-by-step. Understand variable states, recursion trees, and loop iterations visually.
- **Intelligent Comparison**: Compare your specific code against the optimal approach (e.g., O(N²) Brute Force vs. O(N) Optimal). Understand the exact tradeoffs.
- **Concept Reinforcement & Learning Paths**: Identifies your weak spots and suggests what patterns to learn next based on your history.
- **Bring Your Own Key**: Use your preferred AI model! Connect your API key for Google Gemini, OpenAI, or OpenRouter.
- **Privacy-First & Secure**: Communicates with the AI securely from a background service worker to respect your privacy and bypass restrictive content security policies.

## 🚀 How to Install (Local Developer Mode)

Currently, LeetLens is not published on the Chrome Web Store, so you can easily install it directly from this repository!

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/Slash-495/LeetLens.git
   cd LeetLens
   ```

2. **Install Dependencies & Build**
   Ensure you have [Node.js](https://nodejs.org/) installed, then run:
   ```bash
   npm install
   npm run build
   ```
   *This will generate a `dist` folder containing the compiled extension.*

3. **Load into Chrome**
   - Open Google Chrome and go to `chrome://extensions/`
   - Turn on **"Developer mode"** (toggle switch in the top right corner).
   - Click the **"Load unpacked"** button in the top left.
   - Select the newly generated `dist` folder inside your `LeetLens` directory.

4. **Start Coding!**
   - Head over to [LeetCode](https://leetcode.com/problemset/) and open any problem.
   - Click the **LeetLens** floating button in the bottom right corner.
   - Go to Settings (⚙️ icon) to enter your AI API key (e.g., Google AI Studio).
   - Write some code and ask for a review!

## ⚙️ Setting Up Your API Key

To use LeetLens, you must provide your own API key. We recommend **Google Gemini** for lightning-fast, free-tier developer access.

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Open the LeetLens extension panel on LeetCode.
4. Click the **Settings (⚙️)** icon in the header.
5. Select "Gemini", paste your key, and click Save.

*Note: The free tier of Gemini API limits you to 15 requests per minute. If you exceed this, just wait 60 seconds!*

## 🛠️ Built With

- **React 18** & **TypeScript**
- **Vite** & **CRXJS Vite Plugin**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Framer Motion** (Animations)

## 🐛 Bug Reports & Feature Requests

Encountered an issue or have an idea for a cool new feature? 
Please [open an issue](https://github.com/Slash-495/LeetLens/issues) on this repository!

---
*Disclaimer: LeetLens is not affiliated with, maintained, authorized, endorsed, or sponsored by LeetCode.*
