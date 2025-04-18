// Toggle between landing page and login page
function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showLanding() {
    document.getElementById('login-page').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Ajuste para o menu fixo
                behavior: 'smooth'
            });
            showLanding();
        }
    });
});

// Fechar o login ao clicar fora do formulário
document.getElementById('login-page').addEventListener('click', function(e) {
    if (e.target === this) {
        showLanding();
    }
});

// Prevenir fechamento ao clicar no formulário
document.querySelector('.login-container').addEventListener('click', function(e) {
    e.stopPropagation();
});

// Voltar ao clicar no ícone de robô
document.querySelectorAll('.fa-robot').forEach(icon => {
    icon.addEventListener('click', showLanding);
});


 