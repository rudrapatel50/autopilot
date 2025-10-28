# Git Autopilot

The AI-powered CLI that knows when your code is ready to push.

Autopilot watches your code, understands what you're building, and autonomously decides when to commit and push to GitHub. No more manual git commands—just code, and let AI handle the rest.

Unlike traditional git automation tools that blindly commit on every change, Autopilot uses intelligent decision-making to understand when your code is actually ready:

-   ✅ Feature complete, not mid-refactor
-   ✅ No syntax errors or broken code
-   ✅ Tests passing (if tests exist)
-   ✅ Clean, logical units of work

Designed for developers who want to stay in flow state and let AI handle the boring parts of version control.

## Installation

```bash
npm install -g @rudrapatel50/autopilot
```

## Features

✅ **Smart GitHub Connection** - Securely store your GitHub Personal Access Token  
✅ **Instant Repository Setup** - Create and initialize GitHub repos in seconds  
✅ **Manual Push** - Traditional commit and push when you want control  
🤖 **AI-Powered Auto-Push** - AI decides when your code is ready and pushes automatically  
🧠 **Intelligent Analysis** - Understands code completeness, not just file changes  
🎯 **Context-Aware Decisions** - Considers syntax, tests, patterns, and more  
⚡ **Multiple Modes** - From manual control to full autopilot

## Commands

### `autopilot connect`

Connect your GitHub account by providing a Personal Access Token (PAT).

```bash
autopilot connect
```

**What it does:**

-   Prompts for your GitHub Personal Access Token
-   Validates the token with GitHub API
-   Securely stores credentials in your system keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
-   Supports `GITHUB_TOKEN` environment variable as fallback
-   Only allows one connected account at a time

**Creating a GitHub Token:**

1. Go to: https://github.com/settings/tokens?type=beta
2. Click "Generate new token" (Fine-grained)
3. Configure your token:
    - **Token name**: `autopilot-cli` (or any name you prefer)
    - **Expiration**: 30 days, 90 days, or custom (recommended: 90 days)
    - **Repository access**: All repositories (or select specific ones)
4. **Required Permissions (under "Repository permissions")**:
    - **Administration**: Read and write _(required for creating repositories)_
    - **Contents**: Read and write _(required for pushing code)_
    - **Metadata**: Read-only _(automatically included)_
5. Click "Generate token" and copy it immediately
6. Run `autopilot connect` and paste your token

### `autopilot user`

Check which GitHub account is currently connected.

```bash
autopilot user
```

**What it does:**

-   Displays your connected GitHub username
-   Shows additional profile information (name, email if available)
-   Validates that your token is still valid

### `autopilot logout`

Disconnect your GitHub account and remove stored credentials.

```bash
autopilot logout
```

**What it does:**

-   Removes your stored GitHub token from the system keychain
-   Disconnects your current session
-   Requires running `autopilot connect` again to reconnect

**Use cases:**

-   Switching to a different GitHub account
-   Revoking access when done with a project
-   Security best practice when sharing a machine

### `autopilot init`

Initialize a git repository and create it on GitHub.

```bash
autopilot init
```

**What it does:**

-   Checks if you're authenticated (prompts to run `autopilot connect` if not)
-   Verifies Git is installed on your system
-   Initializes a git repository if not already initialized
-   Sets default branch to `main`
-   Optionally creates `.gitignore` and `README.md`
-   Creates an initial commit
-   Prompts to create a new GitHub repository
-   Configures the remote origin
-   Pushes your code to GitHub

**Interactive prompts:**

-   Repository name (defaults to current folder name)
-   Repository description (optional)
-   Public or private repository
-   Create initial files (.gitignore, README.md)

**Example workflow:**

```bash
cd my-new-project
autopilot init
# Follow the prompts, and your project is live on GitHub!
```

### `autopilot push`

Commit and push your changes to GitHub.

```bash
autopilot push
```

**What it does:**

-   Checks authentication and Git installation
-   Verifies you're in a git repository with a remote
-   Shows what files have changed
-   Prompts for a commit message
-   Stages all changes
-   Creates a commit
-   Pushes to your remote repository

**Features:**

-   Smart error handling for common push issues
-   Shows preview of changed files
-   Detects and handles missing upstream branches
-   Handles diverged branch scenarios
-   Default commit message with timestamp if needed

**Example:**

```bash
# Interactive mode (prompts for message)
autopilot push
```

### `autopilot watch` (Coming Soon)

Let AI decide when your code is ready to push.

```bash
autopilot watch              # Basic watch mode (manual confirmation)
autopilot watch --ai         # AI-powered decisions
autopilot watch --ai --auto  # Full autopilot (no confirmation)
```

**How it works:**

Autopilot continuously monitors your code and intelligently decides when to commit and push:

1. **Watches for changes** - Detects file modifications in real-time
2. **Analyzes code state** - Checks syntax, tests, patterns, and completeness
3. **Makes smart decisions** - AI determines if code is ready to push
4. **Auto-commits & pushes** - Creates meaningful commits and pushes to GitHub

**What AI considers:**

-   ✅ Code completeness (no half-finished functions)
-   ✅ Syntax validation (no errors)
-   ✅ Test status (passing if tests exist)
-   ✅ Change patterns (logical units of work)
-   ✅ Time-based signals (user stopped typing)
-   ✅ Content analysis (no WIP comments, debug code)

**Modes:**

