<template>
    <div class="home-container">
        <!-- Hero Section -->
        <div class="hero-section text-center py-5 mb-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <img src="@/assets/asterix.png" alt="Facturix Logo" class="mb-4 icon">
                        <h1 class="display-4 fw-bold text-primary mb-3">Facturix</h1>
                        <p class="lead text-muted mb-4">
                            L'application de gestion de factures simple et efficace
                        </p>
                        <div class="d-flex gap-3 justify-content-center flex-wrap">
                            <router-link to="/factures" class="btn btn-primary btn-lg">
                                <i class="fas fa-list me-2"></i>
                                Voir les factures
                            </router-link>
                            <router-link to="/factures/create" class="btn btn-outline-primary btn-lg">
                                <i class="fas fa-plus me-2"></i>
                                Nouvelle facture
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="container">
            <!-- Quick Stats or Info -->
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card bg-light border-0">
                        <div class="card-body text-center p-4">
                            <h5 class="card-title mb-3">
                                <i class="fas fa-info-circle me-2"></i>
                                À propos de Facturix
                            </h5>
                            <p class="card-text mb-2">
                                Application développée avec <strong>Vue.js</strong> et <strong>Node.js</strong>
                            </p>
                            <p class="card-text">
                                <small class="text-muted">
                                    Développé par <strong>Grégory MAJSTOROVIC</strong> • Version 1.0
                                </small>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Pas de logique nécessaire pour cette page statique
</script>

<style scoped>
.home-container {
    min-height: 80vh;
}

.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin: 0 -15px 0 -15px;
    border-radius: 15px;
}

.hero-icon {
    font-size: 4rem;
    color: rgba(255, 255, 255, 0.9);
}

.feature-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: white;
    font-size: 1.5rem;
}

.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.btn-lg {
    padding: 0.75rem 2rem;
    border-radius: 50px;
}

.text-primary {
    color: #ffffff !important;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50px;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px);
}

.btn-outline-primary {
    border: 2px solid #667eea;
    color: #ffffff;
    border-radius: 50px;
}

.btn-outline-primary:hover {
    background: #667eea;
    border-color: #667eea;
    transform: translateY(-2px);
}

.icon {
    width: 100px;
    height: 100px;
}

@media (max-width: 768px) {
    .hero-icon {
        font-size: 3rem;
    }

    .display-4 {
        font-size: 2.5rem;
    }

    .hero-section {
        margin: -1rem -15px 0 -15px;
    }
}
</style>
