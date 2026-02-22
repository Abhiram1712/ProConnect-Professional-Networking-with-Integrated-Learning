import React, { useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
    Play, Square, RotateCcw, Copy, Download, Check,
    Terminal, Clock, Cpu, ChevronDown, ChevronUp, Settings,
    Maximize2, Minimize2, Loader
} from 'lucide-react';
import { toast } from 'react-toastify';
import './CodeEditor.css';

const API = 'http://localhost:5000/api';

const LANGUAGES = [
    { id: 'javascript', label: 'JavaScript', icon: '🟨', monacoId: 'javascript' },
    { id: 'python', label: 'Python', icon: '🐍', monacoId: 'python' },
    { id: 'java', label: 'Java', icon: '☕', monacoId: 'java' },
    { id: 'cpp', label: 'C++', icon: '⚙️', monacoId: 'cpp' },
    { id: 'c', label: 'C', icon: '🔧', monacoId: 'c' },
    { id: 'typescript', label: 'TypeScript', icon: '🔷', monacoId: 'typescript' },
    { id: 'go', label: 'Go', icon: '🐹', monacoId: 'go' },
    { id: 'rust', label: 'Rust', icon: '🦀', monacoId: 'rust' },
    { id: 'csharp', label: 'C#', icon: '💜', monacoId: 'csharp' },
    { id: 'ruby', label: 'Ruby', icon: '💎', monacoId: 'ruby' },
    { id: 'php', label: 'PHP', icon: '🐘', monacoId: 'php' },
    { id: 'kotlin', label: 'Kotlin', icon: '🟣', monacoId: 'kotlin' },
    { id: 'swift', label: 'Swift', icon: '🧡', monacoId: 'swift' },
];

const CODE_SNIPPETS = {
    javascript: `// JavaScript (Node.js)
const readline = require('readline');

// Example: Read input and process
console.log("Hello, JavaScript!");

// Array operations
const nums = [1, 2, 3, 4, 5];
const sum = nums.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
`,
    python: `# Python 3
# Example: Basic operations

print("Hello, Python!")

# List comprehension
nums = [1, 2, 3, 4, 5]
squares = [x**2 for x in nums]
print("Squares:", squares)
print("Sum:", sum(nums))
`,
    java: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        
        // Array operations
        int[] nums = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : nums) sum += n;
        System.out.println("Sum: " + sum);
    }
}
`,
    cpp: `// C++
#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    
    vector<int> nums = {1, 2, 3, 4, 5};
    int sum = accumulate(nums.begin(), nums.end(), 0);
    cout << "Sum: " << sum << endl;
    
    return 0;
}
`,
    c: `// C
#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    
    int nums[] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) sum += nums[i];
    printf("Sum: %d\\n", sum);
    
    return 0;
}
`,
    typescript: `// TypeScript
const greet = (name: string): string => {
    return \`Hello, \${name}!\`;
};

console.log(greet("TypeScript"));

const nums: number[] = [1, 2, 3, 4, 5];
const sum: number = nums.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);
`,
    go: `// Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
    
    nums := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, n := range nums {
        sum += n
    }
    fmt.Println("Sum:", sum)
}
`,
    rust: `// Rust
fn main() {
    println!("Hello, Rust!");
    
    let nums = vec![1, 2, 3, 4, 5];
    let sum: i32 = nums.iter().sum();
    println!("Sum: {}", sum);
}
`,
    csharp: `// C#
using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello, C#!");
        
        int[] nums = {1, 2, 3, 4, 5};
        Console.WriteLine("Sum: " + nums.Sum());
    }
}
`,
    ruby: `# Ruby
puts "Hello, Ruby!"

nums = [1, 2, 3, 4, 5]
puts "Sum: #{nums.sum}"
puts "Squares: #{nums.map { |x| x**2 }}"
`,
    php: `<?php
echo "Hello, PHP!\\n";

$nums = [1, 2, 3, 4, 5];
$sum = array_sum($nums);
echo "Sum: $sum\\n";
?>
`,
    kotlin: `// Kotlin
fun main() {
    println("Hello, Kotlin!")
    
    val nums = listOf(1, 2, 3, 4, 5)
    println("Sum: \${nums.sum()}")
}
`,
    swift: `// Swift
print("Hello, Swift!")

let nums = [1, 2, 3, 4, 5]
let sum = nums.reduce(0, +)
print("Sum: \\(sum)")
`,
};

