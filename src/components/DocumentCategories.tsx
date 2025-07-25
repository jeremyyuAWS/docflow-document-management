import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, FileText, BarChart2, Brain, Filter, Search, Plus, X } from 'lucide-react';
import { CustomerDocument } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DocumentCategoriesProps {
  documents: CustomerDocument[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const predefinedTags: Tag[] = [
  { id: '1', name: 'Urgent', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: '2', name: 'High Priority', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: '3', name: 'Financial', color: 'bg-green-100 text-green-800 border-green-200' },
  { id: '4', name: 'Legal', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: '5', name: 'Personal', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: '6', name: 'Confidential', color: 'bg-pink-100 text-pink-800 border-pink-200' },
];

const colorSchemes = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          Count: {payload[0].value}
        </p>
        <p className="text-sm text-gray-600">
          Urgency: {payload[0].payload.urgency.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

function DocumentCategories({ documents }: DocumentCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [customTags, setCustomTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Group documents by type and calculate statistics
  const categoryStats = documents.reduce((acc, doc) => {
    const type = doc.type;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        avgConfidence: 0,
        documents: [],
        urgencyScore: 0,
        tags: new Set<string>()
      };
    }
    acc[type].count++;
    acc[type].documents.push(doc);
    acc[type].avgConfidence += doc.ai_analysis?.category_confidence || 0;
    acc[type].urgencyScore += doc.ai_urgency_score || 0;
    return acc;
  }, {} as Record<string, { 
    count: number; 
    avgConfidence: number; 
    documents: CustomerDocument[]; 
    urgencyScore: number;
    tags: Set<string>;
  }>);

  // Calculate averages and prepare data for charts
  Object.values(categoryStats).forEach(stat => {
    stat.avgConfidence = stat.avgConfidence / stat.count;
    stat.urgencyScore = stat.urgencyScore / stat.count;
  });

  const pieChartData = Object.entries(categoryStats).map(([category, stats]) => ({
    name: category,
    value: stats.count,
    urgency: stats.urgencyScore
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      const newTag: Tag = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTagName.trim(),
        color: `${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`
      };
      setCustomTags([...customTags, newTag]);
      setNewTagName('');
      setShowTagInput(false);
    }
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  const allTags = [...predefinedTags, ...customTags];

  const filteredDocuments = Object.entries(categoryStats)
    .filter(([category]) => !selectedCategory || category === selectedCategory)
    .filter(([category]) => {
      const searchMatch = !searchTerm || 
        category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryStats[category].documents.some(doc => 
          doc.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      if (selectedTags.size === 0) return searchMatch;
      
      return searchMatch && categoryStats[category].documents.some(doc => 
        Array.from(selectedTags).some(tagId => 
          allTags.find(t => t.id === tagId)?.name.toLowerCase() === doc.type.toLowerCase()
        )
      );
    });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Tags className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Smart Categories</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setSelectedCategory(null)}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Smart Tags</h4>
          <button
            onClick={() => setShowTagInput(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tag
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <span
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${tag.color} cursor-pointer transition-all ${
                selectedTags.has(tag.id) ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              {tag.name}
              {selectedTags.has(tag.id) && (
                <X className="h-3 w-3 inline-block ml-1" />
              )}
            </span>
          ))}
          
          <AnimatePresence>
            {showTagInput && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="New tag name..."
                  className="px-3 py-1 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  autoFocus
                />
                <button
                  onClick={handleAddTag}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowTagInput(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Category Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      onClick={() => setSelectedCategory(entry.name)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredDocuments.map(([category, stats], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-900">{category}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {stats.count} Documents
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">AI Confidence</p>
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${stats.avgConfidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(stats.avgConfidence)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Urgency Score</p>
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-2 bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${stats.urgencyScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {Math.round(stats.urgencyScore)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document List Preview */}
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Recent Documents:</div>
                  <div className="mt-2 space-y-2">
                    {stats.documents
                      .filter(doc => 
                        !searchTerm || 
                        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 2)
                      .map(doc => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between text-sm bg-white p-2 rounded-lg"
                        >
                          <span className="text-gray-700">{doc.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'received' ? 'bg-green-100 text-green-800' :
                            doc.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentCategories;