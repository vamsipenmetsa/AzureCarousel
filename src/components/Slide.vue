<template>
  <div class="slide">
    <!-- Slide Number -->
    <div class="slide-number">{{ slideNumber }}/{{ totalSlides }}</div>

    <!-- === First Slide Layout === -->
    <template v-if="isFirst">
      <div class="first-slide-content">
        <img src="/vamsipenmetsa.png" alt="Profile" class="profile-image-top">
        <div class="content-wrapper-first glassy">
          <h1>{{ title }}</h1>
          <p class="subtitle">Azure Concepts by Vamsi Penmetsa</p> 
        </div>
        <!-- Moved button to bottom right -->
        <button class="discover-button">Discover more &rarr;</button>
      </div>
    </template>

    <!-- === Static Last Slide Layout === -->
    <template v-else-if="isStaticLast">
      <div class="last-slide-content">
        <div class="content-wrapper-last glassy" style="position: relative;">
          <p class="last-slide-small-title">Enjoyed it?</p>
          <h2 class="last-slide-main-title">Nail Your Azure Concepts</h2>
          <p class="last-slide-body">
            For more cloud insights and Azure best practices, follow me on LinkedIn <span class="highlighted-handle">@VamsiPenmetsa</span>.
          </p>
          <button class="last-slide-button">Any Questions?</button>
        </div>
        <div class="footer">
          <img src="/vamsipenmetsa.png" alt="Profile" class="profile-image-footer">
          <div class="footer-text">
            <span class="handle">@{{ handle }}</span>
            <span class="website">{{ website }}</span>
          </div>
        </div>
        <!-- Move icons outside glass, bottom right -->
        <div class="footer-icons-glassy-row">
          <span class="footer-icon-glass"><span>💾</span></span>
          <span class="footer-icon-glass"><span>🔄</span></span>
          <span class="footer-icon-glass"><span>❤️</span></span>
        </div>
      </div>
    </template>

    <!-- === Middle Slide Layout === -->
    <template v-else>
      <div class="middle-slide-content">
        <h2 v-if="heading">{{ heading }}</h2>
        <!-- COMPLETELY NEW RENDERING APPROACH FOR HIGHLIGHTED TEXT -->
        <div class="content" v-html="processedContentHtml"></div>
      </div>
      <!-- Footer remains bottom-left -->
      <div class="footer">
        <img src="/vamsipenmetsa.png" alt="Profile" class="profile-image-footer">
        <div class="footer-text">
          <span class="handle">@{{ handle }}</span>
          <span class="website">{{ website }}</span>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: string;
  slideNumber: number;
  totalSlides: number;
  userName: string;
  handle: string; 
  website: string; 
  profileImageUrl?: string;
  isStaticLast: { type: Boolean, default: false }; // Added prop for static last slide
}>();

const isFirst = computed(() => props.slideNumber === 1);

// --- Multiple highlight colors that don't repeat consecutively ---
const highlightColors = [
  'rgba(80, 200, 120, 0.4)',   // Light green (primary color as shown in image)
  'rgba(64, 224, 208, 0.4)',   // Turquoise
  'rgba(255, 191, 0, 0.4)',    // Amber
  'rgba(138, 43, 226, 0.4)',   // BlueViolet
  'rgba(50, 205, 50, 0.4)',    // LimeGreen
  'rgba(30, 144, 255, 0.4)',   // DodgerBlue
  'rgba(255, 127, 80, 0.4)',   // Coral
  'rgba(154, 205, 50, 0.4)'    // YellowGreen
];

let lastHighlightIdx = -1;
const getNextHighlightColor = () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * highlightColors.length);
  } while (idx === lastHighlightIdx && highlightColors.length > 1);
  lastHighlightIdx = idx;
  return highlightColors[idx];
};

// --- Content Parsing --- 

// Extract title from the first sentence for the first slide
const title = computed(() => {
  if (!isFirst.value) return '';
  const firstSentenceMatch = props.content.match(/^[^.!?]+/);
  return firstSentenceMatch ? firstSentenceMatch[0].trim() : 'Slide Title';
});

// Extract heading for middle/last slides (assume first line)
const heading = computed(() => {
  if (isFirst.value || props.isStaticLast) return ''; 
  const lines = props.content.split('\n');
  return lines[0]?.trim() || ''; // Use first line as heading
});

