<template>
  <div id="app" class="container">
    <header class="app-header">
      <h1>Azure Carousel Generator</h1>
      <p>Create professional LinkedIn carousels for your Azure content</p>
    </header>

    <main class="main-content">
      <div class="instructions">
        <h3>How to use:</h3>
        <p>1. Each <b>---</b> creates a new slide</p>
        <p>2. Highlight important words with equals signs: <span class="highlight-example">=Azure=</span></p>
        <p>3. First slide becomes the title slide, last slide is automatically generated</p>
      </div>
      
      <textarea
        v-model="inputText"
        placeholder="Your Azure content here... 

Example:
Master Azure DevOps with these tips

---

Tip 1: =Infrastructure as Code= helps maintain consistent environments

---

Tip 2: =CI/CD pipelines= streamline your deployments"
        rows="10"
        class="text-input"
      ></textarea>

      <button @click="downloadPdf" class="generate-button" :disabled="isGenerating">
        {{ isGenerating ? 'Generating...' : 'Generate Azure Carousel' }}
      </button>

      <!-- Hidden area for rendering slides for PDF generation -->
      <div v-if="slidesForPdf.length > 0" style="position: absolute; left: -9999px; top: -9999px;">
        <div v-for="(slideContent, index) in slidesForPdf" :key="'pdf-' + index">
           <Slide
            :ref="el => { if (el) slideRefs[index] = el }" 
            :content="slideContent === 'STATIC_LAST_SLIDE_PLACEHOLDER' ? '' : slideContent" 
            :slideNumber="index + 1"
            :totalSlides="slidesForPdf.length" 
            :userName="userName"
            :handle="handle" 
            :website="website"
            :profileImageUrl="profileImageUrl"
            :isStaticLast="index === slidesForPdf.length - 1" 
            class="slide-instance-for-pdf" 
          >
          </Slide>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>Made by Vamsi Penmetsa</p>
      <a href="https://github.com/vamsipenmetsa" class="github-link" target="_blank" rel="noopener">
        <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        GitHub
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import Slide from './components/Slide.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const inputText = ref('');
const slidesForPdf = ref<string[]>([]);
const userName = ref('Vamsi Penmetsa');
const handle = ref('VamsiPenmetsa'); // Added handle
const website = ref('vamsipenmetsa.com'); // Added website
// Update the profile image path to use the correct image
const profileImageUrl = ref('/vamsipenmetsa.png');
const isGenerating = ref(false);
const slideRefs = ref<InstanceType<typeof Slide>[]>([]); // To get refs to Slide components

// Function to extract title from the first slide's content
const getTitleFromFirstSlide = (content: string): string => {
  const firstSentenceMatch = content.match(/^[^.!?]+/);
  let title = firstSentenceMatch ? firstSentenceMatch[0].trim() : 'Carousel';
  // Sanitize title for filename
  title = title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
  return title || 'Carousel';
};

