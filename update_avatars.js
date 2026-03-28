const fs = require('fs');

// Feed.jsx
let f = fs.readFileSync('src/pages/Feed.jsx', 'utf8');

f = f.replace("const [user] = useState(JSON.parse(localStorage.getItem('user')));", 
`const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    useEffect(() => {
        if (!token) return;
        fetch('http://localhost:5000/api/auth', { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => {
                if (data && data._id) {
                    const updated = { ...JSON.parse(localStorage.getItem('user')), profilePicture: data.profilePicture };
                    setUser(updated);
                    localStorage.setItem('user', JSON.stringify(updated));
                }
            }).catch(()=>{});
    }, [token]);
`);

f = f.replace('<div className="profile-img-placeholder"><User size={38} /></div>',
`{user?.profilePicture ? <img src={user.profilePicture} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}/> : <div className="profile-img-placeholder"><User size={38} /></div>}`);

f = f.replace('<div className="user-icon"><User size={22} /></div>',
'<div className="user-icon" style={user?.profilePicture ? { backgroundImage: `url(${user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>{!user?.profilePicture && <User size={22} />}</div>');

f = f.replace('<div className="post-user-icon"><User size={22} /></div>',
'<div className="post-user-icon" style={post.user?.profilePicture ? { backgroundImage: `url(${post.user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!post.user?.profilePicture && <User size={22} />}</div>');

f = f.replace('<div className="original-avatar"><User size={14} /></div>',
'<div className="original-avatar" style={post.originalPost.user?.profilePicture ? { backgroundImage: `url(${post.originalPost.user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!post.originalPost.user?.profilePicture && <User size={14} />}</div>');

f = f.replace('<div className="mini-avatar"><User size={14} /></div>',
'<div className="mini-avatar" style={user?.profilePicture ? { backgroundImage: `url(${user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!user?.profilePicture && <User size={14} />}</div>');

f = f.replace('<div className="comment-avatar"><User size={12} /></div>',
'<div className="comment-avatar" style={comment.user?.profilePicture ? { backgroundImage: `url(${comment.user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!comment.user?.profilePicture && <User size={12} />}</div>');

f = f.replace('<div className="comment-avatar" style={{ width: 24, height: 24 }}><User size={10} /></div>',
'<div className="comment-avatar" style={{ width: 24, height: 24, ...(reply.user?.profilePicture ? { backgroundImage: `url(${reply.user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}) }}>{!reply.user?.profilePicture && <User size={10} />}</div>');

f = f.replace('<div className="user-icon" style={{ width: 44, height: 44 }}><User size={20} /></div>',
'<div className="user-icon" style={{ width: 44, height: 44, ...(user?.profilePicture ? { backgroundImage: `url(${user.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}) }}>{!user?.profilePicture && <User size={20} />}</div>');

fs.writeFileSync('src/pages/Feed.jsx', f);

// Network.jsx
let n = fs.readFileSync('src/pages/Network.jsx', 'utf8');

n = n.replace("const [user] = useState(JSON.parse(localStorage.getItem('user')));", 
`const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    useEffect(() => {
        if (!token) return;
        fetch('http://localhost:5000/api/auth', { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => {
                if (data && data._id) {
                    const updated = { ...JSON.parse(localStorage.getItem('user')), profilePicture: data.profilePicture };
                    setUser(updated);
                    localStorage.setItem('user', JSON.stringify(updated));
                }
            }).catch(()=>{});
    }, [token]);
`);

n = n.replace('<div className="invitation-avatar"><User size={24} /></div>',
'<div className="invitation-avatar" style={request.requester?.profilePicture ? { backgroundImage: `url(${request.requester.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!request.requester?.profilePicture && <User size={24} />}</div>');

n = n.replace('<div className="invitation-avatar"><User size={24} /></div>',
'<div className="invitation-avatar" style={request.recipient?.profilePicture ? { backgroundImage: `url(${request.recipient.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!request.recipient?.profilePicture && <User size={24} />}</div>');

n = n.replace('<div className="connection-avatar"><User size={24} /></div>',
'<div className="connection-avatar" style={conn.profilePicture ? { backgroundImage: `url(${conn.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!conn.profilePicture && <User size={24} />}</div>');

n = n.replace('<div className="user-card-avatar"><User size={28} /></div>',
'<div className="user-card-avatar" style={suggestion.profilePicture ? { backgroundImage: `url(${suggestion.profilePicture})`, backgroundSize: "cover", backgroundPosition: "center", border: "none" } : {}}>{!suggestion.profilePicture && <User size={28} />}</div>');

fs.writeFileSync('src/pages/Network.jsx', n);

console.log('Update complete');
