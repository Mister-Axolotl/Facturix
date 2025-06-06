import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction utilitaire pour lire les factures
const readFactures = async () => {
    const facturesPath = path.join(__dirname, '../database/factures.json');
    const facturesData = await fs.readFile(facturesPath, 'utf8');
    return JSON.parse(facturesData);
};

// Fonction utilitaire pour écrire les factures avec logs
const writeFactures = async (factures) => {
    const facturesPath = path.join(__dirname, '../database/factures.json');
    try {
        console.log('Tentative d\'écriture du fichier:', facturesPath);
        await fs.writeFile(facturesPath, JSON.stringify(factures, null, 2));
        console.log('Fichier écrit avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'écriture du fichier:', error);
        throw error;
    }
};

// Fonction utilitaire pour gérer les erreurs
const handleError = (error, res, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

// GET prestations d'une facture
router.get('/facture/:factureId', async (req, res) => {
    const { factureId } = req.params;
    try {
        const factures = await readFactures();
        const facture = factures.find(f => f.id === parseInt(factureId));

        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        res.status(200).json(facture.prestations || []);
    } catch (error) {
        handleError(error, res, 'Erreur lors de la récupération des prestations');
    }
});

// POST nouvelle prestation
router.post('/', async (req, res) => {
    const { factureId, description, quantity, prixUnitaire, tva, remise, typeRemise, montantPaye } = req.body;

    try {
        if (!factureId || !description || !quantity || !prixUnitaire) {
            return res.status(400).json({
                error: 'Les champs factureId, description, quantity et prixUnitaire sont obligatoires'
            });
        }

        const factures = await readFactures();
        const factureIndex = factures.findIndex(f => f.id === parseInt(factureId));

        if (factureIndex === -1) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        // Initialiser le tableau des prestations si nécessaire
        if (!factures[factureIndex].prestations) {
            factures[factureIndex].prestations = [];
        }

        // Générer un nouvel ID pour la prestation
        const existingIds = factures[factureIndex].prestations.map(p => p.id || 0);
        const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

        const newPrestation = {
            id: newId,
            description: description.trim(),
            quantity: parseFloat(quantity),
            prixUnitaire: parseFloat(prixUnitaire),
            remise: parseFloat(remise) || 0,
            typeRemise: typeRemise || 'percentage', // 'percentage' ou 'fixed'
            montantPaye: parseFloat(montantPaye) || 0,
            tva: tva || 20,
            factureId: parseInt(factureId)
        };

        factures[factureIndex].prestations.push(newPrestation);
        await writeFactures(factures);

        res.status(201).json({
            message: 'Prestation créée avec succès',
            prestation: newPrestation
        });
    } catch (error) {
        handleError(error, res, 'Erreur lors de la création de la prestation');
    }
});

// PUT modifier une prestation
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, quantity, prixUnitaire, tva, remise, typeRemise, montantPaye } = req.body;

    try {
        console.log(`Tentative de modification de la prestation ID: ${id}`);
        console.log('Données reçues:', req.body);

        if (!description || !quantity || !prixUnitaire) {
            return res.status(400).json({
                error: 'Les champs description, quantity et prixUnitaire sont obligatoires'
            });
        }

        const factures = await readFactures();
        let prestationFound = false;
        let factureIndex = -1;
        let prestationIndex = -1;

        // Trouver la prestation dans toutes les factures
        for (let i = 0; i < factures.length; i++) {
            if (factures[i].prestations) {
                const pIndex = factures[i].prestations.findIndex(p => p.id === parseInt(id));
                if (pIndex !== -1) {
                    factureIndex = i;
                    prestationIndex = pIndex;
                    prestationFound = true;
                    console.log(`Prestation trouvée dans facture ${factures[i].id}, index ${pIndex}`);
                    break;
                }
            }
        }

        if (!prestationFound) {
            console.log('Prestation non trouvée');
            return res.status(404).json({ error: 'Prestation non trouvée' });
        }

        // Conserver l'ancienne prestation pour logs
        const oldPrestation = { ...factures[factureIndex].prestations[prestationIndex] };

        // Modifier la prestation
        const updatedPrestation = {
            ...factures[factureIndex].prestations[prestationIndex],
            description: description.trim(),
            quantity: parseFloat(quantity),
            prixUnitaire: parseFloat(prixUnitaire),
            remise: parseFloat(remise) || 0,
            typeRemise: typeRemise || 'percentage',
            montantPaye: parseFloat(montantPaye) || 0,
            tva: tva || factures[factureIndex].prestations[prestationIndex].tva || 20
        };

        console.log('Ancienne prestation:', oldPrestation);
        console.log('Nouvelle prestation:', updatedPrestation);

        factures[factureIndex].prestations[prestationIndex] = updatedPrestation;

        // Sauvegarder avec logs
        await writeFactures(factures);
        console.log('Factures sauvegardées avec succès');

        res.status(200).json({
            message: 'Prestation modifiée avec succès',
            prestation: updatedPrestation
        });
    } catch (error) {
        console.error('Erreur dans PUT prestation:', error);
        handleError(error, res, 'Erreur lors de la modification de la prestation');
    }
});

// DELETE supprimer une prestation
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const factures = await readFactures();
        let prestationFound = false;
        let factureIndex = -1;
        let prestationIndex = -1;
        let deletedPrestation = null;

        // Trouver la prestation dans toutes les factures
        for (let i = 0; i < factures.length; i++) {
            if (factures[i].prestations) {
                const pIndex = factures[i].prestations.findIndex(p => p.id === parseInt(id));
                if (pIndex !== -1) {
                    factureIndex = i;
                    prestationIndex = pIndex;
                    deletedPrestation = factures[i].prestations[pIndex];
                    prestationFound = true;
                    break;
                }
            }
        }

        if (!prestationFound) {
            return res.status(404).json({ error: 'Prestation non trouvée' });
        }

        // Supprimer la prestation
        factures[factureIndex].prestations.splice(prestationIndex, 1);
        await writeFactures(factures);

        res.status(200).json({
            message: 'Prestation supprimée avec succès',
            prestation: deletedPrestation
        });
    } catch (error) {
        handleError(error, res, 'Erreur lors de la suppression de la prestation');
    }
});

// Route de debug - GET une prestation spécifique
router.get('/debug/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const factures = await readFactures();
        let prestationFound = null;
        let factureParent = null;

        for (let facture of factures) {
            if (facture.prestations) {
                const prestation = facture.prestations.find(p => p.id === parseInt(id));
                if (prestation) {
                    prestationFound = prestation;
                    factureParent = facture;
                    break;
                }
            }
        }

        res.json({
            prestation: prestationFound,
            facture: factureParent ? { id: factureParent.id, description: factureParent.description } : null,
            found: !!prestationFound
        });
    } catch (error) {
        console.error('Erreur debug:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;