const downloadPdf = async () => {
  const rawSlides = inputText.value.split('---').map(s => s.trim()).filter(s => s.length > 0);
  if (rawSlides.length === 0) {
    alert('Please enter some content.');
    return;
  }

  // Add a placeholder for the static last slide
  const slidesWithStaticLast = [...rawSlides, 'STATIC_LAST_SLIDE_PLACEHOLDER'];
  const totalSlidesCount = slidesWithStaticLast.length;

  isGenerating.value = true;
  slidesForPdf.value = slidesWithStaticLast; // Use the augmented list
  slideRefs.value = [];

  await nextTick();

  try {
    const scale = 2; 
    const slideWidth = 1080;
    const slideHeight = 1080;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [slideWidth * scale, slideHeight * scale] 
    });

    for (let i = 0; i < slidesForPdf.value.length; i++) {
      const slideElement = slideRefs.value[i]?.$el as HTMLElement;
      if (!slideElement) {
        console.error(`Could not find slide element for index ${i}`);
        continue;
      }

      const canvas = await html2canvas(slideElement, {
        scale: scale, 
        width: slideWidth,
        height: slideHeight,
        useCORS: true,
        logging: false,
        backgroundColor: null 
      });

      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage([slideWidth * scale, slideHeight * scale], 'portrait');
      }
      pdf.addImage(imgData, 'PNG', 0, 0, slideWidth * scale, slideHeight * scale);
    }

    const pdfTitle = getTitleFromFirstSlide(slidesForPdf.value[0]);
    pdf.save(`${pdfTitle}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Check console for details.');
  } finally {
    isGenerating.value = false;
    slidesForPdf.value = [];
  }
};

</script>

<style scoped>
/* Import Futura font - same as in Slide.vue */
@import url('https://fonts.googleapis.com/css2?family=Futura:wght@400;500;700&display=swap');

.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  font-family: 'Futura', 'Century Gothic', sans-serif;
  /* Apply gradient matching the slides */
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(230,245,255,0.9) 100%);
  border-radius: 16px;
  /* Enhanced shadow for depth */
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  /* Subtle border for definition */
  border: 1px solid rgba(255,255,255,0.8);
  position: relative;
  overflow: hidden;
  /* Create a subtle grid overlay like in slides */
  background-image: 
    linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(230,245,255,0.9) 100%),
    linear-gradient(rgba(13, 61, 111, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(13, 61, 111, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 20px 20px, 20px 20px;
}

/* Glassmorphism effect for header */
.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 15px 30px 30px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 15px rgba(31, 38, 135, 0.07);
}

.app-header h1 {
  font-size: 2.4em;
  font-weight: 700;
  margin-bottom: 8px;
  color: #0078d4; /* Azure blue */
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1); /* Subtle text shadow */
}

.app-header p {
  font-size: 1.1em;
  color: #003063;
  margin-top: 10px;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

/* Enhanced textarea */
.text-input {
  width: 92%;
  min-height: 200px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid rgba(0, 120, 212, 0.2);
  border-radius: 8px;
  font-size: 1.05em;
  line-height: 1.5;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.05),
    0 0 0 1px rgba(255,255,255,0.8);
  transition: all 0.3s ease;
  resize: vertical;
  color: #1a2b4d;
}

.text-input:focus {
  border-color: #0078d4;
  outline: none;
  box-shadow: 
    inset 0 1px 3px rgba(0,0,0,0.05),
    0 0 0 3px rgba(0, 120, 212, 0.1);
}

.text-input::placeholder {
  color: #89a;
}

/* Azure-themed button matching slide gradient */
.generate-button {
  padding: 14px 35px;
  background: linear-gradient(135deg, #0078d4 0%, #00baff 100%); /* Azure to light blue */
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 1.15em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 120, 212, 0.3);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 120, 212, 0.4);
}

.generate-button:active {
  transform: translateY(0);
}

.generate-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.generate-button:hover::after {
  opacity: 1;
}

.generate-button:disabled {
  background: linear-gradient(135deg, #ccc 0%, #ddd 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
  transform: none;
}

/* Footer style */
.app-footer {
  text-align: center;
  margin-top: 30px;
  padding: 20px 0 0;
  border-top: 1px solid rgba(0, 120, 212, 0.15);
  color: #003063;
  font-size: 0.95em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.app-footer p {
  margin: 0;
}

/* GitHub link styling */
.github-link {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
  color: #0078d4;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.github-link:hover {
  color: #005a9e;
}

.github-icon {
  margin-right: 5px;
}

/* PDF sizing for hidden rendering */
.slide-instance-for-pdf {
  width: 1080px;
  height: 1080px;
}

/* Instructions box with mint highlights like the slides */
.instructions {
  margin: 0 auto 25px;
  padding: 15px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 92%;
  color: #082545;
}

.instructions h3 {
  font-size: 1.1em;
  margin-top: 0;
  margin-bottom: 10px;
  color: #003063;
}

.instructions p {
  margin: 5px 0;
  font-size: 0.95em;
  line-height: 1.5;
}

.highlight-example {
  background-color: #3dd8b6;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 600;
  margin: 0 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    margin: 20px 15px;
    padding: 20px;
  }
  
  .app-header h1 {
    font-size: 2em;
  }
  
  .text-input {
    width: 100%;
  }
  
  .instructions {
    width: 100%;
  }
}
</style>