import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import './Practice.css';

const Practice = () => {
    const [selectedTopic, setSelectedTopic] = useState('dsa');

    const topics = [
        { id: 'dsa', name: '🧮 DSA', description: 'Data Structures & Algorithms', lang: 'cpp' },
        { id: 'react', name: '⚛️ React', description: 'Modern UI development', lang: 'javascript' },
        { id: 'node', name: '🟢 Node.js', description: 'Server-side JavaScript', lang: 'javascript' },
        { id: 'python', name: '🐍 Python', description: 'Versatile scripting', lang: 'python' },
        { id: 'java', name: '☕ Java', description: 'Object-oriented programming', lang: 'java' },
        { id: 'ml', name: '🤖 ML', description: 'Machine Learning', lang: 'python' },
        { id: 'cpp', name: '⚙️ C/C++', description: 'Systems programming', lang: 'cpp' },
        { id: 'go', name: '🐹 Go', description: 'Cloud & backend', lang: 'go' },
        { id: 'rust', name: '🦀 Rust', description: 'Safe systems code', lang: 'rust' },
    ];

    const currentTopic = topics.find(t => t.id === selectedTopic);

    return (
        <div className="practice-container">
            <div className="practice-layout">
                <div className="topics-sidebar">
                    <h2>Topics</h2>
                    <ul>
                        {topics.map(topic => (
                            <li
                                key={topic.id}
                                className={selectedTopic === topic.id ? 'active' : ''}
                                onClick={() => setSelectedTopic(topic.id)}
                            >
                                <div className="topic-name">{topic.name}</div>
                                <div className="topic-desc">{topic.description}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="editor-section">
                    <div className="editor-section-header">
                        <div>
                            <h2>{currentTopic?.name}</h2>
                            <p>{currentTopic?.description}</p>
                        </div>
                    </div>
                    <CodeEditor 
                        defaultLanguage={currentTopic?.lang || 'javascript'} 
                        onLanguageChange={(lang) => {
                            const newTopic = topics.find(t => t.lang === lang || t.id === lang);
                            if (newTopic && newTopic.id !== selectedTopic) {
                                setSelectedTopic(newTopic.id);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Practice;
