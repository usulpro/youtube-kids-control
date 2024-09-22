'use client';
import React, { useState, useEffect } from 'react';
import AnalogClock from '@/modules/AnalogClock/AnalogClock';

const Home: React.FC = () => {
  const [intervals, setIntervals] = useState<Interval[]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem('centralModuleState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setIntervals(parsedState.intervals);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Детское расписание
      </h1>
      <div className="bg-white rounded-lg shadow-xl p-6 w-[800px] h-[600px]">
        <AnalogClock intervals={intervals} />
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Легенда:</h2>
        <ul className="space-y-2">
          {intervals.map((interval, index) => (
            <li key={index} className="flex items-center">
              <div
                className="w-6 h-6 mr-2 rounded-full"
                style={{ backgroundColor: interval.color }}
              ></div>
              <span className="font-medium text-black">{interval.label}</span>
              <span className="ml-2 text-sm text-gray-600">
                ({interval.startTime} - {interval.endTime})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
