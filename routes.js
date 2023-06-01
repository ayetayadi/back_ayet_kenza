const ROUTES = [
    // pour le service d'authentification
    {
        url: '/authService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3001",
            changeOrigin: true,
            pathRewrite: {
                [`^/authService`]: '',
            },
        }
    },
    // pour le service de gestion des comptes
    {
        url: '/accountService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3002",
            changeOrigin: true,
            pathRewrite: {
                [`^/accountService`]: '',
            },
        }
    },

    //pour le service de gestion d'équipes
    {
        url: '/teamService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3003",
            changeOrigin: true,
            pathRewrite: {
                [`^/teamService`]: '',
            },
        }
    },

    //pour le service de gestion des campagnes
    {
        url: '/campagneService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3004",
            changeOrigin: true,
            pathRewrite: {
                [`^/campagneService`]: '',
            },
        }
    },

    //pour le service de gestion des campagnes publicitaires
    {
        url: '/campagneService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3004",
            changeOrigin: true,
            pathRewrite: {
                [`^/campagneService`]: '',
            },
        }
    },

    //pour le service de gestion des bannières
    {
        url: '/bannerService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3005",
            changeOrigin: true,
            pathRewrite: {
                [`^/bannerService`]: '',
            },
        }
    },

       //pour le service de paiement
       {
        url: '/paiementService',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 1000
        },
        proxy: {
            target: "http://localhost:3006",
            changeOrigin: true,
            pathRewrite: {
                [`^/paiementService`]: '',
            },
        }
    },

]

exports.ROUTES = ROUTES;
