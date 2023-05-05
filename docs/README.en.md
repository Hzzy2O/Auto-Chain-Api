# 💻 Auto-Chain-Api

<div>
  <a href="./README.md">中文</a> |
  <a href="./README.en.md">English</a>
</div>

An AutoGPT application interface based on Langchain, built using Node.js, TypeScript, and Express. It provides the ability to run AI autonomously and also provides access to tools such as file operations, search, code and command-line execution, generating images, and cloning Git repositories.

## 🛠️ Tools
File operations: Implement basic operations such as reading, writing, deleting, and searching files.
Search ability: Provides search functionality to retrieve the latest information from the Internet.
Code execution: Can execute code provided by the user, facilitating rapid testing and verification.
Execute command line: Supports command line operations to meet more needs.
Generate image: Generates images based on user requirements.
Clone Git repository: Facilitates quick access to Git repositories.

## 📋 Environment Requirements
Node.js v18 or higher version

## 🚀 Installation Steps
Clone the project to your local environment:

```bash
git clone https://github.com/Hzzy2O/Auto-Chain-Api.git
```

Enter the project directory:

```bash
cd Auto-Chain-Api
```

Install dependencies:

```bash
pnpm install
```

Start the project:

```bash
pnpm start
```

Build:

```bash
pnpm build
```

Create a .env file in the root directory of the project and set the relevant environment variables:
Refer to the instructions in .env.example for details

```bash
LANGCHAIN_API_KEY=your-langchain-api-key
PORT=3000
```

Start the development server with the following command:

```bash
pnpm run dev
```

## 📄 API Documentation
<span>
Please check out the
<a href="./wiki/api.en.md">API documentation</a>
for detailed interface information
</span>

## 🤝 Contribution
Welcome to submit Pull Request and Issue to improve and enhance the project together!

## 📝 License
This project is licensed under the MIT License.
