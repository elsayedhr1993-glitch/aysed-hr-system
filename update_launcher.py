import re

with open('src/components/OdooAppLauncher.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update background classes of apps to have no bg-color on the card but keep icon gradient
# Wait, let's look at the OdooAppLauncher first.
