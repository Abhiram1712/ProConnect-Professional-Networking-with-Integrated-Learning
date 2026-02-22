import React, { useState } from 'react';
import { Newspaper, Calendar, Clock, ChevronRight, BookOpen, X } from 'lucide-react';

const BLOGS = [
    {
        id: 1, title: 'How to Ace Your Hackathon', date: 'Oct 15, 2024', author: 'Jane Doe',
        readTime: '5 min read',
        content: `Hackathons can be intense but incredibly rewarding experiences. Here are our top tips for success:

1. **Start with a solid idea** — Don't jump straight to coding. Spend the first 30 minutes brainstorming and validating your concept.

2. **Build an MVP** — Focus on the core functionality. Judges appreciate a working demo over an ambitious but broken project.

3. **Team dynamics matter** — Assign clear roles early. Have someone focus on frontend, backend, and the pitch deck.

4. **Practice your pitch** — You'll have limited time to present. Practice explaining your project in 2 minutes.

5. **Use familiar tools** — Don't experiment with new technologies during the hackathon. Stick with what you know.

6. **Document as you go** — Take screenshots, write notes. These help during the presentation and for your portfolio.

Remember: hackathons are as much about learning and networking as they are about winning!`
    },
    {
        id: 2, title: 'Top 10 Interview Questions', date: 'Oct 20, 2024', author: 'John Smith',
        readTime: '8 min read',
        content: `Preparing for technical interviews? Here are the most commonly asked questions and how to approach them:

1. **Two Sum** — Use a hash map for O(n) time complexity.
2. **Reverse a Linked List** — Practice both iterative and recursive approaches.
3. **Binary Search** — Master the edge cases.
4. **Tree Traversals** — Know BFS and all three DFS variants (in-order, pre-order, post-order).
5. **Dynamic Programming** — Start with Fibonacci, then move to knapsack and LCS.
6. **System Design** — Practice designing URL shorteners, chat apps, and news feeds.
7. **Behavioral questions** — Use the STAR method (Situation, Task, Action, Result).
8. **SQL queries** — Common aggregation, JOIN, and window function questions.
9. **API Design** — RESTful principles, authentication, and rate limiting.
10. **Concurrency** — Race conditions, deadlocks, and thread-safe patterns.

Pro tip: Practice on a whiteboard or plain text editor without auto-complete!`
    },
    {
        id: 3, title: 'Building Scalable Apps', date: 'Oct 25, 2024', author: 'Alice Chen',
        readTime: '7 min read',
        content: `Scaling an application from hundreds to millions of users requires thoughtful architecture decisions:

**Database Layer**
- Use read replicas for heavy read workloads
- Implement database sharding for horizontal scaling
- Add caching layers (Redis/Memcached) for frequently accessed data

**Application Layer**
- Design stateless services for easy horizontal scaling
- Use message queues (RabbitMQ, Kafka) for async processing
- Implement circuit breakers for fault tolerance

**Infrastructure**
- Container orchestration with Kubernetes
- CDN for static assets and edge caching
- Auto-scaling groups based on metrics

**Monitoring**
- Implement distributed tracing
- Set up alerts for key business and technical metrics
- Use structured logging for better debugging`
    },
    {
        id: 4, title: 'The Future of AI', date: 'Nov 1, 2024', author: 'Bob Ross',
        readTime: '6 min read',
        content: `Artificial Intelligence is evolving faster than ever. Here's what to expect in the coming years:

**Large Language Models** (LLMs) are becoming multimodal — they can understand and generate text, images, audio, and video. This convergence will create entirely new categories of applications.

**AI Agents** will move beyond chatbots to autonomous systems that can plan, reason, and execute complex multi-step tasks with minimal human guidance.

**Edge AI** will bring intelligence to devices without cloud connectivity, enabling real-time processing in autonomous vehicles, medical devices, and IoT sensors.

**Ethical AI** will become a business imperative, with regulations like the EU AI Act setting standards for transparency, fairness, and accountability.

Whether you're a developer, designer, or business leader, understanding AI is no longer optional — it's essential for staying competitive in the modern tech landscape.`
    },
];

const Blogs = () => {
    const [expandedBlog, setExpandedBlog] = useState(null);

    const toggleBlog = (id) => {
        setExpandedBlog(expandedBlog === id ? null : id);
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Blogs</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Articles, tutorials, and insights from industry experts.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {BLOGS.map(blog => (
                    <div key={blog.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#f0f4ff', padding: '1rem', borderRadius: '8px', color: 'var(--primary)' }}>
                                    <Newspaper size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{blog.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>By {blog.author}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span><Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {blog.readTime}</span>
                                <span><Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {blog.date}</span>
                            </div>
                        </div>

                        {expandedBlog === blog.id ? (
                            <>
                                <div style={{
                                    whiteSpace: 'pre-line', color: 'var(--text)', lineHeight: 1.7,
                                    fontSize: '0.95rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px'
                                }}>
                                    {blog.content}
                                </div>
                                <button
                                    className="btn btn-outline"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                    onClick={() => toggleBlog(blog.id)}
                                >
                                    <X size={15} /> Close
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    {blog.content.substring(0, 150)}...
                                </p>
                                <button
                                    className="btn btn-outline"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                    onClick={() => toggleBlog(blog.id)}
                                >
                                    <BookOpen size={15} /> Read More <ChevronRight size={14} />
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blogs;
