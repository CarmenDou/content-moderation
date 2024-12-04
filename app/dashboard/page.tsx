"use client";

import { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AlertCircle, Save, Search } from 'lucide-react';

type SaveStatus = {
    type: 'success' | 'error';  // You can restrict to these two values
    message: string;
  };

export default function Dashboard() {
    const [message, setMessage] = useState('');
    const [toxicityScore, setToxicityScore] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);

    const save = async () => {
        setSaving(true);
        try {
            await addDoc(collection(db, 'moderationResults'), {
                message: message,
                toxicityScore: toxicityScore,
                timestamp: new Date(),
            });
            setSaveStatus({ type: 'success', message: 'Content saved successfully!' });
        } catch (error) {
            setSaveStatus({ type: 'error', message: 'Failed to save content. Please try again.' });
            console.error("Save failed:", error);
        }
        setSaving(false);
    };

    const handleAnalyze = async () => {
        if (!message.trim()) {
            setSaveStatus({ type: 'error', message: 'Please enter some text to analyze.' });
            return;
        }

        try {
            const response = await fetch('/api/analyzeComment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: message }),
            });

            const data = await response.json();

            if (response.ok) {
                setToxicityScore(data.attributeScores.TOXICITY.summaryScore.value);
                setSaveStatus(null);
            } else {
                setSaveStatus({ type: 'error', message: 'Analysis failed. Please try again.' });
            }
        } catch (error) {
            setSaveStatus({ type: 'error', message: 'Analysis failed. Please try again.' });
        }
    };

    const getToxicityLevel = (score:any) => {
        if (score <= 0.3) return { text: 'Low Toxicity', color: 'text-green-600' };
        if (score <= 0.7) return { text: 'Medium Toxicity', color: 'text-yellow-600' };
        return { text: 'High Toxicity', color: 'text-red-600' };
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Content Moderation Dashboard
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message to Analyze
                            </label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter a message to analyze..."
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleAnalyze}
                                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                disabled={!message.trim()}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Analyze
                            </button>

                            {toxicityScore !== null && (
                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Results'}
                                </button>
                            )}
                        </div>

                        {saveStatus && (
                            <div className={`p-4 rounded-md flex items-start space-x-2 ${
                                saveStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                            }`}>
                                <AlertCircle className="h-5 w-5 mt-0.5" />
                                <p className="text-sm">{saveStatus.message}</p>
                            </div>
                        )}

                        {toxicityScore !== null && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        Raw Score: <span className="font-medium">{(toxicityScore * 100).toFixed(1)}%</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Assessment: <span className={`font-medium ${getToxicityLevel(toxicityScore).color}`}>
                                            {getToxicityLevel(toxicityScore).text}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}