const CodeEditor = ({ defaultLanguage = "javascript" }) => {
    const [language, setLanguage] = useState(defaultLanguage);
    const [code, setCode] = useState(CODE_SNIPPETS[defaultLanguage] || CODE_SNIPPETS.javascript);
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showStdin, setShowStdin] = useState(false);
    const [execStats, setExecStats] = useState(null);
    const [copied, setCopied] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const editorRef = useRef(null);

    const token = localStorage.getItem('token');

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(CODE_SNIPPETS[lang] || `// ${lang}\n`);
        setOutput('');
        setError(null);
        setExecStats(null);
    };

    const runCode = async () => {
        if (!code.trim()) {
            toast.warning('Please write some code first!');
            return;
        }

        setIsLoading(true);
        setOutput('');
        setError(null);
        setExecStats(null);

        // JavaScript: can run locally in browser as fallback
        if (language === 'javascript' && !token) {
            runJSLocally();
            return;
        }

        if (!token) {
            toast.error('Please login to use the compiler');
            setIsLoading(false);
            return;
        }

        try {
            const startTime = Date.now();

            const res = await fetch(`${API}/compiler/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ code, language, stdin })
            });

            const data = await res.json();
            const clientTime = ((Date.now() - startTime) / 1000).toFixed(2);

            if (!res.ok) {
                setError(data.msg || 'Execution failed');
                setIsLoading(false);
                return;
            }

            // Process result based on status
            const statusId = data.status?.id;
            const statusDesc = data.status?.description;

            if (statusId === 3) {
                // Accepted — successful execution
                setOutput(data.stdout || '(No output)');
            } else if (statusId === 6) {
                // Compilation Error
                setError(`Compilation Error:\n${data.compile_output}`);
            } else if (statusId === 5) {
                // Time Limit Exceeded
                setError('⏱️ Time Limit Exceeded (5s). Your code took too long.');
            } else if (statusId >= 7 && statusId <= 12) {
                // Runtime errors
                setError(`Runtime Error (${statusDesc}):\n${data.stderr || data.compile_output || 'Unknown error'}`);
            } else {
                // Other statuses
                setError(data.stderr || data.compile_output || statusDesc || 'Unknown error');
            }

            setExecStats({
                time: data.time ? `${data.time}s` : clientTime + 's (client)',
                memory: data.memory ? `${(data.memory / 1024).toFixed(1)} MB` : '—',
                status: statusDesc || 'Unknown'
            });
        } catch (err) {
            console.error('Compiler error:', err);
            // Fallback for JS
            if (language === 'javascript') {
                runJSLocally();
                return;
            }
            setError('Failed to connect to compiler service. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const runJSLocally = () => {
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
            originalLog(...args);
        };

        try {
            // eslint-disable-next-line no-new-func
            new Function(code)();
            setOutput(logs.join('\n') || '(No output)');
            setExecStats({ time: '< 1ms', memory: '—', status: 'Accepted (local)' });
        } catch (execErr) {
            setError(execErr.toString());
            setExecStats({ time: '—', memory: '—', status: 'Error (local)' });
        } finally {
            console.log = originalLog;
            setIsLoading(false);
        }
    };

    const resetCode = () => {
        setCode(CODE_SNIPPETS[language] || `// ${language}\n`);
        setOutput('');
        setError(null);
        setExecStats(null);
        setStdin('');
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCode = () => {
        const extensions = {
            javascript: 'js', python: 'py', java: 'java', cpp: 'cpp', c: 'c',
            typescript: 'ts', go: 'go', rust: 'rs', csharp: 'cs', ruby: 'rb',
            php: 'php', kotlin: 'kt', swift: 'swift'
        };
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extensions[language] || 'txt'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const currentLang = LANGUAGES.find(l => l.id === language);

    return (
        <div className={`code-editor-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
            {/* ====== TOOLBAR ====== */}
            <div className="editor-toolbar">
                <div className="toolbar-left">
                    <div className="lang-selector">
                        <span className="lang-icon">{currentLang?.icon}</span>
                        <select value={language} onChange={handleLanguageChange} className="language-select">
                            {LANGUAGES.map(l => (
                                <option key={l.id} value={l.id}>{l.icon} {l.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="font-size-control">
                        <button onClick={() => setFontSize(s => Math.max(10, s - 1))} className="toolbar-btn-sm" title="Decrease font">A-</button>
                        <span className="font-size-label">{fontSize}px</span>
                        <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="toolbar-btn-sm" title="Increase font">A+</button>
                    </div>
                </div>

                <div className="toolbar-right">
                    <button className="toolbar-btn" onClick={() => setShowStdin(!showStdin)} title="Toggle Input (stdin)">
                        <Terminal size={15} />
                        <span>Input</span>
                        {showStdin ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    <button className="toolbar-btn" onClick={copyCode} title="Copy code">
                        {copied ? <Check size={15} color="#22c55e" /> : <Copy size={15} />}
                    </button>

                    <button className="toolbar-btn" onClick={downloadCode} title="Download code">
                        <Download size={15} />
                    </button>

                    <button className="toolbar-btn" onClick={resetCode} title="Reset code">
                        <RotateCcw size={15} />
                    </button>

                    <button className="toolbar-btn" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle fullscreen">
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    <button
                        className={`run-button ${isLoading ? 'loading' : ''}`}
                        onClick={runCode}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader size={16} className="spin-icon" /> Running...
                            </>
                        ) : (
                            <>
                                <Play size={16} /> Run Code
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ====== STDIN PANEL ====== */}
            {showStdin && (
                <div className="stdin-panel">
                    <div className="stdin-header">
                        <Terminal size={14} />
                        <span>Standard Input (stdin)</span>
                    </div>
                    <textarea
                        className="stdin-textarea"
                        value={stdin}
                        onChange={e => setStdin(e.target.value)}
                        placeholder="Enter input for your program here...&#10;(e.g., test data, space-separated values)"
                        rows={3}
                    />
                </div>
            )}

            {/* ====== EDITOR + OUTPUT ====== */}
            <div className="editor-main">
                <div className="editor-input">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={currentLang?.monacoId || language}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        onMount={handleEditorMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize,
                            scrollBeyondLastLine: false,
                            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                            fontLigatures: true,
                            renderLineHighlight: 'all',
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            bracketPairColorization: { enabled: true },
                            padding: { top: 12 },
                            suggest: { showWords: true },
                            wordWrap: 'on',
                        }}
                    />
                </div>

                <div className="editor-output">
                    <div className="output-header">
                        <h3>
                            <Terminal size={16} /> Output
                        </h3>
                        {execStats && (
                            <div className="exec-stats">
                                <span className={`status-indicator ${execStats.status.includes('Accepted') ? 'success' : 'error'}`}>
                                    {execStats.status}
                                </span>
                                <span className="stat-item">
                                    <Clock size={12} /> {execStats.time}
                                </span>
                                <span className="stat-item">
                                    <Cpu size={12} /> {execStats.memory}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={`output-console ${error ? 'error' : output ? 'success' : ''}`}>
                        {isLoading ? (
                            <div className="loading-output">
                                <Loader size={20} className="spin-icon" />
                                <span>Compiling and executing...</span>
                                <span className="loading-hint">This may take a few seconds</span>
                            </div>
                        ) : error ? (
                            <pre className="error-output">{error}</pre>
                        ) : output ? (
                            <pre className="success-output">{output}</pre>
                        ) : (
                            <div className="empty-output">
                                <Play size={24} />
                                <span>Click "Run Code" to see output here</span>
                                <span className="loading-hint">Supports 13 languages via Judge0 compiler</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
