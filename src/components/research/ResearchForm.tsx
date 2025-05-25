import { useState } from 'react';
import { getLegalResponse } from '../../lib/openai';
import Button from '../ui/Button';
import { Scale } from 'lucide-react';

const ResearchForm = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a research question');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResponse('');
    
    try {
      const result = await getLegalResponse(query);
      setResponse(result);
    } catch (err) {
      setError('An error occurred while processing your request. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="card">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-serif font-bold text-primary-800 mb-4">
            Legal Research Assistant
          </h2>
          
          <div className="mb-4">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your legal research question
            </label>
            <textarea
              id="query"
              rows={4}
              className="input w-full"
              placeholder="E.g., What are the elements required to establish a negligence claim in California?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !query.trim()}
            >
              Submit Question
            </Button>
          </div>
        </form>
        
        {isLoading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md flex items-center justify-center">
            <Scale className="h-8 w-8 text-primary-800 animate-pulse mr-2" />
            <span className="text-gray-600">Researching...</span>
          </div>
        )}
        
        {response && !isLoading && (
          <div className="mt-6 animate-fade-in">
            <h3 className="text-lg font-serif font-bold text-primary-800 mb-2">
              Research Results
            </h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="prose max-w-none">
                {response.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchForm;