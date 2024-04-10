import express, { Express } from 'express';
import createAccount from './createAccountRoute'
import createNonExist from './createNonExistAccountRoute'
import distributor from './createNonExistAccountRoute'
import payment from './paymentRouter'
import fundDistributor from './paymentRouter'
import issuer from './setupIssuerRoute'
import trustline from './setupIssuerRoute'
import allowTrust from './setupIssuerRoute'
import session from './sessionRoute'


const app: Express = express();

app.use('/api/stellar', createAccount);
app.use('/api/stellar',createNonExist)
app.use('/api/stellar',payment)
app.use('/api/stellar',fundDistributor)
app.use('/api/stellar',issuer)
app.use('/api/stellar',trustline)
app.use('/api/stellar',allowTrust)
app.use('/api/stellar',distributor)
app.use('/api/stellar',session)


export default app;
