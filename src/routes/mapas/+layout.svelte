<nav>
    <a href="/mapas/">Mapa geral</a>
    <a href="/mapas/landuse">Loteamento</a>
    <a href="/mapas/landvalue">Valor por m²</a>
    <a href="/mapas/questionario/2023/qualidade-de-vida">Qualidade de vida</a>
    <a href="/mapas/questionario/2023/policiamento">Policiamento</a>
    <a href="/mapas/questionario/2023/bombeiros">Bombeiros</a>
    <a href="/mapas/questionario/2023/parques">Parques</a>
    <a href="/mapas/questionario/2023/eventos">Eventos</a>
    <a href="/mapas/questionario/2023/agua">Água municipal</a>
    <a href="/mapas/questionario/2023/esgoto-e-saneamento">Esgoto e saneamento</a>
    <a href="/mapas/questionario/2023/coleta-de-lixo">Coleta de lixo</a>
    <a href="/mapas/questionario/2023/iluminacao-publica">Iluminação pública</a>
    <a href="/mapas/questionario/2023/saude">Atendimento a saúde</a>
    <a href="/mapas/questionario/2023/biblioteca">Biblioteca</a>
  </nav>
  
  <slot></slot>

<style>
  nav {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 3rem;
      background: var(--surface-1);
  }

  nav a {
      color: var(--primary);
      text-decoration: none;
      padding: 0.5rem;
  }

  nav a+a {
    border-left: 1px solid #efefef;
  }

  nav a:hover {
      text-decoration: underline;
  }

</style>