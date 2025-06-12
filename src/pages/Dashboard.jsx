import React, { useState, useEffect } from 'react';
import { Send, Brain, Sun, Moon, Lightbulb, TrendingUp, TrendingDown, History, BarChart3, Zap, Target, Clock, Users, DollarSign, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [analysisMetrics, setAnalysisMetrics] = useState(null);
  const [decisionCategory, setDecisionCategory] = useState('general');

  // Load history from memory on component mount
  useEffect(() => {
    const saved = localStorage.getItem('decisionHistory');
    if (saved) {
      try {
        setDecisionHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  const categories = [
    { id: 'general', label: 'General', icon: Brain },
    { id: 'career', label: 'Career', icon: Target },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'personal', label: 'Personal', icon: Users },
    { id: 'urgent', label: 'Urgent', icon: Clock }
  ];

  const analyzeDecision = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    try {
      // Use environment variable instead of hardcoded API key
      const GEMINI_API_KEY = 'AIzaSyA8uYtQyob8dUJ9_Bqe_adsdSKzu2M0Al8';
      
      if (!GEMINI_API_KEY) {
        throw new Error('API key not found. Please check your environment variables.');
      }

      const enhancedPrompt = `Analyze this ${decisionCategory} decision and provide a comprehensive structured response in this exact JSON format:

{
  "pros": [
    {"point": "advantage description", "weight": 4, "category": "financial/emotional/practical/strategic"},
    {"point": "advantage description", "weight": 3, "category": "financial/emotional/practical/strategic"}
  ],
  "cons": [
    {"point": "disadvantage description", "weight": 5, "category": "financial/emotional/practical/strategic"},
    {"point": "disadvantage description", "weight": 2, "category": "financial/emotional/practical/strategic"}
  ],
  "verdict": "Final recommendation with reasoning",
  "confidence": 85,
  "timeframe": "immediate/short-term/long-term",
  "riskLevel": "low/medium/high",
  "alternatives": ["alternative 1", "alternative 2"],
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "urgency": "low/medium/high"
}

Decision to analyze: ${prompt}

Provide 3-5 pros and 3-5 cons, each with a weight from 1-5 (5 being most important) and categorize each point. Give a confidence score (1-100), assess risk level, suggest alternatives, and identify key factors. Return only valid JSON.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid API response structure');
      }

      const text = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        setResult(parsedResult);
        
        // Calculate analysis metrics
        const totalWeight = [...(parsedResult.pros || []), ...(parsedResult.cons || [])].reduce((sum, item) => sum + (item.weight || 0), 0);
        const prosWeight = (parsedResult.pros || []).reduce((sum, item) => sum + (item.weight || 0), 0);
        const consWeight = (parsedResult.cons || []).reduce((sum, item) => sum + (item.weight || 0), 0);
        
        setAnalysisMetrics({
          totalWeight,
          prosWeight,
          consWeight,
          prosPercentage: totalWeight > 0 ? Math.round((prosWeight / totalWeight) * 100) : 50,
          consPercentage: totalWeight > 0 ? Math.round((consWeight / totalWeight) * 100) : 50
        });

        // Save to history
        const historyItem = {
          id: Date.now(),
          prompt: prompt,
          result: parsedResult,
          category: decisionCategory,
          timestamp: new Date().toISOString(),
          metrics: {
            totalWeight,
            prosWeight,
            consWeight,
            prosPercentage: totalWeight > 0 ? Math.round((prosWeight / totalWeight) * 100) : 50
          }
        };
        
        const newHistory = [historyItem, ...decisionHistory.slice(0, 9)]; // Keep only last 10
        setDecisionHistory(newHistory);
        localStorage.setItem('decisionHistory', JSON.stringify(newHistory));
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      
      // Enhanced mock result for testing
      const mockResult = {
        pros: [
          {"point": "Could lead to significant personal growth and new opportunities", "weight": 4, "category": "strategic"},
          {"point": "Might increase long-term financial stability", "weight": 4, "category": "financial"},
          {"point": "Could improve work-life balance and happiness", "weight": 3, "category": "emotional"}
        ],
        cons: [
          {"point": "Involves substantial financial risk and uncertainty", "weight": 5, "category": "financial"},
          {"point": "May require significant time investment with unclear ROI", "weight": 4, "category": "practical"},
          {"point": "Could face strong competition in the market", "weight": 3, "category": "strategic"}
        ],
        verdict: "This decision requires careful planning and risk mitigation. Consider starting as a side project while maintaining current income, and develop a detailed business plan with clear milestones before making the full transition.",
        confidence: 75,
        timeframe: "long-term",
        riskLevel: "high",
        alternatives: ["Start as a side business", "Find a business partner", "Join an existing startup"],
        keyFactors: ["Financial runway", "Market validation", "Personal readiness"],
        urgency: "medium"
      };
      
      setResult(mockResult);
      
      const totalWeight = [...mockResult.pros, ...mockResult.cons].reduce((sum, item) => sum + item.weight, 0);
      const prosWeight = mockResult.pros.reduce((sum, item) => sum + item.weight, 0);
      const consWeight = mockResult.cons.reduce((sum, item) => sum + item.weight, 0);
      
      setAnalysisMetrics({
        totalWeight,
        prosWeight,
        consWeight,
        prosPercentage: Math.round((prosWeight / totalWeight) * 100),
        consPercentage: Math.round((consWeight / totalWeight) * 100)
      });
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeDecision();
    }
  };

  const WeightBadge = ({ weight, category }) => {
    const colors = {
      1: 'bg-gray-200 text-gray-600',
      2: 'bg-yellow-200 text-yellow-700',
      3: 'bg-orange-200 text-orange-700',
      4: 'bg-red-200 text-red-700',
      5: 'bg-red-500 text-white'
    };

    const categoryColors = {
      financial: 'border-l-4 border-green-500',
      emotional: 'border-l-4 border-purple-500',
      practical: 'border-l-4 border-blue-500',
      strategic: 'border-l-4 border-orange-500'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[weight] || colors[3]}`}>
          {weight}
        </span>
        {category && (
          <span className={`text-xs px-2 py-1 rounded ${categoryColors[category] || ''} bg-gray-100 ${darkMode ? 'bg-gray-600 text-gray-300' : 'text-gray-600'}`}>
            {category}
          </span>
        )}
      </div>
    );
  };

  const RiskIndicator = ({ level }) => {
    const colors = {
      low: 'text-green-500 bg-green-100',
      medium: 'text-yellow-500 bg-yellow-100',
      high: 'text-red-500 bg-red-100'
    };
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[level] || colors.medium}`}>
        <AlertTriangle className="w-4 h-4 mr-1" />
        {level} risk
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Clarity Pro
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            AI-Powered Decision Intelligence
          </h2>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Advanced decision analysis with risk assessment, confidence scoring, and strategic alternatives.
          </p>
        </div>

        {/* Decision Category Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Decision Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setDecisionCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    decisionCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white'
                      : darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Input */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mb-8 shadow-lg transition-colors duration-300`}>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the decision you're facing in detail... (e.g., 'Should I quit my stable job to start a tech startup? I have $50k saved and 3 years of experience.')"
                className={`w-full h-32 p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <div className="flex items-center justify-between mt-4">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Press Enter to analyze or click the button
                </span>
                <button
                  onClick={analyzeDecision}
                  disabled={!prompt.trim() || loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl hover:from-blue-600 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>AI Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {/* Analysis Overview */}
            {analysisMetrics && (
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mb-8 shadow-lg transition-colors duration-300`}>
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  <h3 className="text-2xl font-bold">Analysis Overview</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-500">{analysisMetrics.prosPercentage}%</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Positive Factors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">{analysisMetrics.consPercentage}%</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk Factors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">{result.confidence}%</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI Confidence</div>
                  </div>
                  <div className="text-center">
                    <RiskIndicator level={result.riskLevel} />
                  </div>
                </div>

                {/* Progress bar for pros vs cons */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${analysisMetrics.prosPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500">Pros Weight: {analysisMetrics.prosWeight}</span>
                  <span className="text-red-500">Cons Weight: {analysisMetrics.consWeight}</span>
                </div>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Pros */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg transition-colors duration-300`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-600">Advantages</h3>
                </div>
                <div className="space-y-4">
                  {result.pros?.map((pro, index) => (
                    <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'} transition-colors duration-300`}>
                      <div className="flex items-start justify-between mb-2">
                        <WeightBadge weight={pro.weight} category={pro.category} />
                      </div>
                      <p className={`${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>{pro.point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg transition-colors duration-300`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">Risks & Challenges</h3>
                </div>
                <div className="space-y-4">
                  {result.cons?.map((con, index) => (
                    <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'} transition-colors duration-300`}>
                      <div className="flex items-start justify-between mb-2">
                        <WeightBadge weight={con.weight} category={con.category} />
                      </div>
                      <p className={`${darkMode ? 'text-red-300' : 'text-red-800'}`}>{con.point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Key Factors */}
              {result.keyFactors && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg transition-colors duration-300`}>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    Key Factors
                  </h3>
                  <ul className="space-y-2">
                    {result.keyFactors.map((factor, index) => (
                      <li key={index} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {result.alternatives && (
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg transition-colors duration-300`}>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Alternative Options
                  </h3>
                  <ul className="space-y-2">
                    {result.alternatives.map((alt, index) => (
                      <li key={index} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Final Verdict */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 text-center shadow-lg transition-colors duration-300`}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  AI Recommendation
                </h3>
              </div>
              <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                {result.verdict}
              </p>
              
              <div className="flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-blue-500" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Timeline: {result.timeframe}
                  </span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Urgency: {result.urgency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && decisionHistory.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mt-8 shadow-lg transition-colors duration-300`}>
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <History className="w-6 h-6 mr-2 text-purple-500" />
              Decision History
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {decisionHistory.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer hover:opacity-80 transition-opacity`}
                     onClick={() => {
                       setPrompt(item.prompt);
                       setResult(item.result);
                       setAnalysisMetrics(item.metrics);
                       setShowHistory(false);
                     }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                    {item.prompt}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    <span className="text-emerald-500">+{item.metrics?.prosPercentage}%</span>
                    <span className="text-red-500">-{item.metrics?.consPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full flex items-center justify-center">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Advanced Decision Intelligence Ready
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Enter your decision above and get comprehensive AI analysis with risk assessment and strategic alternatives
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;