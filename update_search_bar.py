import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update the search bar for the light theme
old_search_input = 'className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-center backdrop-blur-md shadow-lg"'
new_search_input = 'className="w-full px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/50 text-center shadow-sm transition-shadow hover:shadow-md"'

if old_search_input in code:
    code = code.replace(old_search_input, new_search_input)

# Let's also check for the Search Icon absolute positioning if it exists.
# We will just rewrite the entire search div if we can find it.

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
