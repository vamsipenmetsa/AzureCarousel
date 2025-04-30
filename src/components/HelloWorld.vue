<template>
  <div class="hello-world">
    <h1 class="highlighted-text">Welcome to DevOps Carousel!</h1>
    <p class="description">This is a platform to create beautiful slides with a glassy finish.</p>
    <button class="action-button">Get Started</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello, DevOps Carousel!');
</script>

<style scoped>
.hello-world {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.highlighted-text {
  font-size: 2rem;
  color: #4a90e2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.description {
  font-size: 1.2rem;
  color: #333;
  margin: 10px 0;
}

.action-button {
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2, #d0021b);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-button:hover {
  background: linear-gradient(135deg, #d0021b, #4a90e2);
}
</style>