// Get main content (excluding title/heading)
const mainContent = computed(() => {
  if (isFirst.value || props.isStaticLast) {
    return props.content; // Return content for first, or dummy for static last
  } else {
    // Middle slides: remove heading line
    const lines = props.content.split('\n');
    return lines.slice(1).join('\n').trim();
  }
});

// NEW APPROACH: Process content directly to HTML with properly scoped highlights
const processedContentHtml = computed(() => {
  if (isFirst.value || props.isStaticLast) {
    return escapeHtml(mainContent.value);
  }

  // Reset last color index for each new slide
  lastHighlightIdx = -1;
  
  // Get the content text
  const content = mainContent.value;
  
  // Step 1: Pre-process the content to handle punctuation near = signs
  // This ensures periods and commas don't get included in highlights
  let processedContent = content;
  
  // Step 2: Convert the content to HTML parts
  let result = '';
  let currentPos = 0;
  let startPos = -1;
  let inHighlight = false;
  
  for (let i = 0; i < processedContent.length; i++) {
    if (processedContent[i] === '=') {
      if (!inHighlight) {
        // Start of highlight - add everything before this point as regular text
        result += escapeHtml(processedContent.substring(currentPos, i));
        startPos = i + 1; // Start after the = sign
        inHighlight = true;
      } else {
        // End of highlight - add the highlighted text
        const highlightedText = processedContent.substring(startPos, i);
        const color = getNextHighlightColor();
        result += `<span class="highlight" style="background: ${color};">${escapeHtml(highlightedText)}</span>`;
        currentPos = i + 1; // Start after the = sign
        inHighlight = false;
      }
    }
  }
  
  // Add any remaining text
  if (currentPos < processedContent.length) {
    result += escapeHtml(processedContent.substring(currentPos));
  }
  
  // Special case: if we ended while still in a highlight (odd number of = signs)
  if (inHighlight) {
    // Just add the '=' character and the text as normal
    result += escapeHtml('=' + processedContent.substring(startPos));
  }
  
  return result;
});

// Helper function to escape HTML 
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Futura:wght@400;700&display=swap');

