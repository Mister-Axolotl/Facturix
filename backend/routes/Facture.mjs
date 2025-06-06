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

// Fonction utilitaire pour écrire les factures
const writeFactures = async (factures) => {
    const facturesPath = path.join(__dirname, '../database/factures.json');
    await fs.writeFile(facturesPath, JSON.stringify(factures, null, 2));
};

// Fonction utilitaire pour gérer les erreurs
const handleError = (error, res, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

// GET toutes les factures
router.get('/', async (req, res) => {
    try {
        const factures = await readFactures();
        res.status(200).json(factures);
    } catch (error) {
        handleError(error, res, 'Erreur lors de la récupération des factures');
    }
});

// GET une facture par ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const factures = await readFactures();
        const facture = factures.find(facture => facture.id === parseInt(id));

        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        res.status(200).json(facture);
    } catch (error) {
        handleError(error, res, 'Erreur lors de la récupération de la facture');
    }
});

// POST nouvelle facture
router.post('/', async (req, res) => {
    const factureData = req.body;
    try {
        const factures = await readFactures();

        // Générer un nouvel ID
        const newId = factures.length > 0 ? Math.max(...factures.map(f => f.id)) + 1 : 1;

        // Créer la nouvelle facture dans l'ordre voulu
        const newFacture = {
            id: newId,
            userId: factureData.userId,
            description: factureData.description,
            date: factureData.date,
            totalHT: factureData.totalHT,
            totalTTC: factureData.totalTTC,
            tva: factureData.tva || 20
        };

        factures.push(newFacture);
        await writeFactures(factures);

        res.status(201).json({
            message: 'Facture créée avec succès',
            facture: newFacture
        });
    } catch (error) {
        handleError(error, res, 'Erreur lors de l\'enregistrement de la facture');
    }
});

// PUT modifier une facture
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedFacture = req.body;

    try {
        const factures = await readFactures();
        const index = factures.findIndex(facture => facture.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        // Conserver l'ID original
        updatedFacture.id = parseInt(id);
        factures[index] = updatedFacture;

        await writeFactures(factures);

        res.status(200).json({
            message: 'Facture modifiée avec succès',
            facture: updatedFacture
        });
    } catch (error) {
        handleError(error, res, 'Erreur lors de la modification de la facture');
    }
});

// DELETE supprimer une facture
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const factures = await readFactures();
        const index = factures.findIndex(facture => facture.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        const deletedFacture = factures[index];
        factures.splice(index, 1);
        await writeFactures(factures);

        res.status(200).json({
            message: 'Facture supprimée avec succès',
            facture: deletedFacture
        });
    } catch (error) {
        handleError(error, res, 'Erreur lors de la suppression de la facture');
    }
});

export default router;
