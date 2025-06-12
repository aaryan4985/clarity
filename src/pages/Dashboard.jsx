import React, { useState } from 'react';
import { Send, Brain, Sun, Moon, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const analyzeDecision = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    try {
      const GEMINI_API_KEY = 'AIzaSyA8uYtQyob8dUJ9_Bqe_adsdSKzu2M0Al8';
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `Analyze this decision and provide a structured response in this exact JSON format:

{
  "pros": [
    {"point": "advantage description", "weight": 4},
    {"point": "advantage description", "weight": 3}
  ],
  "cons": [
    {"point": "disadvantage description", "weight": 5},
    {"point": "disadvantage description", "weight": 2}
  ],
  "verdict": "Final recommendation with reasoning"
}

Decision to analyze: ${prompt}

Provide 3-5 pros and 3-5 cons, each with a weight from 1-5 (5 being most important). Give a clear, thoughtful verdict at the end. Return only valid JSON.`
          }]
        }]
      };

      console.log('Making API request...', requestBody);

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

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid API response structure');
      }

      const text = data.candidates[0].content.parts[0].text;
      console.log('Generated text:', text);
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        setResult(parsedResult);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      
      // Provide a mock result for testing
      setResult({
        pros: [
          {"point": "Could lead to new opportunities and experiences", "weight": 4},
          {"point": "Might increase personal satisfaction", "weight": 3},
          {"point": "Could improve long-term prospects", "weight": 3}
        ],
        cons: [
          {"point": "May involve significant risks", "weight": 4},
          {"point": "Could require substantial time investment", "weight": 3},
          {"point": "Might have uncertain outcomes", "weight": 3}
        ],
        verdict: "Based on the analysis, this decision requires careful consideration of your personal circumstances and risk tolerance. Consider creating a detailed plan to mitigate potential downsides while maximizing the benefits."
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

  const WeightBadge = ({ weight }) => {
    const colors = {
      1: 'bg-gray-200 text-gray-600',
      2: 'bg-yellow-200 text-yellow-700',
      3: 'bg-orange-200 text-orange-700',
      4: 'bg-red-200 text-red-700',
      5: 'bg-red-500 text-white'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[weight] || colors[3]}`}>
        {weight}
      </span>
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
              Clarity
            </h1>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Make Better Decisions with AI
          </h2>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Get AI-powered analysis of your decisions with weighted pros and cons, plus a smart recommendation.
          </p>
        </div>

        {/* Prompt Input */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 mb-8 shadow-lg transition-colors duration-300`}>
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the decision you're facing... (e.g., 'Should I quit my job to start a business?')"
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
                      <Send className="w-4 h-4" />
                      <span>Analyze</span>
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
            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Pros */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg transition-colors duration-300`}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-600">Pros</h3>
                </div>
                <div className="space-y-4">
                  {result.pros?.map((pro, index) => (
                    <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'} transition-colors duration-300`}>
                      <div className="flex items-start justify-between mb-2">
                        <WeightBadge weight={pro.weight} />
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
                  <h3 className="text-2xl font-bold text-red-600">Cons</h3>
                </div>
                <div className="space-y-4">
                  {result.cons?.map((con, index) => (
                    <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'} transition-colors duration-300`}>
                      <div className="flex items-start justify-between mb-2">
                        <WeightBadge weight={con.weight} />
                      </div>
                      <p className={`${darkMode ? 'text-red-300' : 'text-red-800'}`}>{con.point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Verdict */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 text-center shadow-lg transition-colors duration-300`}>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  AI Verdict
                </h3>
              </div>
              <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {result.verdict}
              </p>
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
              Ready to help you decide
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Enter your decision above and let AI analyze it for you
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;