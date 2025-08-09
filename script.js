// Modern Online Compiler with Judge0 API Integration
class CodeRunner {
    constructor() {
        this.editor = null;
        this.isExecuting = false;
        this.currentTheme = 'vs-light';
        
        // Judge0 API Configuration
        this.apiUrl = 'https://judge0-ce.p.rapidapi.com';
        this.apiKey = '06576e83e9msh766d1a4dc9f0c54p1b14b6jsndf09385283af'; // Your RapidAPI key
        
        // Language ID mappings for Judge0 API
        this.languageIds = {
            'python': 71,      // Python 3.8.1
            'javascript': 63,  // JavaScript (Node.js 12.14.0)
            'java': 62,       // Java (OpenJDK 13.0.1)
            'cpp': 54,        // C++ (GCC 9.2.0)
            'c': 50           // C (GCC 9.2.0)
        };
        
        // Code templates for different languages
        this.templates = {
            python: `# Python Code Example
print("Hello, World!")

# Calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

number = 5
result = factorial(number)
print(f"Factorial of {number} is {result}")

# Example with input handling
try:
    name = input("Enter your name: ")
    print(f"Hello, {name}!")
except EOFError:
    print("No input provided, using default name")
    print("Hello, User!")`,

            javascript: `// JavaScript Code Example
console.log("Hello, World!");

// Calculate factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

const number = 5;
const result = factorial(number);
console.log(\`Factorial of \${number} is \${result}\`);

// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    console.log(\`Hello, \${name}!\`);
    rl.close();
});`,

            java: `// Java Code Example
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Calculate factorial
        int number = 5;
        long result = factorial(number);
        System.out.println("Factorial of " + number + " is " + result);
        
        // Take user input
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
    
    public static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`,

            cpp: `// C++ Code Example
#include <iostream>
#include <string>
using namespace std;

// Function to calculate factorial
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    cout << "Hello, World!" << endl;
    
    // Calculate factorial
    int number = 5;
    long long result = factorial(number);
    cout << "Factorial of " << number << " is " << result << endl;
    
    // Take user input
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,

            c: `// C Code Example
#include <stdio.h>
#include <string.h>

// Function to calculate factorial
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("Hello, World!\\n");
    
    // Calculate factorial
    int number = 5;
    long long result = factorial(number);
    printf("Factorial of %d is %lld\\n", number, result);
    
    // Take user input
    char name[100];
    printf("Enter your name: ");
    if (fgets(name, sizeof(name), stdin)) {
        // Remove newline character
        name[strcspn(name, "\\n")] = 0;
        printf("Hello, %s!\\n", name);
    }
    
    return 0;
}`
        };
        
        this.init();
    }
    
    async init() {
        await this.initializeEditor();
        this.setupEventListeners();
        this.initializeTheme();
        this.showWelcomeMessage();
        
        // Test API connection on startup
        setTimeout(() => {
            this.testApiConnection();
        }, 2000); // Test after 2 seconds to let the interface load
    }
    
    async initializeEditor() {
        return new Promise((resolve) => {
            require.config({ 
                paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' }
            });
            
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('editor'), {
                    value: this.templates.python,
                    language: 'python',
                    theme: this.currentTheme,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
                    scrollBeyondLastLine: false,
                    roundedSelection: false,
                    renderLineHighlight: 'all',
                    renderIndentGuides: true,
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    mouseWheelZoom: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: true,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    bracketPairColorization: {
                        enabled: true
                    }
                });
                
                resolve();
            });
        });
    }
    
    setupEventListeners() {
        // Language selector
        document.getElementById('language').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
        
        // Editor theme selector
        document.getElementById('editor-theme').addEventListener('change', (e) => {
            this.changeEditorTheme(e.target.value);
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // Run button
        document.getElementById('run-btn').addEventListener('click', () => {
            this.executeCode();
        });
        
        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAll();
        });
        
        // Sample code button
        document.getElementById('sample-btn').addEventListener('click', () => {
            this.loadSampleCode();
        });
        
        // Sample input button
        document.getElementById('sample-input-btn').addEventListener('click', () => {
            this.loadSampleInput();
        });
        
        // Copy output button
        document.getElementById('copy-output').addEventListener('click', () => {
            this.copyOutput();
        });
        
        // Fullscreen button
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.executeCode();
            }
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearAll();
            }
        });
    }
    
    initializeTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('coderunner-theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }
    
    changeLanguage(language) {
        if (this.editor) {
            const model = this.editor.getModel();
            monaco.editor.setModelLanguage(model, language);
            
            // Show template loading animation
            this.showStatus('Loading template...', 'info');
            
            setTimeout(() => {
                this.editor.setValue(this.templates[language]);
                this.showStatus(`Switched to ${language.toUpperCase()}`, 'success');
            }, 300);
        }
    }
    
    changeEditorTheme(theme) {
        this.currentTheme = theme;
        if (this.editor) {
            monaco.editor.setTheme(theme);
        }
    }
    
    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        
        // Save preference
        localStorage.setItem('coderunner-theme', isDark ? 'dark' : 'light');
        
        // Update editor theme automatically
        if (isDark && this.currentTheme === 'vs-light') {
            this.changeEditorTheme('vs-dark');
            document.getElementById('editor-theme').value = 'vs-dark';
        } else if (!isDark && this.currentTheme === 'vs-dark') {
            this.changeEditorTheme('vs-light');
            document.getElementById('editor-theme').value = 'vs-light';
        }
    }
    
    // Test Judge0 API connection
    async testApiConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/about`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
                }
            });
            
            if (response.ok) {
                const result = await response.text();
                console.log('Judge0 API Connection Successful:', result);
                this.showNotification('Judge0 API connected successfully!', 'success');
                return true;
            } else {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Judge0 API Connection Failed:', error);
            this.showNotification('Judge0 API connection failed. Using simulation mode.', 'error');
            return false;
        }
    }
    
    async executeCode() {
        if (this.isExecuting) return;
        
        this.isExecuting = true;
        const code = this.editor.getValue();
        const language = document.getElementById('language').value;
        const input = document.getElementById('input').value;
        
        if (!code.trim()) {
            this.showNotification('Please write some code first!', 'error');
            this.isExecuting = false;
            return;
        }
        
        this.showLoadingState(true);
        this.showStatus('Submitting code to Judge0...', 'info');
        
        try {
            const startTime = Date.now();
            const result = await this.submitToJudge0(code, language, input);
            const executionTime = Date.now() - startTime;
            
            this.displayResult(result, executionTime);
        } catch (error) {
            console.error('Execution error:', error);
            this.showStatus('Execution failed', 'error');
            this.displayOutput(`Error: ${error.message}`, 'error');
            this.showNotification('Execution failed. Please try again.', 'error');
        } finally {
            this.showLoadingState(false);
            this.isExecuting = false;
        }
    }
    
    async submitToJudge0(code, language, input) {
        const languageId = this.languageIds[language];
        
        // Use simulation only if API key is not set
        if (this.apiKey === 'YOUR_RAPIDAPI_KEY') {
            return this.simulateExecution(code, language, input);
        }
        
        // Real Judge0 API integration
        this.showStatus('Submitting to Judge0 servers...', 'info');
        const submissionResponse = await fetch(`${this.apiUrl}/submissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: input || '',
                expected_output: null
            })
        });
        
        const submission = await submissionResponse.json();
        
        if (!submissionResponse.ok) {
            throw new Error(submission.message || 'Submission failed');
        }
        
        // Poll for result
        return await this.pollForResult(submission.token);
    }
    
    async pollForResult(token) {
        const maxAttempts = 30;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const response = await fetch(`${this.apiUrl}/submissions/${token}`, {
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
                }
            });
            
            const result = await response.json();
            
            if (result.status.id > 2) { // Completed (success or error)
                return result;
            }
            
            // Update status
            this.showStatus(`Executing... (${result.status.description})`, 'info');
            
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        throw new Error('Execution timeout');
    }
    
    // Simulation for demo purposes
    async simulateExecution(code, language, input) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let output = '';
                let stderr = '';
                const statusId = 3; // Accepted
                
                // Generate realistic output based on language and code
                if (code.includes('Hello, World!')) {
                    output += 'Hello, World!\n';
                }
                
                if (language === 'python' && code.includes('factorial')) {
                    output += 'Factorial of 5 is 120\n';
                }
                
                if (language === 'javascript' && code.includes('factorial')) {
                    output += 'Factorial of 5 is 120\n';
                }
                
                if ((language === 'java' || language === 'cpp' || language === 'c') && code.includes('factorial')) {
                    output += 'Factorial of 5 is 120\n';
                }
                
                if (code.includes('input') || code.includes('scanf') || code.includes('Scanner') || code.includes('getline')) {
                    if (input) {
                        output += `Hello, ${input.trim()}!\n`;
                    } else {
                        output += 'Hello, User!\n';
                    }
                }
                
                // Simulate syntax errors
                if (code.includes('syntax_error')) {
                    stderr = 'SyntaxError: invalid syntax\n';
                    return resolve({
                        status: { id: 6, description: 'Compilation Error' },
                        stdout: '',
                        stderr: stderr,
                        compile_output: stderr
                    });
                }
                
                if (!output) {
                    output = 'Program executed successfully (no output)';
                }
                
                resolve({
                    status: { id: statusId, description: 'Accepted' },
                    stdout: output,
                    stderr: '',
                    time: (Math.random() * 0.5 + 0.1).toFixed(3),
                    memory: Math.floor(Math.random() * 1000 + 500)
                });
            }, 1500 + Math.random() * 1000); // Random delay 1.5-2.5s
        });
    }
    
    displayResult(result, executionTime) {
        const statusEl = document.getElementById('status');
        const outputEl = document.getElementById('output');
        const timeEl = document.getElementById('execution-time');
        
        // Clear previous output
        outputEl.textContent = '';
        
        if (result.status.id === 3) { // Accepted
            const output = result.stdout || 'Program executed successfully (no output)';
            this.displayOutput(output, 'success');
            this.showStatus('✅ Execution completed successfully', 'success');
            timeEl.textContent = `⏱️ ${result.time || '0.1'}s • 💾 ${result.memory || 'N/A'}KB`;
            this.showNotification('Code executed successfully!', 'success');
        } else if (result.status.id === 6) { // Compilation Error
            const error = result.compile_output || result.stderr || 'Compilation failed';
            this.displayOutput(error, 'error');
            this.showStatus('❌ Compilation failed', 'error');
            timeEl.textContent = '';
        } else if (result.status.id === 5) { // Time Limit Exceeded
            this.displayOutput('Time Limit Exceeded', 'error');
            this.showStatus('⏰ Time limit exceeded', 'error');
            timeEl.textContent = '';
        } else if (result.status.id === 4) { // Wrong Answer
            const output = result.stdout || 'No output';
            this.displayOutput(output, 'warning');
            this.showStatus('⚠️ Wrong Answer', 'warning');
            timeEl.textContent = `⏱️ ${result.time || '0.1'}s`;
        } else {
            // Runtime Error or other errors
            let error = result.stderr || result.stdout || 'Runtime error occurred';
            
            // Provide helpful messages for common errors
            if (error.includes('EOFError') || error.includes('EOF when reading a line')) {
                error += '\n\n💡 Tip: This error occurs when your program expects input but none was provided.\n' +
                         'Try adding input in the "Program Input" section below the code editor,\n' +
                         'or modify your code to handle cases when no input is available.';
            }
            
            this.displayOutput(error, 'error');
            this.showStatus(`❌ ${result.status.description}`, 'error');
            timeEl.textContent = '';
        }
    }
    
    displayOutput(text, type = 'success') {
        const outputEl = document.getElementById('output');
        outputEl.textContent = text;
        outputEl.className = `bg-gray-900 dark:bg-black p-4 rounded-lg h-96 lg:h-[500px] overflow-auto font-mono text-sm whitespace-pre-wrap`;
        
        if (type === 'success') {
            outputEl.classList.add('text-green-400');
        } else if (type === 'error') {
            outputEl.classList.add('text-red-400');
        } else if (type === 'warning') {
            outputEl.classList.add('text-yellow-400');
        }
        
        outputEl.classList.add('fade-in');
    }
    
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        
        // Remove existing status classes
        statusEl.classList.remove('status-success', 'status-error', 'status-warning');
        
        if (type === 'success') {
            statusEl.classList.add('status-success');
        } else if (type === 'error') {
            statusEl.classList.add('status-error');
        } else if (type === 'warning') {
            statusEl.classList.add('status-warning');
        }
    }
    
    showLoadingState(show) {
        const runBtn = document.getElementById('run-btn');
        const overlay = document.getElementById('loading-overlay');
        
        if (show) {
            runBtn.disabled = true;
            runBtn.innerHTML = '<div class="loading-spinner"></div> Executing...';
            overlay.classList.remove('hidden');
        } else {
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Run Code';
            overlay.classList.add('hidden');
        }
    }
    
    clearAll() {
        document.getElementById('output').textContent = 'Output cleared. Ready for next execution...';
        document.getElementById('input').value = '';
        document.getElementById('status').textContent = 'Ready to run your code';
        document.getElementById('execution-time').textContent = '';
        
        // Reset status styling
        const statusEl = document.getElementById('status');
        statusEl.classList.remove('status-success', 'status-error', 'status-warning');
        
        this.showNotification('Cleared successfully', 'success');
    }
    
    loadSampleCode() {
        const language = document.getElementById('language').value;
        this.editor.setValue(this.templates[language]);
        this.showNotification(`Loaded ${language} sample code`, 'success');
    }
    
    loadSampleInput() {
        const language = document.getElementById('language').value;
        const inputEl = document.getElementById('input');
        
        // Sample inputs for different languages
        const sampleInputs = {
            python: 'John Doe',
            javascript: 'Jane Smith',
            java: 'Alice Johnson',
            cpp: 'Bob Wilson',
            c: 'Charlie Brown'
        };
        
        inputEl.value = sampleInputs[language] || 'Sample User';
        this.showNotification('Added sample input for testing', 'success');
    }
    
    copyOutput() {
        const output = document.getElementById('output').textContent;
        if (output) {
            navigator.clipboard.writeText(output).then(() => {
                this.showNotification('Output copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy output', 'error');
            });
        }
    }
    
    toggleFullscreen() {
        const editorContainer = document.getElementById('editor').parentElement;
        
        if (!document.fullscreenElement) {
            editorContainer.requestFullscreen().then(() => {
                document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
            });
        } else {
            document.exitFullscreen().then(() => {
                document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
            });
        }
    }
    
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    showWelcomeMessage() {
        const output = `🚀 Welcome to CodeFlow - Modern Online Compiler!

✨ Features:
• Support for Python, JavaScript, Java, C++, and C
• Real-time syntax highlighting with Monaco Editor
• Live Judge0 API integration for secure code execution
• Dark/Light theme support
• Responsive design for all devices
• Keyboard shortcuts (Ctrl+Enter to run, Ctrl+L to clear)

🔧 How to use:
1. Select your programming language
2. Write or paste your code in the editor
3. Add input data in the "Program Input" section if your code uses input(), scanf(), cin, etc.
4. Click "Run Code" or press Ctrl+Enter
5. View results in the output panel

📝 Input Handling:
• If your code uses input() in Python, provide input in the input box
• For multiple inputs, put each value on a new line
• Use "Sample Input" button to add example input
• If you get EOFError, check that you've provided necessary input

💡 Pro Tips:
• Use the "Sample" button to load example code
• Try different editor themes from the dropdown
• Toggle between light and dark modes
• Copy output directly to clipboard
• API connection will be tested automatically

🌐 Status: Connected to Judge0 API for real code execution!

Ready to code? Select a language and start building! 🎯`;

        this.displayOutput(output, 'success');
        this.showStatus('Welcome! Ready to run your code', 'success');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeRunner();
});

