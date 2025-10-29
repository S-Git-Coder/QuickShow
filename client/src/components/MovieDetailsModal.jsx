import React from 'react';
import { X, Star, ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MovieDetailsModal = ({ movie, onClose }) => {
  const { image_base_url } = useAppContext();

  if (!movie) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        background: "rgba(10, 10, 10, 0.85)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 p-2 rounded-full z-10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Movie Poster */}
          <div className="md:w-1/3 p-4">
            <img 
              src={image_base_url + movie.poster_path} 
              alt={movie.title} 
              className="w-full h-auto rounded-lg object-cover shadow-lg"
            />
            
            {/* Rating and Votes */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-xl font-bold">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
              </div>
              {movie.vote_count && (
                <p className="text-sm text-gray-400 text-center">
                  Based on {movie.vote_count} votes
                </p>
              )}
            </div>

            {/* TMDb Link */}
            <div className="mt-4 flex justify-center">
              <a 
                href={`https://www.themoviedb.org/movie/${movie.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#01b4e4] text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2 hover:opacity-90 transition"
              >
                <ExternalLink className="w-4 h-4" /> View on TMDb
              </a>
            </div>
          </div>

          {/* Movie Details */}
          <div className="md:w-2/3 p-6">
            <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
            
            {/* Release Date */}
            <div className="mb-4">
              <span className="text-sm text-gray-400">
                {movie.release_date || 'Release date not available'}
              </span>
            </div>

            {/* Overview */}
            {movie.overview && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 border-b border-gray-800 pb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;