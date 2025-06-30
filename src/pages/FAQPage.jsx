import React, { useState, useEffect } from 'react';
import { db } from '../lib/database';
import useTitle from '../hooks/useTitle';
import { FiChevronDown, FiChevronUp, FiSearch, FiHelpCircle, FiMessageCircle, FiMail, FiPhone } from 'react-icons/fi';

/**
 * FAQ Page Component
 * 
 * Displays frequently asked questions organized by categories
 * with search functionality and expandable answers
 */
function FAQPage() {
  useTitle('Frequently Asked Questions - JW Matrimony');
  
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    fetchFAQs();
  }, []);

  /**
   * Fetch FAQs from database
   */
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await db.faqs.list();
      
      // Sort FAQs by category first, then by order field
      const sortedFAQs = response.documents.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return (a.order || 0) - (b.order || 0);
      });
      
      setFaqs(sortedFAQs);
      console.log('FAQs loaded successfully:', sortedFAQs);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter FAQs based on search term only
   */
  const getFilteredFAQs = () => {
    let filtered = faqs;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  /**
   * Group filtered FAQs by category to avoid duplicate headers
   */
  const getGroupedFAQs = () => {
    const filteredFAQs = getFilteredFAQs();
    const grouped = {};
    
    filteredFAQs.forEach(faq => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });
    
    return grouped;
  };

  /**
   * Toggle expanded state of FAQ item
   */
  const toggleExpanded = (faqId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  /**
   * Expand all FAQs in current view
   */
  const expandAll = () => {
    const filteredFAQs = getFilteredFAQs();
    const allIds = new Set(filteredFAQs.map(faq => faq.$id));
    setExpandedItems(allIds);
  };

  /**
   * Collapse all FAQs
   */
  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const filteredFAQs = getFilteredFAQs();
  const groupedFAQs = getGroupedFAQs();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading FAQs...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiHelpCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load FAQs</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchFAQs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about JW Matrimony. Can't find what you're looking for? 
            Contact our support team for personalized assistance.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Expand/Collapse Controls */}
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredFAQs.length === 0 ? (
              <span>No FAQs found matching your criteria</span>
            ) : (
              <span>
                Showing {filteredFAQs.length} of {faqs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            )}
          </div>
        </div>

        {/* FAQ List */}
        {Object.keys(groupedFAQs).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.'
                : 'No FAQs are available at the moment.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFAQs).map(([category, categoryFAQs], categoryIndex) => (
              <div key={category} className={categoryIndex > 0 ? 'mt-12' : ''}>
                {/* Category Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    {category}
                  </h2>
                </div>

                {/* FAQ Items for this category */}
                <div className="space-y-4">
                  {categoryFAQs.map((faq) => {
                    const isExpanded = expandedItems.has(faq.$id);
                    
                    return (
                      <div key={faq.$id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                        <button
                          onClick={() => toggleExpanded(faq.$id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex-1 pr-4">
                            <h3 className="font-semibold text-gray-900 text-base leading-relaxed">
                              {faq.question}
                            </h3>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <FiChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </button>

                        {/* Answer */}
                        <div className={`transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}>
                          <div className="px-6 pb-6 border-t border-gray-100">
                            <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <FiMessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to help you with any questions or concerns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@jwmatrimony.com"
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <FiMail className="w-5 h-5" />
                Email Support
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <FiPhone className="w-5 h-5" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;