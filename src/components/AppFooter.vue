<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__grid">
        <div class="footer__col">
          <h4 class="footer__title">TattooInfo</h4>
          <p class="footer__desc">Информационный сайт о татуировках. Всё о стилях, уходе, материалах и истории тату-искусства.</p>
        </div>
        <div class="footer__col">
          <h4 class="footer__title">Разделы</h4>
          <router-link :to="{ name: 'catalog' }" class="footer__link">Все статьи</router-link>
          <router-link :to="{ name: 'about' }" class="footer__link">О сайте</router-link>
        </div>
        <div class="footer__col">
          <h4 class="footer__title">Популярное</h4>
          <router-link :to="{ name: 'category', params: { slug: 'types' } }" class="footer__link">Виды татуировок</router-link>
          <router-link :to="{ name: 'category', params: { slug: 'care' } }" class="footer__link">Уход за тату</router-link>
          <router-link :to="{ name: 'category', params: { slug: 'cost' } }" class="footer__link">Стоимость</router-link>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; {{ currentYear }} TattooInfo. Все права защищены.</p>
        <p class="footer__disclaimer">Информация носит ознакомительный характер. Перед нанесением татуировки проконсультируйтесь с мастером.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--footer-bg);
  color: rgba(255,255,255,0.8);
  padding: 48px 0 24px;
  margin-top: 64px;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer__title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
}

.footer__desc {
  font-size: 0.85rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.6);
}

.footer__link {
  display: block;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
  transition: color 0.2s;
}

.footer__link:hover {
  color: white;
}

.footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 24px;
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

.footer__disclaimer {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
