<div>
    <nav>
        <a href="/">Sobre</a>
        <a href="/mapas">Mapas</a>
        <a href="/como-ajudar">Como ajudar</a>
    </nav>
    <main>
        <slot></slot>
    </main>
</div>

<style>

    div {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: stretch;
        width: 100vw;
        height: 100vh;
    }

    nav {
        flex-basis: 64px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: var(--surface-1);
        gap: 1rem;
        padding: 0.5rem;
        box-shadow: 0px 0px 16px 0px rgba(0,0,0,0.3);
        z-index: 2;
    }

    nav a {
        color: var(--primary);
        text-decoration: none;
    }

    nav a:hover {
        text-decoration: underline;
    }

</style>