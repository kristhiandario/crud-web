import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        setError('Error retrieving posts.');
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchId === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => post.id.toString() === searchId);
      setFilteredPosts(filtered);
    }
  }, [searchId, posts]);

  const handleSearch = (e) => {
    setSearchId(e.target.value);
  };

  const addPost = async (title, body) => {
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        title,
        body,
        userId: 1,
      });
      const newPost = response.data;
      setPosts([...posts, newPost]);
    } catch (error) {
      setError('Error creating post.');
    }
  };

  const updatePost = async (id, title, body) => {
    if (id <= 100) {
      try {
        const response = await axios.put(`https://jsonplaceholder.typicode.com/posts/${id}`, {
          id,
          title,
          body,
          userId: 1,
        });
        const updatedPost = response.data;
        const updatedPosts = posts.map(post =>
          post.id === updatedPost.id ? updatedPost : post
        );
        setPosts(updatedPosts);
      } catch (error) {
        setError('Error updating post.');
      }
    } else {
      try {
        await axios.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const newPostResponse = await axios.post('https://jsonplaceholder.typicode.com/posts', {
          id,
          title,
          body,
          userId: 1,
        });
        const newPost = newPostResponse.data;
        const updatedPosts = posts.map(post =>
          post.id === id ? newPost : post
        );
        setPosts(updatedPosts);
      } catch (error) {
        setError('Error updating post.');
      }
    }
  }; 

  const deletePost = async (id) => {
    try {
      await axios.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
      const updatedPosts = posts.filter(post => post.id !== id);
      setPosts(updatedPosts);
    } catch (error) {
      setError('Error deleting post.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Create Post</h1>
      <PostForm onSubmit={addPost} />
      <h1>Posts</h1>
      <input type="text" placeholder="Enter post ID" value={searchId} onChange={handleSearch} />
      <Posts posts={filteredPosts} deletePost={deletePost} updatePost={updatePost} />
    </div>
  );
};

const Posts = ({ posts, deletePost, updatePost }) => {
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBody, setEditedBody] = useState('');

  const handleEdit = (post) => {
    setEditingId(post.id);
    setEditedTitle(post.title);
    setEditedBody(post.body);
  };

  const handleSave = () => {
    if (editingId) {
      updatePost(editingId, editedTitle, editedBody);
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
      {posts.map(post => (
        <div key={post.id}>
          {editingId === post.id ? (
            <div>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
              ></textarea>
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <div>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <button onClick={() => deletePost(post.id)}>Delete</button>
              <button onClick={() => handleEdit(post)}>Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


const PostForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(title, body);
    setTitle('');
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      ></textarea>
      <button type="submit">Create</button>
    </form>
  );
};

export default App;
