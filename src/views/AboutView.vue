<script setup>
import AdBanner from '@/components/AdBanner.vue'
</script>

<template>
  <div class="about">
    <div class="container">
      <div class="about__header">
        <h1 class="section-title">О сайте TattooInfo</h1>
        <p class="section-subtitle">Ваш надёжный гид в мире татуировок</p>
      </div>

      <div class="about__content">
        <div class="about__section">
          <h2>Что это за сайт?</h2>
          <p>TattooInfo — информационный проект, посвящённый искусству татуировки. Мы собираем и систематизируем знания о стилях татуировок, уходе за ними, используемых материалах и истории тату-культуры.</p>
        </div>

        <div class="about__section">
          <h2>Для кого этот сайт?</h2>
          <p>Для всех, кто интересуется татуировками: от новичков, которые только задумываются о первой татуировке, до опытных коллекционеров, желающих узнать больше о технике и материалах.</p>
        </div>

        <div class="about__section">
          <h2>Источники информации</h2>
          <p>Мы используем проверенные источники, включая открытые энциклопедии (Wikipedia), профессиональные публикации и опыт практикующих мастеров. Вся информация носит ознакомительный характер.</p>
        </div>

        <AdBanner type="banner" />

        <div class="about__section">
          <h2>Контакты</h2>
          <p>По вопросам сотрудничества и размещения рекламы: <a href="mailto:info@tattoinfo.ru">info@tattoinfo.ru</a></p>
        </div>

        <div class="about__disclaimer">
          <strong>Важно:</strong> Перед нанесением татуировки обязательно проконсультируйтесь с профессиональным мастером и врачом при наличии медицинских противопоказаний.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 40px 0;
}

.about__header {
  margin-bottom: 40px;
}

.about__content {
  max-width: 720px;
}

.about__section {
  margin-bottom: 32px;
}

.about__section h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.about__section p {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

.about__section a {
  color: var(--accent);
  font-weight: 500;
}

.about__section a:hover {
  text-decoration: underline;
}

.about__disclaimer {
  margin-top: 40px;
  padding: 16px 20px;
  background: var(--disclaimer-bg);
  border-radius: var(--radius);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--disclaimer-text);
  border-left: 3px solid var(--disclaimer-border);
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
