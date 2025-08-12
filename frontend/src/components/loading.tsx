"use client";
import { useState } from 'react';

// デフォルトのおしゃれなローディング
export default function StylishLoading() {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
            <div className="text-center">
                {/* メインスピナー */}
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-pink-500 border-l-cyan-500 rounded-full animate-spin animate-reverse"></div>
                    <div className="absolute inset-0 w-24 h-24 border border-blue-200 rounded-full animate-pulse"></div>
                </div>
                
                {/* 光る点々 */}
                <div className="flex justify-center space-x-2 mt-8">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                
                {/* テキスト */}
                <p className="text-gray-600 mt-4 text-lg font-light tracking-wider animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}

// ローディングパターン選択デモ
export function LoadingDemo() {
    type LoadingType = 'gradient' | 'dots' | 'wave' | 'pulse' | 'modern';
    const [currentLoading, setCurrentLoading] = useState<LoadingType>('gradient');

    const loadingComponents = {
        gradient: <GradientSpinner />,
        dots: <DotsLoading />,
        wave: <WaveLoading />,
        pulse: <PulseLoading />,
        modern: <ModernLoading />
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ナビゲーション */}
            <div className="fixed top-4 left-4 z-50 flex flex-wrap gap-2">
                {Object.keys(loadingComponents).map(type => (
                    <button
                        key={type}
                        onClick={() => setCurrentLoading(type as LoadingType)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            currentLoading === type 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            
            {/* 選択されたローディング */}
            {loadingComponents[currentLoading]}
        </div>
    );
}

// グラデーションスピナー
function GradientSpinner() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
            <div className="relative">
                <div className="w-32 h-32 border-8 border-transparent border-t-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-spin"
                     style={{
                         background: 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #06b6d4, #ec4899)',
                         borderImage: 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #06b6d4, #ec4899) 1'
                     }}>
                </div>
                <div className="absolute inset-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-full flex items-center justify-center">
                    <div className="text-white font-bold text-xl animate-pulse">L</div>
                </div>
            </div>
        </div>
    );
}

// ドット系ローディング
function DotsLoading() {
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div className="flex space-x-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce"
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.6s'
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
}

// 波型ローディング
function WaveLoading() {
    return (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="flex items-end space-x-2">
                {[...Array(7)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-t from-emerald-400 to-cyan-400 rounded-t animate-pulse"
                        style={{
                            width: '8px',
                            height: `${20 + Math.sin(i * 0.5) * 20}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1s'
                        }}
                    ></div>
                ))}
            </div>
            <p className="absolute bottom-32 text-cyan-300 text-lg font-light tracking-widest animate-pulse">
                LOADING
            </p>
        </div>
    );
}

// パルス系ローディング
function PulseLoading() {
    return (
        <div className="fixed inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
            <div className="relative">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-24 h-24 border-2 border-white/30 rounded-full animate-ping"
                        style={{
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: '2s'
                        }}
                    ></div>
                ))}
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

// モダンなローディング
function ModernLoading() {
    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center" style={{zIndex: 50}}>
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                         style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                
                <div className="flex items-center justify-center space-x-1 text-white">
                    <span className="text-xl font-light">Loading</span>
                    <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}