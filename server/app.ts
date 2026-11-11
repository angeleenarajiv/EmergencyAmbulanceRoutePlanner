import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'] });

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/verify-incident', (req, res) => {
  const { locationDetails, severity, casualties = 1 } = req.body;
  res.json({
    verified: true,
    confidenceScore: 98.4,
    severityConfirmed: severity || 'Code Red',
    triagePriority: casualties > 1 ? 'IMMEDIATE' : 'URGENT',
    reasoning: 'Verified',
    suggestedAction: 'Dispatch',
    detectedRisks: []
  });
});

app.post('/api/chat', (req, res) => {
  const { message, role = 'cad_dispatcher' } = req.body;
  res.json({ reply: 'Echo (' + role + '): ' + message });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
