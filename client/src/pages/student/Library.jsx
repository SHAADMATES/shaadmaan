import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { BookOpen, Search, Download, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Preview Modal
  const [activeBook, setActiveBook] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/student/library');
      setBooks(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load digital library catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleDownload = (book) => {
    setToastType('success');
    setToastMessage(`Downloading "${book.title}" catalog document...`);
    
    // Simulate catalog file downloading by creating a dummy text file
    const docData = `Title: ${book.title}\nAuthor: ${book.author}\nCategory: ${book.category}\nDescription: ${book.description}\n\nThis is a mock digital library file download from Shaad-Mates Website ERP.`;
    const blob = new Blob([docData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.replace(/\s+/g, '_')}_digital_edition.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categories = ['ALL', ...new Set(books.map(b => b.category))];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-48 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
          Digital Library Catalog
        </h2>
        <p className="text-sm text-slate-350 mt-2">
          Browse, read, or download digital documents, educational guidebooks, and wing-specific publications.
        </p>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            placeholder="Search by title, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-royal transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>

        {/* Category filter */}
        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-royal transition-all"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-card border rounded-3xl p-6 text-slate-400 italic text-sm">
            No library catalog books found matching search filters.
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div 
              key={book._id} 
              className="p-6 rounded-3xl glass-card border hover-scale shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-royal/10 text-royal border border-royal/15">
                    {book.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {book.downloads || 0} reads
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-850 dark:text-white line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-450 italic">by {book.author}</p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {book.description || 'No summary text cataloged.'}
                </p>
              </div>

              <button
                onClick={() => handleDownload(book)}
                className="w-full flex items-center justify-center space-x-2 bg-royal hover:bg-royal-dark text-white py-2.5 rounded-2xl font-bold text-xs shadow hover:shadow-lg transition-all"
              >
                <Download size={14} />
                <span>Read / Download PDF</span>
              </button>
            </div>
          ))
        )}
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};

export default Library;