.slide {
  width: 1080px;
  height: 1080px;
  padding: 60px 60px;
  box-sizing: border-box;
  display: flex; 
  flex-direction: column;
  position: relative;
  overflow: hidden;
  /* Reverted to light blue gradient background as shown in the attached image */
  background: linear-gradient(to right, #d6f0ff 0%, #c2e7ff 50%, #a8ddff 100%);
  background-size: 100% 100%;
  font-family: 'Futura', 'Century Gothic', sans-serif; 
  color: #1e1e3f;
}

.slide-number {
  position: absolute;
  top: 50px; /* Consistent padding with footer */
  right: 60px; 
  background-color: rgba(255, 255, 255, 0.3);
  color: #1e1e3f;
  padding: 8px 20px;
  border-radius: 15px;
  font-size: 0.95em;
  font-weight: bold;
  z-index: 10;
}

/* --- Glassy Style --- */
.glassy {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 6px 25px 0 rgba(0, 0, 0, 0.1);
  border-radius: 30px;
  padding: 45px 55px;
  box-sizing: border-box;
  width: 85%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center; 
}

/* --- Alignment Containers --- */
.first-slide-content,
.last-slide-content,
.middle-slide-content {
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center; 
  height: 100%; 
  width: 100%;
  text-align: center;
}

.middle-slide-content {
  /* --- Adjusted Vertical Alignment --- */
  justify-content: center; /* Center content vertically */
  align-items: center; 
  text-align: left;
  /* Adjust padding for vertical centering, less top bias */
  padding-top: 80px; 
  padding-bottom: 150px; /* Keep space for footer */
  padding-left: 10%; 
  padding-right: 10%;
  box-sizing: border-box; /* Include padding in width calculation */
}

/* --- First Slide Specific Styles --- */
.profile-image-top {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid rgba(255, 255, 255, 1);
  box-shadow: 0 6px 25px rgba(0,0,0,0.15);
  margin-bottom: 40px;
}

.content-wrapper-first {
  margin-top: 0; 
  margin-bottom: 40px; 
}

.slide h1 {
  font-size: 3.8em; 
  margin: 0 0 15px 0;
  line-height: 1.2;
  color: #002d5c; /* Adjusted Dark Blue */
}

.subtitle {
  font-size: 1.4em;
  font-weight: 400;
  color: #2a5a8a; /* Adjusted Medium Blue */
  margin: 0;
}

/* Discover Button Gradient Update and 3D Font */
.discover-button {
  position: absolute;
  bottom: 60px;
  right: 60px;
  background: linear-gradient(135deg, #0078d4 0%, #00baff 100%); /* Azure blue to cyan */
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 800;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.3s ease;
  backdrop-filter: blur(8px);
}

.discover-button:hover {
  transform: translateY(-3px) scale(1.02);
}

/* --- Middle Slide Specific Styles --- */
.middle-slide-content h2 {
  font-size: 3em;
  margin-bottom: 25px; /* Slightly reduced margin */
  color: #002d5c;
  width: 100%; /* Ensure heading takes width within padded container */
  text-align: left;
}

.middle-slide-content .content {
  font-size: 1.7em; 
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #082545;
  text-align: left;
  width: 100%; /* Ensure content takes width within padded container */
}

/* --- Last Slide Specific Styles --- */
.content-wrapper-last {
   margin-bottom: 0; 
   /* Optional: Adjust padding if needed for new content */
   padding: 50px 60px;
}

.last-slide-small-title {
  font-size: 1.2em;
  font-weight: 600;
  color: #2a5a8a;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.last-slide-main-title {
  font-size: 3.2em;
  font-weight: 800;
  margin: 0 0 25px 0;
  line-height: 1.25;
  color: #002d5c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.2);
}

.last-slide-body {
  font-size: 1.4em;
  font-weight: 400;
  line-height: 1.6;
  color: #082545;
  margin-bottom: 30px;
  max-width: 85%;
}

.last-slide-button {
  background: linear-gradient(135deg, #005a9e 0%, #0078d4 100%);
  color: #fff;
  border: none;
  padding: 18px 45px;
  border-radius: 30px;
  font-size: 1.3em;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
}

.last-slide-button:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

/* Footer icons glassy row (bottom right, outside glass) */
.footer-icons-glassy-row {
  position: absolute;
  right: 60px;
  bottom: 50px; /* Increased from 40px to align with footer */
  display: flex;
  gap: 24px; /* Increased gap between icons from 18px to 24px */
  z-index: 10;
}

.footer-icon-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px; /* Increased from 48px */
  height: 60px; /* Increased from 48px */
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  box-shadow: 0 3px 10px rgba(0,0,0,0.12); /* Enhanced shadow */
  border: 2px solid rgba(255,255,255,0.6); /* Thicker border */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.footer-icon-glass span {
  font-size: 1.8em; /* Increased from 1.5em */
  color: #003063;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.12));
  padding: 4px; /* Added more internal padding */
}

/* --- Footer Styles (Common for Middle/Last) --- */
.footer {
  position: absolute;
  bottom: 50px; /* Consistent padding with header */
  left: 60px;
  display: flex;
  align-items: center;
  z-index: 5;
  color: #003063;
  padding: 12px 15px; /* Adjusted padding for better spacing */
  background-color: rgba(255, 255, 255, 0.25); /* Semi-transparent background as in the image */
  border-radius: 16px; /* Slightly more rounded corners */
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.08); /* Subtle shadow for depth */
}

.profile-image-footer {
  width: 90px; /* Increased size */
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.8);
  margin-right: 20px; /* More space between image and text */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Add subtle shadow */
}

.footer-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center; /* Center vertically */
  text-align: left;
  padding: 3px 0; /* Added vertical padding */
  height: 90px; /* Match height with profile image for perfect alignment */
}

.handle {
  font-size: 1.6em; /* Larger text */
  font-weight: bold;
  color: #003063;
  margin-bottom: 5px; /* Space between handle and website */
}

.website {
  font-size: 1.2em; /* Larger text */
  color: #0078d4;
}

/* --- Highlight Style --- */
:deep(.highlight) {
  padding: 0.12em 0.32em;
  border-radius: 7px;
  color: inherit; /* Use the same color as the parent */
  font-weight: inherit; /* Keep the same font weight as the surrounding text */
  font-size: inherit; /* Keep the same font size as the surrounding text */
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.02);
  transition: background 0.2s;
}

/* Add styling for the highlighted handle in the last slide */
.highlighted-handle {
  background-color: rgba(80, 200, 120, 0.4); /* Light green color from our palette */
  padding: 0.12em 0.32em;
  border-radius: 7px;
  font-weight: bold;
  color: #003063;
}

/* Keep 3D effect for titles */
.slide h1, .slide h2, .last-slide-main-title {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(255, 255, 255, 0.2);
}

</style>
