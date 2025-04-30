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
            For more cloud insights and Azure best practices, follow me on LinkedIn @VamsiPenmetsa.
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
        <div class="content" v-html="formattedContent"></div>
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

// --- Enhanced Muted Highlight Colors (More Random Options) ---
const highlightColors = [
  'rgba(97, 255, 189, 0.5)',  // Neon Mint
  'rgba(101, 214, 255, 0.5)',  // Neon Blue
  'rgba(192, 132, 252, 0.5)',  // Neon Purple
  'rgba(255, 189, 97, 0.5)',   // Neon Orange
  'rgba(255, 114, 177, 0.5)',  // Neon Pink
  'rgba(179, 255, 97, 0.5)',   // Neon Green
  'rgba(255, 243, 97, 0.5)',   // Neon Yellow
  'rgba(232, 143, 255, 0.5)',  // Neon Violet
];

// Function to get a random highlight color
const getRandomHighlightColor = () => {
  return highlightColors[Math.floor(Math.random() * highlightColors.length)];
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

// Format content: handle cycling highlights on mainContent
const formattedContent = computed(() => {
  let text = '';
  if (!isFirst.value && !props.isStaticLast) {
      text = mainContent.value; 
  }
  
  // Replace =highlighted text= with random highlight colors
  return text.replace(/=(.*?)=/g, (match, p1) => {
    const color = getRandomHighlightColor();
    return `<span class="highlight" style="background-color: ${color};">${p1}</span>`; 
  });
});

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
  /* Updated gradient to match Microsoft Azure colors (white to light blue to dark blue) */
  background: linear-gradient(to right, #ffffff 0%, #89c4f4 50%, #0078d4 100%); /* White -> Azure Light Blue -> Azure Blue */
  /* Updating the gradient in the background-image as well */
  background-image: 
    linear-gradient(to right, #ffffff 0%, #89c4f4 50%, #0078d4 100%),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 100% 100%, 20px 20px, 20px 20px;
  background-position: 0 0, 0 0, 0 0;
  background-blend-mode: normal, overlay, overlay;
  font-family: 'Futura', 'Century Gothic', sans-serif; 
  color: #1e1e3f; /* Adjusted for better contrast on new background */
}

.slide-number {
  position: absolute;
  top: 30px;
  right: 40px;
  background-color: rgba(255, 255, 255, 0.3);
  color: #1e1e3f;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.9em;
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
  bottom: 40px;
  display: flex;
  gap: 18px;
  z-index: 10;
}

.footer-icon-glass {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border: 1.5px solid rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: box-shadow 0.2s;
}

.footer-icon-glass span {
  font-size: 1.5em;
  color: #003063;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.10));
}

.footer-icon-glass:hover {
  box-shadow: 0 4px 16px rgba(0,120,212,0.18);
}

/* --- Footer Styles (Common for Middle/Last) --- */
.footer {
  position: absolute;
  bottom: 60px; /* Moved up from 40px */
  left: 60px;
  display: flex;
  align-items: center;
  z-index: 5;
  color: #003063; /* Darker blue for left side, will still be visible on right */
}

.profile-image-footer {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.8);
  margin-right: 15px;
}

.footer-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.handle {
  font-size: 1.2em;
  font-weight: bold;
  color: #003063; /* Darker blue for better visibility */
}

.website {
  font-size: 1em;
  color: #0078d4; /* Azure blue */
}

/* --- Highlight Style --- */
.highlight {
  padding: 0.1em 0.3em;
  border-radius: 5px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  margin: 0 0.1em;
  color: #1f1f1f;
  font-weight: bold;
}

</style>
