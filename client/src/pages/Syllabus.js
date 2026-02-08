import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Syllabus = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/api/subjects');
        setSubjects(res.data.subjects || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) return <div>Loading syllabus...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Syllabus</h2>
      {subjects.length === 0 && (
        <div className="text-gray-600">No subjects found.</div>
      )}

      <div className="space-y-4">
        {subjects.map((s) => (
          <div key={s._id} className="p-4 rounded-lg glass dark:glass-dark border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-medium">{s.name}</div>
                <div className="text-sm text-gray-500">{s.code} • {s.credits} credits • Semester {s.semester}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Syllabus;
