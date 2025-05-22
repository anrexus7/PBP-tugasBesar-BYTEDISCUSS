import React from 'react';
import { Link } from 'react-router-dom';
import QuestionList from './QuestionList';

const Dashboard: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Top Questions</h1>
        <Link to="/ask" className="btn btn-primary">Ask Question</Link>
      </div>
      <QuestionList />
    </div>
  );
};

export default Dashboard;