-   `autopilot watch` - **Confirm mode**: AI suggests, you approve (recommended to start)
-   `autopilot watch --ai` - **Smart mode**: AI decides, but asks for high-risk changes
-   `autopilot watch --ai --auto` - **Full autopilot**: AI decides and pushes automatically

**Safety features:**

-   Never pushes syntax errors or broken code
-   Detects when you're actively typing and waits
-   Allows manual override and undo
-   Learns from your corrections over time

### `autopilot --help`

Display help information for all available commands.

```bash
autopilot --help
```

### `autopilot --version`

Show the current version of Autopilot.

```bash
autopilot --version
```

## Quick Start

1. **Install Autopilot**

    ```bash
    npm install -g @rudrapatel50/autopilot
    ```

2. **Connect your GitHub account**

    ```bash
    autopilot connect
    ```

3. **Verify your connection**

    ```bash
    autopilot user
    ```

4. **Initialize a repository**

    ```bash
    cd your-project
    autopilot init
    ```

5. **Start coding and let AI autopilot** (Coming Soon)

    ```bash
    autopilot watch --ai
    # Now just code - AI will handle commits and pushes!
    ```

6. **Or push manually when you want**

    ```bash
    autopilot push
    ```

## How It Works

### Secure Credential Storage

Autopilot uses `@napi-rs/keyring` to securely store your GitHub token in your operating system's native credential manager:

-   **macOS**: Keychain
-   **Windows**: Credential Manager
-   **Linux**: Secret Service API (libsecret)

Your token is never stored in plain text files, ensuring your credentials remain secure.

### Token Validation

When you connect, Autopilot validates your token by making a request to GitHub's API (`GET /user`). This ensures:

-   The token is valid and active
-   You have the necessary permissions
-   We can retrieve your GitHub username for display

### AI-Powered Decision Making

Autopilot uses a hybrid approach combining rule-based logic and AI to decide when code is ready to push:

#### Phase 1: Rule-Based Analysis (Fast & Free)

-   **Syntax validation**: Checks for code errors
-   **Pattern detection**: Looks for WIP comments, debug code, TODOs
-   **Temporal signals**: Monitors typing activity and change frequency
-   **Git state**: Validates repository status and conflicts
-   **Basic heuristics**: Applies common-sense rules about code readiness

#### Phase 2: User Pattern Learning

-   **Behavioral analysis**: Learns from your manual commits
-   **Profile building**: Understands your commit patterns and preferences
-   **Prediction**: Estimates if you would commit based on history

#### Phase 3: AI Semantic Analysis (When Needed)

For ambiguous cases, AI performs deep code understanding:

-   **Code completeness**: Detects unfinished functions, missing error handling
-   **Logical units**: Determines if changes form a coherent feature/fix
-   **Context awareness**: Understands the "why" behind changes
-   **Commit message generation**: Creates meaningful, conventional commits

#### Hybrid Decision Process

1. Quick rule checks catch obvious cases (free, instant)
2. Pattern matching predicts your likely decision (fast, learned)
3. AI analysis for complex cases (slower, smarter)
4. Combined confidence score determines action

**Result**: Fast decisions for clear cases, smart AI for tricky ones, keeping costs low and speed high.

## Development

### Prerequisites

-   Node.js 16+
-   npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/rudrapatel50/autopilot.git
cd autopilot

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link
```

### Project Structure

```
autopilot/
├── src/
│   ├── cli.ts              # CLI entry point and command registration
│   ├── commands/
│   │   ├── connect.ts      # GitHub connection logic
│   │   ├── init.ts         # Repository initialization
│   │   ├── logout.ts       # Logout and credential removal
│   │   ├── push.ts         # Commit and push changes
│   │   ├── user.ts         # User info display
│   │   └── watch.ts        # AI-powered watch mode (coming soon)
│   └── lib/
│       ├── cerds.ts        # Credential management (keyring)
│       ├── git.ts          # Git command utilities
│       ├── github.ts       # GitHub API interactions
│       ├── analyzer.ts     # Code analysis and decision logic (coming soon)
│       └── ai.ts           # AI integration (coming soon)
├── package.json
├── tsconfig.json
└── README.md
```

### Technologies Used

-   **TypeScript** - Type-safe development
-   **Commander.js** - CLI framework and command parsing
-   **@napi-rs/keyring** - Cross-platform secure credential storage
-   **axios** - HTTP client for GitHub API
-   **prompts** - Interactive CLI prompts
-   **chalk** - Terminal styling and colors
-   **chokidar** - File system watching (coming soon)
-   **OpenAI/Anthropic** - AI decision making (coming soon)

## Roadmap

### ✅ Completed

-   [x] GitHub authentication with PAT
-   [x] Secure credential storage
-   [x] User connection status
-   [x] Logout and credential management
-   [x] Repository initialization (`autopilot init`)
-   [x] Manual commit and push (`autopilot push`)

### 🚧 In Progress

-   [ ] **Watch mode with file monitoring** (`autopilot watch`)
-   [ ] **Rule-based decision logic** (syntax checks, pattern detection)
-   [ ] **AI-powered push decisions** (semantic code understanding)
-   [ ] **User pattern learning** (behavioral analysis)

### 🔮 Future

-   [ ] Configuration file support
-   [ ] Multiple AI provider support (OpenAI, Anthropic, local models)
-   [ ] Commit history analysis and learning
-   [ ] Team/workspace profiles
-   [ ] Multiple account support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Author

Rudra Patel ([@rudrapatel50](https://github.com/rudrapatel50))
