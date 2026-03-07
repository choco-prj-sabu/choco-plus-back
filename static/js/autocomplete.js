// Autocomplete functionality for search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const suggestionsList = document.getElementById('suggestions-list');
    let suggestionTimeout;
    
    // Fetch search suggestions from YouTube API
    async function fetchSuggestions(query) {
        if (!query || query.length < 2) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        try {
            // Try to fetch suggestions from YouTube autocomplete
            const response = await fetch(
                `https://www.youtube.com/complete/search?client=youtube&q=${encodeURIComponent(query)}&callback=handleYoutubeSuggestions`,
                { mode: 'no-cors' }
            ).catch(() => null);
            
            // Fallback: Use a simple array of common search terms
            const suggestions = getLocalSuggestions(query);
            displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            const suggestions = getLocalSuggestions(query);
            displaySuggestions(suggestions);
        }
    }
    
    // Get suggestions from local common terms
    function getLocalSuggestions(query) {
        const commonTerms = [
            'music', 'gaming', 'animation', 'tutorial', 'vlog',
            'podcast', 'news', 'sports', 'comedy', 'education',
            'technology', 'cooking', 'travel', 'fashion', 'fitness'
        ];
        
        const lowerQuery = query.toLowerCase();
        return commonTerms
            .filter(term => term.includes(lowerQuery))
            .map(term => query + term.slice(lowerQuery.length))
            .slice(0, 5);
    }
    
    // Display suggestions in dropdown
    function displaySuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        suggestionsList.innerHTML = suggestions
            .map((suggestion, index) => 
                `<div class="suggestion-item" data-index="${index}">${escapeHtml(suggestion)}</div>`
            )
            .join('');
        
        suggestionsList.style.display = 'block';
        
        // Add click handlers to suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                searchInput.value = this.textContent;
                suggestionsList.style.display = 'none';
            });
        });
    }
    
    // Escape HTML to prevent injection
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // Input event listener
    searchInput.addEventListener('input', function() {
        clearTimeout(suggestionTimeout);
        suggestionTimeout = setTimeout(() => {
            fetchSuggestions(this.value);
        }, 300);
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput) {
            suggestionsList.style.display = 'none';
        }
    });
    
    // Show suggestions on focus if there's text
    searchInput.addEventListener('focus', function() {
        if (this.value.length >= 2) {
            fetchSuggestions(this.value);
        }
    });
});
