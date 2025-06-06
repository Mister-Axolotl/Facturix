import express from 'express'
import Facture from './routes/Facture.mjs'
import User from './routes/User.mjs'
import prestationRoutes from './routes/Prestation.mjs'

const app = express()
const port = 3000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/factures', Facture);
app.use('/users', User);
app.use('/prestations', prestationRoutes);

app.listen(port, () => {
    console.log(`-> Facturix listening on port ${port}`)
})
