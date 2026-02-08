import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FileDown, Plus, Download, Trash2, File } from 'lucide-react';

const Notes = () => {
  const { user, socket } = useAuth();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: ''
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchNotes();
    fetchSubjects();

    if (socket) {
      socket.on('new-note', (note) => {
        setNotes(prev => [note, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-note');
      }
    };
  }, [socket]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get('/api/notes');
      setNotes(res.data.notes);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/subjects');
      setSubjects(res.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      files.forEach(file => {
        data.append('files', file);
      });

      await axios.post('/api/notes', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowModal(false);
      setFormData({ title: '', description: '', subject: '' });
      setFiles([]);
      fetchNotes();
    } catch (error) {
      console.error('Failed to upload notes:', error);
      alert(error.response?.data?.message || 'Failed to upload notes');
    }
  };

  const handleDownload = async (noteId, fileIndex, fileName) => {
    try {
      const res = await axios.get(`/api/notes/download/${noteId}?fileIndex=${fileIndex}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download note:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`/api/notes/${id}`);
        fetchNotes();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notes & Materials 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'admin' ? 'Upload study materials' : 'Download course materials'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Upload Notes</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <FileDown className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleDelete(note._id)}
                  className="p-2 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {note.title}
            </h3>
            
            {note.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {note.description}
              </p>
            )}

            <div className="mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                {note.subject?.name}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {note.files?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/50 dark:bg-dark-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <File size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(note._id, index, file.originalName)}
                    className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Download size={16} className="text-primary-600 dark:text-primary-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                <span>By {note.uploadedBy?.name}</span>
                <span>{note.downloads} downloads</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="col-span-full glass dark:glass-dark rounded-2xl p-12 text-center">
            <FileDown size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No notes available yet
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass dark:glass-dark rounded-2xl p-6 max-w-md w-full animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Notes
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-gray-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 outline-none"
                  required
                />
                {files.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
