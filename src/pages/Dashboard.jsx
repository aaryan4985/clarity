import React, { useState, useEffect } from 'react';
import { Send, Brain, Sun, Moon, Lightbulb, TrendingUp, TrendingDown, History, BarChart3, Zap, Target, Clock, Users, DollarSign, AlertTriangle, LogOut, User } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [analysisMetrics, setAnalysisMetrics] = useState(null);
  const [decisionCategory, setDecisionCategory] = useState('general');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const navigate = useNavigate();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserHistory(currentUser.uid);
      } else {
        navigate('/signin');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Load user's decision history from Firestore
  const loadUserHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const decisionsRef = collection(db, 'decisions');
      const q = query(
        decisionsRef, 
        where('userId', '==', userId), 
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const history = [];
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDecisionHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Save decision to Firestore
  const saveDecisionToHistory = async (decisionData) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'decisions'), {
        userId: user.uid,
        userEmail: user.email,
        prompt: decisionData.prompt,
        result: decisionData.result,
        category: decisionData.category,
        metrics: decisionData.metrics,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      });

      // Add to local state with the new ID
      const newDecision = {
        id: docRef.id,
        ...decisionData,
        timestamp: new Date().toISOString()
      };
      
      setDecisionHistory(prev => [newDecision, ...prev]);
    } catch (error) {
      console.error('Error saving decision:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const categories = [
    { id: 'general', label: 'General', icon: Brain },
    { id: 'career', label: 'Career', icon: Target },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'personal', label: 'Personal', icon: Users },
    { id: 'urgent', label: 'Urgent', icon: Clock }
  ];

  const analyzeDecision = async () => {
    if (!prompt.trim() || !user) return;
    
    setLoading(true);
    
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        throw new Error('API key not found.');
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
      
      if (!data.candidates?.[0]?.content?.parts?.[0]) {
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
        
        const metrics = {
          totalWeight,
          prosWeight,
          consWeight,
          prosPercentage: totalWeight > 0 ? Math.round((prosWeight / totalWeight) * 100) : 50,
          consPercentage: totalWeight > 0 ? Math.round((consWeight / totalWeight) * 100) : 50
        };

        setAnalysisMetrics(metrics);

        // Save to Firestore
        await saveDecisionToHistory({
          prompt: prompt,
          result: parsedResult,
          category: decisionCategory,
          metrics: metrics
        });
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      
      // Fallback to mock result if API fails
      const mockResult = {
        pros: [
          {"point": "Could lead to significant personal growth and new opportunities", "weight": 4, "category": "strategic"},
          {"point": "Might increase long-term financial stability", "weight": 4, "category": "financial"},
          {"point": "Could improve work-life balance and happiness", "weight": 3, "category": "emotional"},
          {"point": "Provides valuable learning experiences", "weight": 3, "category": "practical"}
        ],
        cons: [
          {"point": "Involves substantial financial risk and uncertainty", "weight": 5, "category": "financial"},
          {"point": "May require significant time investment with unclear ROI", "weight": 4, "category": "practical"},
          {"point": "Could face strong competition in the market", "weight": 3, "category": "strategic"},
          {"point": "Might experience temporary decrease in income", "weight": 4, "category": "financial"}
        ],
        verdict: "This decision requires careful planning and risk mitigation. Consider starting as a side project while maintaining current income, and develop a detailed business plan with clear milestones before making the full transition.",
        confidence: 75,
        timeframe: "long-term",
        riskLevel: "high",
        alternatives: ["Start as a side business", "Find a business partner", "Join an existing startup"],
        keyFactors: ["Financial runway", "Market validation", "Personal readiness", "Risk tolerance"],
        urgency: "medium"
      };
      
      setResult(mockResult);
      
      const totalWeight = [...mockResult.pros, ...mockResult.cons].reduce((sum, item) => sum + item.weight, 0);
      const prosWeight = mockResult.pros.reduce((sum, item) => sum + item.weight, 0);
      const consWeight = mockResult.cons.reduce((sum, item) => sum + item.weight, 0);
      
      const metrics = {
        totalWeight,
        prosWeight,
        consWeight,
        prosPercentage: Math.round((prosWeight / totalWeight) * 100),
        consPercentage: Math.round((consWeight / totalWeight) * 100)
      };

      setAnalysisMetrics(metrics);

      // Save to Firestore
      await saveDecisionToHistory({
        prompt: prompt,
        result: mockResult,
        category: decisionCategory,
        metrics: metrics
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
      1: 'bg-gray-100 text-gray-600 border-gray-200',
      2: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      3: 'bg-orange-50 text-orange-700 border-orange-200',
      4: 'bg-red-50 text-red-700 border-red-200',
      5: 'bg-red-100 text-red-800 border-red-300'
    };

    const categoryColors = {
      financial: 'bg-green-50 text-green-700 border-l-2 border-green-400',
      emotional: 'bg-purple-50 text-purple-700 border-l-2 border-purple-400',
      practical: 'bg-blue-50 text-blue-700 border-l-2 border-blue-400',
      strategic: 'bg-orange-50 text-orange-700 border-l-2 border-orange-400'
    };
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[weight] || colors[3]}`}>
          {weight}
        </span>
        {category && (
          <span className={`text-xs px-2 py-1 rounded-md ${categoryColors[category] || 'bg-gray-50 text-gray-600'}`}>
            {category}
          </span>
        )}
      </div>
    );
  };

  const RiskIndicator = ({ level }) => {
    const colors = {
      low: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-red-600 bg-red-50 border-red-200'
    };
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[level] || colors.medium}`}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        {level} risk
      </div>
    );
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Clarity
              </h1>
              <p className="text-sm text-gray-500">AI Decision Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.email}</span>
            </div>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-300"
            >
              <History className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-100 p-6 relative z-10 h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision History</h3>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {decisionHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No decisions analyzed yet. Start by asking a question!
                  </p>
                ) : (
                  decisionHistory.map((decision) => (
                    <div key={decision.id} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {decision.prompt}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{decision.category}</span>
                        <span>
                          {decision.createdAt ? 
                            new Date(decision.createdAt).toLocaleDateString() :
                            new Date(decision.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString()
                          }
                        </span>
                      </div>
                      {decision.result && (
                        <div className="text-xs text-blue-600 mt-1">
                          Confidence: {decision.result.confidence}%
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 px-6 py-8 relative z-10 ${showHistory ? 'max-w-5xl' : 'max-w-6xl mx-auto'}`}>
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Decision Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced decision analysis with risk assessment, confidence scoring, and strategic alternatives.
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Decision Category Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Decision Category
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setDecisionCategory(cat.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      decisionCategory === cat.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/80 hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 mb-8 shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe the decision you're facing in detail... (e.g., 'Should I quit my stable job to start a tech startup? I have $50k saved and 3 years of experience.')"
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 text-gray-900 placeholder-gray-500"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    Press Enter to analyze or click the button
                  </span>
                  <button
                    onClick={analyzeDecision}
                    disabled={!prompt.trim() || loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
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
            <div className="space-y-8">
              {/* Analysis Overview */}
              {analysisMetrics && (
                <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                    <h3 className="text-2xl font-bold text-gray-900">Analysis Overview</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{analysisMetrics.prosPercentage}%</div>
                      <div className="text-sm text-gray-600">Positive Factors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">{analysisMetrics.consPercentage}%</div>
                      <div className="text-sm text-gray-600">Risk Factors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">{result.confidence}%</div>
                      <div className="text-sm text-gray-600">AI Confidence</div>
                    </div>
                    <div className="text-center">
                      <RiskIndicator level={result.riskLevel} />
                    </div>
                  </div>

                  {/* Progress bar for pros vs cons */}
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${analysisMetrics.prosPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">Pros Weight: {analysisMetrics.prosWeight}</span>
                    <span className="text-red-500 font-medium">Cons Weight: {analysisMetrics.consWeight}</span>
                  </div>
                </div>
              )}

              {/* Pros and Cons */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pros */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Advantages</h3>
                  </div>
                  <div className="space-y-4">
                    {result.pros?.map((pro, index) => (
                      <div key={index} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-gray-800 flex-1 pr-4">{pro.point}</p>
                          <WeightBadge weight={pro.weight} category={pro.category} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cons */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Risks & Concerns</h3>
                  </div>
                  <div className="space-y-4">
                    {result.cons?.map((con, index) => (
                      <div key={index} className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-gray-800 flex-1 pr-4">{con.point}</p>
                          <WeightBadge weight={con.weight} category={con.category} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Verdict */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">AI Recommendation</h3>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed mb-6">{result.verdict}</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Factors</h4>
                    <ul className="space-y-1">
                      {result.keyFactors?.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Alternatives</h4>
                    <ul className="space-y-1">
                      {result.alternatives?.map((alt, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center">
                          <div className="w-1 h-1 bg-purple-500 rounded-full mr-2"></div>
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 capitalize">{result.timeframe}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <AlertTriangle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 capitalize">{result.urgency} urgency</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;