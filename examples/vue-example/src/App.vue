<template>
  <div class="container">
    <h1>Algolia Search</h1>
    
    <input
      v-model="query"
      @input="handleSearch"
      type="text"
      placeholder="Search..."
    />

    <p v-if="loading">Loading...</p>

    <div class="results">
      <div
        v-for="hit in hits"
        :key="hit.objectID"
        class="hit"
      >
        <h2>{{ hit.name }}</h2>
        <!-- Add more fields based on your AlgoliaHitType -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { searchClient } from './lib/algolia';
import type { AlgoliaHitType } from './types/algolia';

const query = ref('');
const hits = ref<AlgoliaHitType[]>([]);
const loading = ref(false);

const handleSearch = async () => {
  loading.value = true;

  try {
    const { results } = await searchClient.search([
      {
        indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME,
        query: query.value,
      },
    ]);

    hits.value = results[0].hits as AlgoliaHitType[];
  } catch (error) {
    console.error('Search error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.results {
  display: grid;
  gap: 1rem;
}

.hit {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>

